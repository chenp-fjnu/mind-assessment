/**
 * 应用状态管理（Pinia + Vue 3 Composition API）
 * 负责平台检测、微信浏览器判断、baseUrl 初始化
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { setBaseURL } from '@/utils/http';

export const useAppStore = defineStore('app', () => {
  // -- state --
  const platform = ref<string>('');
  const isWechatBrowser = ref<boolean>(false);
  const baseUrl = ref<string>('');

  // -- actions --
  function initPlatform() {
    // #ifdef MP-WEIXIN
    platform.value = 'mp-weixin';
    baseUrl.value = 'https://your-api-domain.com';
    // #endif

    // #ifdef H5
    platform.value = 'h5';
    baseUrl.value = 'https://your-api-domain.com';
    const ua = navigator.userAgent.toLowerCase();
    isWechatBrowser.value = /micromessenger/.test(ua);
    // #endif

    // #ifdef MP-ALIPAY
    platform.value = 'mp-alipay';
    baseUrl.value = 'https://your-api-domain.com';
    // #endif

    // #ifdef APP-PLUS
    platform.value = 'app-plus';
    baseUrl.value = 'https://your-api-domain.com';
    // #endif

    setBaseURL(baseUrl.value);
  }

  return {
    platform,
    isWechatBrowser,
    baseUrl,
    initPlatform,
  };
});
