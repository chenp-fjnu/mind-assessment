/**
 * 微信支付平台证书管理器
 *
 * 功能：
 * 1. 下载并缓存微信支付平台证书
 * 2. 按 serial 查找证书公钥
 * 3. 定期自动刷新证书（默认 12 小时）
 *
 * 使用方式：
 *   const certManager = new CertManager();
 *   await certManager.init();
 *   const cert = certManager.getCertBySerial(serial);
 *
 * P2-15: 缓存路径基于 __dirname，原子写入防止文件损坏
 */
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PAY_BASE = 'https://api.mch.weixin.qq.com';
const REFRESH_INTERVAL = 12 * 60 * 60 * 1000; // 12 小时

// P2-15: 默认缓存路径基于 __dirname，确保路径始终相对于 server 目录
const DEFAULT_CACHE_PATH = path.join(__dirname, '..', 'cert', 'platform-certs.json');

class CertManager {
  constructor() {
    this._certs = new Map(); // serial -> { cert, pem, fetchedAt }
    this._lastRefresh = 0;
    this._refreshing = null;
  }

  /**
   * 获取缓存文件路径
   * P2-15: 优先使用环境变量，但默认值基于 __dirname
   */
  _getCachePath() {
    return process.env.WX_CERT_CACHE_PATH || DEFAULT_CACHE_PATH;
  }

  /**
   * 初始化：优先从本地缓存文件加载，然后异步刷新
   */
  async init() {
    // 尝试从本地缓存加载
    const cachePath = this._getCachePath();
    try {
      if (fs.existsSync(cachePath)) {
        const raw = fs.readFileSync(cachePath, 'utf-8');
        const data = JSON.parse(raw);
        if (data.certs && Date.now() - data.fetchedAt < REFRESH_INTERVAL) {
          for (const c of data.certs) {
            this._certs.set(c.serial_no, { pem: c.cert, fetchedAt: data.fetchedAt });
          }
          this._lastRefresh = data.fetchedAt;
          return;
        }
      }
    } catch (e) {
      console.warn('加载证书缓存失败:', e.message);
    }
    // 异步刷新（不阻塞启动）
    this.refresh().catch((e) => {
      console.warn('初始证书刷新失败:', e.message);
    });
  }

  /**
   * 从微信支付 API 下载最新证书列表
   */
  async refresh() {
    // 防止并发刷新
    if (this._refreshing) return this._refreshing;

    this._refreshing = (async () => {
      try {
        const { buildAuthorization } = require('./wxpay');
        const urlPath = '/v3/certificates';
        const auth = await buildAuthorization('GET', urlPath, null);

        const { data } = await axios.get(`${PAY_BASE}${urlPath}`, {
          headers: {
            Accept: 'application/json',
            Authorization: auth,
          },
          timeout: 10000, // P1-3: 10 秒超时
        });

        const now = Date.now();
        const apiV3Key = process.env.WX_API_V3_KEY;

        for (const cert of data.data) {
          // 解密证书内容
          const decrypted = this._decryptCert(
            cert.encrypt_ciphertext,
            cert.encrypt_associated_data,
            cert.encrypt_nonce,
            apiV3Key
          );
          this._certs.set(cert.serial_no, {
            pem: decrypted,
            fetchedAt: now,
          });
        }

        this._lastRefresh = now;

        // P2-15: 原子写入缓存文件 — 先写入临时文件，再 rename，防止写入中途崩溃导致文件损坏
        const cachePath = this._getCachePath();
        const cacheDir = path.dirname(cachePath);
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

        const cacheData = {
          fetchedAt: now,
          certs: Array.from(this._certs.entries()).map(([serial, c]) => ({
            serial_no: serial,
            cert: c.pem,
          })),
        };

        const tmpPath = cachePath + '.tmp';
        fs.writeFileSync(tmpPath, JSON.stringify(cacheData, null, 2));
        // 原子重命名（同文件系统下 rename 是原子操作）
        fs.renameSync(tmpPath, cachePath);

        console.info(`证书刷新成功，共 ${this._certs.size} 张证书`);
      } finally {
        this._refreshing = null;
      }
    })();

    return this._refreshing;
  }

  /**
   * 解密证书内容（AES-256-GCM）
   */
  _decryptCert(ciphertext, associatedData, nonce, key) {
    const cipherTextBuf = Buffer.from(ciphertext, 'base64');
    const authTag = cipherTextBuf.slice(cipherTextBuf.length - 16);
    const data = cipherTextBuf.slice(0, cipherTextBuf.length - 16);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, nonce);
    decipher.setAuthTag(authTag);
    decipher.setAAD(Buffer.from(associatedData));
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  }

  /**
   * 按 serial 获取证书 PEM
   */
  getCertBySerial(serial) {
    const cert = this._certs.get(serial);
    if (!cert) return null;

    // 检查是否需要刷新（超过 REFRESH_INTERVAL）
    if (Date.now() - this._lastRefresh > REFRESH_INTERVAL) {
      this.refresh().catch(() => {});
    }

    return cert.pem;
  }

  /**
   * 检查证书是否已加载
   */
  isReady() {
    return this._certs.size > 0;
  }
}

// 单例
const certManager = new CertManager();

module.exports = certManager;
