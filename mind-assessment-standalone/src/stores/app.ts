/**
 * 应用状态管理 - 纯本地模式（无后端）
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  const platform = ref<string>('mp-weixin');
  const baseUrl = ref<string>('');

  function initPlatform() {
    // #ifdef MP-WEIXIN
    platform.value = 'mp-weixin';
    // #endif
    // #ifdef H5
    platform.value = 'h5';
    // #endif
  }

  return { platform, baseUrl, initPlatform };
});
