<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { useAppStore } from "./stores/app";
import { useUserStore } from "./stores/user";

onLaunch(() => {
  console.log("App Launch");
  const appStore = useAppStore();
  appStore.initPlatform();

  // 恢复登录态
  const userStore = useUserStore();
  userStore.restoreFromStorage();
});

onShow(() => {
  console.log("App Show");
});

onHide(() => {
  console.log("App Hide");
});
</script>

<style>
/* 全局基础样式 */
page {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #1f2937;
  background-color: #f3f4f6;
}
</style>
