/**
 * 用户状态管理（Pinia + Vue 3 Composition API）
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as storage from '@/utils/storage';
import { autoLogin } from '@/utils/auth';

export const useUserStore = defineStore('user', () => {
  // -- state --
  const token = ref<string>(storage.get('token') || '');
  const openid = ref<string>(storage.get('openid') || '');
  const userInfo = ref<any>(storage.get('userInfo') || null);

  // -- getters --
  const isLoggedIn = computed(() => !!token.value);

  const authHeader = computed(() => {
    return token.value ? { Authorization: `Bearer ${token.value}` } : {};
  });

  // -- actions --
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

  async function login(): Promise<any> {
    const data = await autoLogin();
    if (data.token) setToken(data.token);
    if (data.openid) {
      openid.value = data.openid;
      storage.set('openid', data.openid);
    }
    if (data.userInfo) setUserInfo(data.userInfo);
    return data;
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
