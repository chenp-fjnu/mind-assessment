<template>
  <view class="login-container">
    <view class="login-header">
      <text class="login-icon">🧠</text>
      <text class="login-title">心智测验</text>
      <text class="login-subtitle">登录以同步您的测验记录</text>
    </view>

    <!-- #ifdef MP-WEIXIN -->
    <view class="login-box">
      <view v-if="loading" class="loading-wrap">
        <text class="loading-text">正在登录...</text>
      </view>
      <view v-else class="mp-wrap">
        <text class="mp-hint">小程序一键登录</text>
        <button
          class="btn-login"
          open-type="getPhoneNumber"
          @getphonenumber="onGetPhoneNumber"
        >
          微信手机号登录
        </button>
        <button class="btn-wechat" @click="wxLogin">微信授权登录</button>
      </view>
    </view>
    <!-- #endif -->

    <!-- #ifdef H5 -->
    <view v-if="isWechatBrowserVal" class="login-box">
      <text class="h5-hint">检测到微信环境</text>
      <button class="btn-login" @click="redirectToWechatOAuth">微信授权登录</button>
    </view>

    <view v-else class="login-box">
      <view class="input-group">
        <text class="input-label">手机号码</text>
        <input
          v-model="phone"
          type="number"
          maxlength="11"
          class="input-field"
          placeholder="请输入手机号"
        />
      </view>
      <view class="input-group">
        <text class="input-label">验证码</text>
        <view class="code-row">
          <input
            v-model="code"
            type="number"
            maxlength="6"
            class="input-field code-input"
            placeholder="请输入验证码"
          />
          <button
            class="btn-code"
            :disabled="codeCountdown > 0"
            @click="sendCode"
          >
            {{ codeCountdown > 0 ? `${codeCountdown}s` : '获取验证码' }}
          </button>
        </view>
      </view>
      <button
        class="btn-login"
        :disabled="!canLogin"
        @click="phoneLogin"
      >
        登录
      </button>
    </view>
    <!-- #endif -->

    <!-- #ifdef APP-PLUS -->
    <view class="login-box">
      <button class="btn-login" @click="appWxLogin">微信登录</button>
    </view>
    <!-- #endif -->

    <view class="login-footer">
      <text class="privacy-text">
        登录即表示您同意
        <text class="privacy-link" @click="navigateToPrivacy">《隐私政策》</text>
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import {
  mpWxLogin,
  mpPhoneLogin,
  h5WechatLogin,
  phoneLogin as apiPhoneLogin,
  sendSmsCode,
  appWxLogin,
  getUrlParam,
  isWechatBrowser,
  redirectToWechatAuth,
} from '@/utils/auth'
import { useUserStore } from '@/stores/user'

const loading = ref(false)
const phone = ref('')
const code = ref('')
const codeCountdown = ref(0)
let codeTimer: ReturnType<typeof setInterval> | null = null

const isWechatBrowserVal = ref(false)

// #ifdef H5
isWechatBrowserVal.value = isWechatBrowser()
// #endif

const canLogin = computed(() => {
  return phone.value.length === 11 && code.value.length >= 4
})

const userStore = useUserStore()

// #ifdef MP-WEIXIN
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

async function onGetPhoneNumber(e: any) {
  if (e.detail.errMsg === 'getPhoneNumber:ok') {
    loading.value = true
    try {
      const data = await mpPhoneLogin(e.detail.code)
      userStore.setToken(data.token)
      if (data.userInfo) userStore.setUserInfo(data.userInfo)
      uni.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => navigateBack(), 1200)
    } catch (err: any) {
      uni.showToast({ title: err.message || '登录失败', icon: 'none' })
    } finally {
      loading.value = false
    }
  } else {
    uni.showToast({ title: '请授权手机号', icon: 'none' })
  }
}
// #endif

// #ifdef H5
function redirectToWechatOAuth() {
  const appId = 'YOUR_WECHAT_APPID'
  const redirectUri = window.location.origin + window.location.pathname
  redirectToWechatAuth(appId, redirectUri, 'STATE')
}
// #endif

// #ifdef APP-PLUS
async function appWxLoginHandler() {
  loading.value = true
  try {
    const data = await appWxLogin()
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
// #endif

async function sendCode() {
  if (phone.value.length !== 11) {
    uni.showToast({ title: '请输入正确手机号', icon: 'none' })
    return
  }
  try {
    await sendSmsCode(phone.value)
    uni.showToast({ title: '验证码已发送', icon: 'none' })
    codeCountdown.value = 60
    codeTimer = setInterval(() => {
      codeCountdown.value--
      if (codeCountdown.value <= 0 && codeTimer) {
        clearInterval(codeTimer)
        codeTimer = null
      }
    }, 1000)
  } catch (err: any) {
    uni.showToast({ title: err.message || '发送失败', icon: 'none' })
  }
}

async function phoneLogin() {
  if (!canLogin.value) return
  loading.value = true
  try {
    const data = await apiPhoneLogin(phone.value, code.value)
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

onLoad((query: any) => {
  // #ifdef H5
  const urlCode = getUrlParam('code')
  if (urlCode && isWechatBrowser()) {
    loading.value = true
    h5WechatLogin(urlCode)
      .then((data) => {
        userStore.setToken(data.token)
        if (data.userInfo) userStore.setUserInfo(data.userInfo)
        uni.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => navigateBack(), 1200)
      })
      .catch((err) => {
        uni.showToast({ title: err.message || '登录失败', icon: 'none' })
      })
      .finally(() => {
        loading.value = false
      })
    // 清理URL
    if (window.history.replaceState) {
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }
  // #endif
})

onMounted(() => {
  // Check if already logged in
  if (userStore.isLoggedIn) {
    uni.showToast({ title: '已登录', icon: 'none' })
    setTimeout(() => navigateBack(), 800)
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

.mp-hint,
.h5-hint {
  text-align: center;
  font-size: 26rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.input-group {
  margin-bottom: 30rpx;
}

.input-label {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 10rpx;
  display: block;
}

.input-field {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.code-row {
  display: flex;
  gap: 16rpx;
}

.code-input {
  flex: 1;
}

.btn-code {
  width: 200rpx;
  height: 80rpx;
  line-height: 80rpx;
  background: #f0f0f0;
  color: #667eea;
  border-radius: 12rpx;
  font-size: 26rpx;
  border: none;
}

.btn-code[disabled] {
  color: #999;
}

.btn-login {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border-radius: 44rpx;
  font-size: 30rpx;
  border: none;
  margin-top: 10rpx;
}

.btn-login[disabled] {
  opacity: 0.6;
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
