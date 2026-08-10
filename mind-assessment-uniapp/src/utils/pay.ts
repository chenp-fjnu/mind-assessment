/**
 * Payment utilities for cross-platform handling
 * Supports MP-WEIXIN, H5 (WeChat JSAPI / H5 / Alipay), and APP-PLUS
 */

import { http } from './http';

export interface PaymentOrder {
  provider: 'wxpay' | 'alipay';
  amount: number;
  orderNo: string;
  description: string;
  attach?: string;
}

export interface WxJsapiConfig {
  appId: string;
  timeStamp: string;
  nonceStr: string;
  package: string;
  signType: string;
  paySign: string;
}

/**
 * Load WeChat JSSDK (H5 only)
 */
export function loadWechatJSSDK(): Promise<void> {
  // #ifdef H5
  return new Promise((resolve, reject) => {
    if ((window as any).wx) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load WeChat JSSDK'));
    document.head.appendChild(script);
  });
  // #endif

  // #ifndef H5
  return Promise.resolve();
  // #endif
}

/**
 * Initialize WeChat JSSDK config (H5 only)
 */
export async function initWxJSSDK(): Promise<void> {
  // #ifdef H5
  await loadWechatJSSDK();
  const url = window.location.href.split('#')[0];
  const config = await http.post<any>('/api/pay/wx-jsconfig', { url });
  const wx = (window as any).wx;
  wx.config({
    debug: false,
    appId: config.appId,
    timestamp: config.timestamp,
    nonceStr: config.nonceStr,
    signature: config.signature,
    jsApiList: ['chooseWXPay'],
  });
  return new Promise((resolve, reject) => {
    wx.ready(() => resolve());
    wx.error((err: any) => reject(err));
  });
  // #endif

  // #ifndef H5
  return Promise.resolve();
  // #endif
}

/**
 * Request payment across platforms
 */
export async function requestPayment(order: PaymentOrder): Promise<void> {
  // #ifdef MP-WEIXIN
  // Step 1: Call backend to create order and get prepay params
  const prepayMp = await http.post<any>('/api/pay/create', {
    provider: 'wxpay',
    amount: order.amount,
    orderNo: order.orderNo,
    description: order.description,
    attach: order.attach,
    platform: 'mp',
  });

  return new Promise((resolve, reject) => {
    uni.requestPayment({
      provider: 'wxpay',
      timeStamp: prepayMp.timeStamp,
      nonceStr: prepayMp.nonceStr,
      package: prepayMp.package,
      signType: prepayMp.signType || 'RSA',
      paySign: prepayMp.paySign,
      success: () => resolve(),
      fail: (err: any) => reject(new Error(err.errMsg || '支付失败')),
    });
  });
  // #endif

  // #ifdef H5
  const ua = navigator.userAgent.toLowerCase();
  const isWechat = /micromessenger/.test(ua);

  if (isWechat) {
    // WeChat JSAPI Pay
    await initWxJSSDK();
    const prepayH5Wx = await http.post<any>('/api/pay/create', {
      provider: 'wxpay',
      amount: order.amount,
      orderNo: order.orderNo,
      description: order.description,
      attach: order.attach,
      platform: 'h5_jsapi',
      openid: uni.getStorageSync('openid') || '',
    });

    const wx = (window as any).wx;
    return new Promise((resolve, reject) => {
      wx.chooseWXPay({
        timestamp: prepayH5Wx.timeStamp,
        nonceStr: prepayH5Wx.nonceStr,
        package: prepayH5Wx.package,
        signType: prepayH5Wx.signType || 'RSA',
        paySign: prepayH5Wx.paySign,
        success: () => resolve(),
        fail: (err: any) => reject(new Error(err.errMsg || '支付失败')),
      });
    });
  } else {
    // H5 external browser - use WeChat H5 pay or Alipay
    const prepayH5Mweb = await http.post<any>('/api/pay/create', {
      provider: order.provider,
      amount: order.amount,
      orderNo: order.orderNo,
      description: order.description,
      attach: order.attach,
      platform: 'h5_mweb',
    });

    if (order.provider === 'wxpay' && prepayH5Mweb.mwebUrl) {
      window.location.href = prepayH5Mweb.mwebUrl;
      return Promise.resolve();
    } else if (order.provider === 'alipay' && prepayH5Mweb.form) {
      // Alipay form submission
      const div = document.createElement('div');
      div.innerHTML = prepayH5Mweb.form;
      document.body.appendChild(div);
      const formEl = div.querySelector('form');
      formEl?.submit();
      return Promise.resolve();
    } else {
      return Promise.reject(new Error('不支持的支付方式'));
    }
  }
  // #endif

  // #ifdef APP-PLUS
  const prepayApp = await http.post<any>('/api/pay/create', {
    provider: order.provider,
    amount: order.amount,
    orderNo: order.orderNo,
    description: order.description,
    attach: order.attach,
    platform: 'app',
  });

  return new Promise((resolve, reject) => {
    uni.requestPayment({
      provider: order.provider,
      orderInfo: prepayApp.orderInfo,
      success: () => resolve(),
      fail: (err: any) => reject(new Error(err.message || '支付失败')),
    });
  });
  // #endif

  // #ifndef MP-WEIXIN | H5 | APP-PLUS
  // Fallback for other platforms - mock payment
  return new Promise((resolve, reject) => {
    uni.showModal({
      title: '模拟支付',
      content: `确认支付 ¥${order.amount}？`,
      success: (res) => {
        if (res.confirm) {
          resolve();
        } else {
          reject(new Error('用户取消支付'));
        }
      },
    });
  });
  // #endif
}

/**
 * Check if running inside WeChat browser
 */
export function checkWechatBrowser(): boolean {
  // #ifdef H5
  const ua = navigator.userAgent.toLowerCase();
  return /micromessenger/.test(ua);
  // #endif
  return false;
}

/**
 * Check current platform
 */
export function getPlatform(): string {
  // #ifdef MP-WEIXIN
  return 'mp-weixin';
  // #endif
  // #ifdef H5
  return 'h5';
  // #endif
  // #ifdef APP-PLUS
  return 'app';
  // #endif
  return 'unknown';
}

/**
 * Query order status
 */
export function queryOrderStatus(orderNo: string): Promise<any> {
  return http.get('/api/pay/status', { orderNo });
}

function generateNonceStr(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
