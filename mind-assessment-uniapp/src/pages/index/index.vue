<template>
  <view class="launch-container">
    <view class="launch-content">
      <image class="launch-logo" src="/static/logo.png" />
      <text class="launch-title">心智测验</text>
      <text class="launch-subtitle">探索自我，发现潜能</text>
      <view class="loading-dots">
        <text class="dot">.</text>
        <text class="dot">.</text>
        <text class="dot">.</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'

onLoad(() => {
  // 启动页短暂停留后跳转到首页
  setTimeout(() => {
    uni.switchTab({
      url: '/pages/hub/hub'
    })
  }, 800)
})
</script>

<style scoped>
.launch-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.launch-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.launch-logo {
  width: 160rpx;
  height: 160rpx;
  border-radius: 32rpx;
  margin-bottom: 40rpx;
  background: #ffffff;
  padding: 20rpx;
}

.launch-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 16rpx;
}

.launch-subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 60rpx;
}

.loading-dots {
  display: flex;
  gap: 8rpx;
}

.dot {
  font-size: 48rpx;
  color: #ffffff;
  animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}
</style>
