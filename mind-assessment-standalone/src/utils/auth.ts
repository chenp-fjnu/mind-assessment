/**
 * 跨平台登录封装 - 纯本地模式（无后端）
 * 小程序：wx.login 获取 code，本地生成伪 token
 * 不调用任何后端 API
 */
import * as storage from './storage';

const TOKEN_KEY = 'auth_token';
const OPENID_KEY = 'openid';
const USER_INFO_KEY = 'user_info';

export function saveAuth(data: { token: string; openid?: string; userInfo?: any }) {
  if (data.token) storage.set(TOKEN_KEY, data.token);
  if (data.openid) storage.set(OPENID_KEY, data.openid);
  if (data.userInfo) storage.set(USER_INFO_KEY, data.userInfo);
}

export function clearAuth() {
  storage.remove(TOKEN_KEY);
  storage.remove(OPENID_KEY);
  storage.remove(USER_INFO_KEY);
}

export function getToken(): string | null {
  return storage.get(TOKEN_KEY);
}

export function getUserInfo(): any {
  return storage.get(USER_INFO_KEY);
}

/**
 * 小程序本地登录（无后端）
 */
export function mpWxLogin(): Promise<any> {
  return new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: (res) => {
        if (res.code) {
          const fakeToken = `local_${res.code}_${Date.now()}`;
          const fakeOpenid = `local_${res.code.substring(0, 16)}`;
          const data = {
            token: fakeToken,
            openid: fakeOpenid,
            userInfo: { nickname: '微信用户', avatar: '' },
          };
          saveAuth(data);
          resolve(data);
        } else {
          reject(new Error('登录失败，未获取到 code'));
        }
      },
      fail: reject,
    });
  });
}

/**
 * 自动登录 - 纯本地模式
 */
export function autoLogin(): Promise<any> {
  return mpWxLogin();
}

/**
 * 退出登录 - 仅清除本地存储
 */
export function logout(): Promise<any> {
  clearAuth();
  return Promise.resolve();
}
