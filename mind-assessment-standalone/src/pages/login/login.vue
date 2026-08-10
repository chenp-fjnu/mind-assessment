<template>
  <view class="login-container">
    <view class="login-header">
      <text class="login-icon">🧠</text>
      <text class="login-title">心智测验</text>
      <text class="login-subtitle">登录以保存您的测验记录</text>
    </view>

    <view class="login-box">
      <view v-if="loading" class="loading-wrap">
        <text class="loading-text">正在登录...</text>
      </view>
      <view v-else class="mp-wrap">
        <text class="mp-hint">点击下方按钮一键登录</text>
        <button class="btn-wechat" @click="wxLogin">微信一键登录</button>
      </view>
    </view>

    <view class="login-footer">
      <text class="privacy-text">
        登录即表示您同意
        <text class="privacy-link" @click="navigateToPrivacy">《隐私政策》</text>
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { mpWxLogin } from '@/utils/auth'
import { useUserStore } from '@/stores/user'

const loading = ref(false)
const userStore = useUserStore()

async function wxLogin() {
  loading.value = true
  try {
    const data = await mpWxLogin()
    userStore.setToken(data.token)
    if (data.userInfo) userStore.setUserInfo(data.userInfo)
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => navigateBack(), 1200)
  } catch (err: any) {
    uni.showToast({ title: err.message || '登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function navigateBack() {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.switchTab({ url: '/pages/hub/hub' })
  }
}

function navigateToPrivacy() {
  uni.navigateTo({ url: '/pages/privacy/privacy' })
}

onMounted(() => {
  if (userStore.isLoggedIn) {
    setTimeout(() => navigateBack(), 500)
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: #f5f6fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx 40rpx;
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60rpx;
}

.login-icon {
  font-size: 100rpx;
  margin-bottom: 20rpx;
}

.login-title {
  font-size: 44rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
}

.login-subtitle {
  font-size: 28rpx;
  color: #999;
}

.login-box {
  width: 100%;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.06);
}

.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 40rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #667eea;
}

.mp-wrap {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.mp-hint {
  text-align: center;
  font-size: 26rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.btn-wechat {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: #07c160;
  color: #ffffff;
  border-radius: 44rpx;
  font-size: 30rpx;
  border: none;
}

.login-footer {
  margin-top: 40rpx;
  text-align: center;
}

.privacy-text {
  font-size: 24rpx;
  color: #999;
}

.privacy-link {
  color: #667eea;
}
</style>
