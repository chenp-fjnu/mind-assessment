/**
 * 用户状态管理 - 纯本地模式（无后端）
 * 使用 wx.login 获取 openid，本地生成伪 token
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as storage from '@/utils/storage';

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(storage.get('token') || '');
  const openid = ref<string>(storage.get('openid') || '');
  const userInfo = ref<any>(storage.get('userInfo') || null);

  const isLoggedIn = computed(() => !!openid.value);

  const authHeader = computed(() => ({}));

  function setToken(val: string) {
    token.value = val;
    storage.set('token', val);
  }

  function setUserInfo(info: any) {
    userInfo.value = info;
    storage.set('userInfo', info);
  }

  function restoreFromStorage() {
    token.value = storage.get('token') || '';
    openid.value = storage.get('openid') || '';
    userInfo.value = storage.get('userInfo') || null;
  }

  /**
   * 本地登录：wx.login 获取 code，生成本地 token
   */
  async function login(): Promise<any> {
    return new Promise((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: (res) => {
          if (res.code) {
            // 纯本地模式：用 code 生成伪 token，不调后端
            const fakeToken = `local_${res.code}_${Date.now()}`;
            const fakeOpenid = `local_${res.code.substring(0, 16)}`;
            token.value = fakeToken;
            openid.value = fakeOpenid;
            storage.set('token', fakeToken);
            storage.set('openid', fakeOpenid);
            const info = { nickname: '微信用户', avatar: '' };
            userInfo.value = info;
            storage.set('userInfo', info);
            resolve({ token: fakeToken, openid: fakeOpenid, userInfo: info });
          } else {
            reject(new Error('登录失败，未获取到 code'));
          }
        },
        fail: reject,
      });
    });
  }

  function logout() {
    token.value = '';
    openid.value = '';
    userInfo.value = null;
    storage.remove('token');
    storage.remove('openid');
    storage.remove('userInfo');
  }

  return {
    token,
    openid,
    userInfo,
    isLoggedIn,
    authHeader,
    setToken,
    setUserInfo,
    restoreFromStorage,
    login,
    logout,
  };
});
