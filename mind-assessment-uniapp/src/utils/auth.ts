/**
 * 跨平台登录封装
 * - 小程序：uni.login 获取 code 后调 /api/auth/wx-login
 * - H5 微信：检测 MicroMessenger，提取 URL code 后调 /api/auth/h5-wechat-login
 * - H5 非微信：手机号 + 验证码登录 /api/auth/phone-login
 * - 短信验证码：/api/auth/send-sms
 */
import { http } from './http';
import * as storage from './storage';

const TOKEN_KEY = 'auth_token';
const OPENID_KEY = 'openid';
const USER_INFO_KEY = 'user_info';

/**
 * 从 URL 参数中获取指定 name 的值（仅 H5）
 */
export function getUrlParam(name: string): string | null {
  // #ifdef H5
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
  // #endif

  // #ifndef H5
  return null;
  // #endif
}

/**
 * 跳转至微信 OAuth2 授权页（仅 H5）
 */
export function redirectToWechatAuth(appid: string, redirectUri: string, state?: string): void {
  // #ifdef H5
  const scope = 'snsapi_userinfo';
  const uri = encodeURIComponent(redirectUri);
  const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${uri}&response_type=code&scope=${scope}&state=${state || ''}#wechat_redirect`;
  window.location.href = url;
  // #endif
}

/**
 * 是否在微信浏览器中（仅 H5）
 */
export function isWechatBrowser(): boolean {
  // #ifdef H5
  const ua = navigator.userAgent.toLowerCase();
  return /micromessenger/.test(ua);
  // #endif
  return false;
}

/**
 * 保存登录凭证
 */
export function saveAuth(data: { token: string; openid?: string; userInfo?: any }) {
  if (data.token) {
    storage.set(TOKEN_KEY, data.token);
  }
  if (data.openid) {
    storage.set(OPENID_KEY, data.openid);
  }
  if (data.userInfo) {
    storage.set(USER_INFO_KEY, data.userInfo);
  }
}

/**
 * 清除登录凭证
 */
export function clearAuth() {
  storage.remove(TOKEN_KEY);
  storage.remove(OPENID_KEY);
  storage.remove(USER_INFO_KEY);
}

/**
 * 获取本地存储的 token
 */
export function getToken(): string | null {
  return storage.get(TOKEN_KEY);
}

/**
 * 获取本地存储的用户信息
 */
export function getUserInfo(): any {
  return storage.get(USER_INFO_KEY);
}

// ==================== 登录 API ====================

/**
 * 小程序微信登录
 */
export function mpWxLogin(): Promise<any> {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    uni.login({
      provider: 'weixin',
      success: (res) => {
        if (res.code) {
          http
            .post('/api/auth/wx-login', { code: res.code, platform: 'mp' })
            .then((data: any) => {
              saveAuth(data);
              resolve(data);
            })
            .catch(reject);
        } else {
          reject(new Error('登录失败，未获取到 code'));
        }
      },
      fail: reject,
    });
    // #endif

    // #ifndef MP-WEIXIN
    reject(new Error('非小程序环境'));
    // #endif
  });
}

/**
 * H5 微信 OAuth2 登录（通过 URL code）
 */
export function h5WechatLogin(code: string): Promise<any> {
  return http
    .post('/api/auth/h5-wechat-login', { code, platform: 'h5' })
    .then((data: any) => {
      saveAuth(data);
      return data;
    });
}

/**
 * 手机号 + 验证码登录
 */
export function phoneLogin(phone: string, code: string): Promise<any> {
  return http
    .post('/api/auth/phone-login', { phone, code, platform: 'h5' })
    .then((data: any) => {
      saveAuth(data);
      return data;
    });
}

/**
 * 发送短信验证码
 */
export function sendSmsCode(phone: string): Promise<any> {
  return http.post('/api/auth/send-sms', { phone });
}

/**
 * 小程序手机号一键登录（通过 getPhoneNumber 获取的 code）
 */
export function mpPhoneLogin(phoneCode: string): Promise<any> {
  return http
    .post('/api/auth/wx-phone-login', { phoneCode, platform: 'mp' })
    .then((data: any) => {
      saveAuth(data);
      return data;
    });
}

/**
 * APP 微信登录
 */
export function appWxLogin(): Promise<any> {
  return new Promise((resolve, reject) => {
    // #ifdef APP-PLUS
    uni.login({
      provider: 'weixin',
      success: (res) => {
        if (res.code) {
          http
            .post('/api/auth/wx-login', { code: res.code, platform: 'app' })
            .then((data: any) => {
              saveAuth(data);
              resolve(data);
            })
            .catch(reject);
        } else {
          reject(new Error('登录失败'));
        }
      },
      fail: reject,
    });
    // #endif

    // #ifndef APP-PLUS
    reject(new Error('非 APP 环境'));
    // #endif
  });
}

/**
 * 刷新 Token
 */
export function refreshToken(): Promise<any> {
  const token = getToken();
  if (!token) {
    return Promise.reject(new Error('No token'));
  }
  return http
    .post('/api/auth/refresh', {}, { Authorization: `Bearer ${token}` })
    .then((data: any) => {
      if (data.token) {
        storage.set(TOKEN_KEY, data.token);
      }
      return data;
    });
}

/**
 * 退出登录
 */
export function logout(): Promise<any> {
  const token = getToken();
  clearAuth();
  if (token) {
    return http
      .post('/api/auth/logout', {}, { Authorization: `Bearer ${token}` })
      .catch(() => {
        // ignore logout api error
      });
  }
  return Promise.resolve();
}

/**
 * 自动登录（根据平台选择合适的方式）
 */
export function autoLogin(): Promise<any> {
  // #ifdef MP-WEIXIN
  return mpWxLogin();
  // #endif

  // #ifdef H5
  const code = getUrlParam('code');
  if (code && isWechatBrowser()) {
    return h5WechatLogin(code as string);
  }
  return Promise.reject(new Error('PHONE_LOGIN_REQUIRED'));
  // #endif

  // #ifdef APP-PLUS
  return appWxLogin();
  // #endif

  return Promise.reject(new Error('Unsupported platform'));
}
