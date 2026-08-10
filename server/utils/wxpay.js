/**
 * 微信工具：code2session、JSAPI 统一下单、签名验证
 * 基于 微信支付 API v3
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');

const BASE = 'https://api.weixin.qq.com';
const PAY_BASE = 'https://api.mch.weixin.qq.com';

/**
 * code2session：用 wx.login 的 code 换取 openid + session_key
 */
async function code2session(code) {
  const { WX_APPID, WX_SECRET } = process.env;
  const url = `${BASE}/sns/jscode2session`;
  const { data } = await axios.get(url, {
    params: {
      appid: WX_APPID,
      secret: WX_SECRET,
      js_code: code,
      grant_type: 'authorization_code',
    },
    timeout: 5000, // P1-3: 5 秒超时，防止请求挂起
  });
  if (data.errcode) throw new Error(`code2session 失败: ${data.errmsg}`);
  return data; // { openid, session_key, unionid? }
}

/**
 * 读取商户私钥
 * P2-8: 缓存私钥内容，避免每次签名都读取文件
 */
let _privateKeyCache = null;
function loadPrivateKey() {
  if (_privateKeyCache) return _privateKeyCache;
  const p = process.env.WX_MCH_PRIVATE_KEY_PATH || './cert/apiclient_key.pem';
  _privateKeyCache = fs.readFileSync(path.resolve(p), 'utf-8');
  return _privateKeyCache;
}

/**
 * 生成随机字符串
 */
function genNonceStr(len = 32) {
  return crypto.randomBytes(len).toString('hex').slice(0, len);
}

/**
 * JSAPI 统一下单
 * https://pay.weixin.qq.com/wiki/doc/apiv3/apis/chapter3_1_1.shtml
 */
async function createJsapiOrder({ openid, amount, description, outTradeNo, notifyUrl }) {
  const url = `${PAY_BASE}/v3/pay/transactions/jsapi`;
  const body = {
    appid: process.env.WX_APPID,
    mchid: process.env.WX_MCH_ID,
    description,
    out_trade_no: outTradeNo,
    notify_url: notifyUrl || process.env.WX_NOTIFY_URL,
    amount: { total: amount, currency: 'CNY' },
    payer: { openid },
  };
  const auth = await buildAuthorization('POST', '/v3/pay/transactions/jsapi', body);
  const { data } = await axios.post(url, body, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: auth,
    },
    timeout: 10000, // P1-3: 10 秒超时，微信下单可能较慢
  });
  return data; // { prepay_id }
}

/**
 * 构造前端调起支付所需参数（含 paySign）
 */
async function buildPayParams(prepayId) {
  const appid = process.env.WX_APPID;
  const timeStamp = String(Math.floor(Date.now() / 1000));
  const nonceStr = genNonceStr();
  const pkg = `prepay_id=${prepayId}`;
  // 签名串: appid\ntimeStamp\nnonceStr\npackage\n
  const signStr = `${appid}\n${timeStamp}\n${nonceStr}\n${pkg}\n`;
  const privateKey = loadPrivateKey();
  const paySign = crypto
    .createSign('RSA-SHA256')
    .update(signStr)
    .sign(privateKey, 'base64');
  return {
    timeStamp,
    nonceStr,
    package: pkg,
    signType: 'RSA',
    paySign,
  };
}

/**
 * 构建 Authorization 头（API v3）
 */
async function buildAuthorization(method, urlPath, body) {
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = genNonceStr();
  const bodyStr = body ? JSON.stringify(body) : '';
  // 签名串: HTTP方法\n请求路径\n时间戳\n随机串\n请求体\n
  const signStr = `${method}\n${urlPath}\n${timestamp}\n${nonce}\n${bodyStr}\n`;
  const privateKey = loadPrivateKey();
  const signature = crypto
    .createSign('RSA-SHA256')
    .update(signStr)
    .sign(privateKey, 'base64');
  const mchid = process.env.WX_MCH_ID;
  const serialNo = process.env.WX_MCH_SERIAL_NO;
  return `WECHATPAY2-SHA256-RSA2048 mchid="${mchid}",nonce_str="${nonce}",timestamp="${timestamp}",serial_no="${serialNo}",signature="${signature}"`;
}

/**
 * 验证微信支付回调签名
 * 使用微信支付平台证书公钥对回调进行 RSA-SHA256 验签
 */
function verifyNotifySignature({ timestamp, nonce, serial, body, signature }) {
  if (!timestamp || !nonce || !body || !signature) return false;
  // 构造验签串
  const signStr = `${timestamp}\n${nonce}\n${body}\n`;

  // 优先使用 CertManager 获取证书
  const certManager = require('./cert-manager');
  let certPem = certManager.getCertBySerial(serial);

  if (!certPem) {
    // 回退：尝试从本地文件加载（向后兼容）
    const certPath = process.env.WX_PLATFORM_CERT_PATH;
    if (certPath) {
      try {
        certPem = fs.readFileSync(path.resolve(certPath), 'utf-8');
      } catch (e) {
        console.error('验签失败：证书加载失败:', e.message);
        return false;
      }
    } else {
      // 尝试触发证书刷新
      certManager.refresh().catch(() => {});
      console.warn('未找到证书，已触发刷新，请重试');
      return false;
    }
  }

  try {
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(signStr);
    return verifier.verify(certPem, signature, 'base64');
  } catch (e) {
    console.error('验签失败:', e.message);
    return false;
  }
}

/**
 * 解密回调中的 resource.ciphertext（AES-256-GCM）
 */
function decryptResource(ciphertext, associatedData, nonce) {
  const key = process.env.WX_API_V3_KEY;
  const cipherTextBuf = Buffer.from(ciphertext, 'base64');
  const authTag = cipherTextBuf.slice(cipherTextBuf.length - 16);
  const data = cipherTextBuf.slice(0, cipherTextBuf.length - 16);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, nonce);
  decipher.setAuthTag(authTag);
  decipher.setAAD(Buffer.from(associatedData));
  const decoded = Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  return JSON.parse(decoded);
}

module.exports = {
  code2session,
  createJsapiOrder,
  buildPayParams,
  buildAuthorization,
  verifyNotifySignature,
  decryptResource,
  genNonceStr,
};
