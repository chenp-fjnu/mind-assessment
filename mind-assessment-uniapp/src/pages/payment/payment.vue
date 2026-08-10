<template>
  <view class="payment-container">
    <view class="payment-card">
      <!-- Product Info -->
      <view class="product-header">
        <text class="product-icon">{{ moduleInfo.icon }}</text>
        <view class="product-meta">
          <text class="product-name">{{ moduleInfo.name }}</text>
          <text class="product-desc">完整报告解锁</text>
        </view>
      </view>

      <view class="price-row">
        <text class="price-label">价格</text>
        <text class="price-value">¥{{ moduleInfo.price }}</text>
      </view>

      <!-- Feature List -->
      <view class="feature-section">
        <text class="section-title">解锁内容</text>
        <view class="feature-list">
          <view class="feature-item">
            <text class="feature-check">✓</text>
            <text class="feature-text">完整维度分析报告</text>
          </view>
          <view class="feature-item">
            <text class="feature-check">✓</text>
            <text class="feature-text">专业解读与建议</text>
          </view>
          <view class="feature-item">
            <text class="feature-check">✓</text>
            <text class="feature-text">历史记录永久保存</text>
          </view>
          <view class="feature-item">
            <text class="feature-check">✓</text>
            <text class="feature-text">支持多次查看与分享</text>
          </view>
        </view>
      </view>

      <!-- Payment Methods -->
      <view class="pay-method-section">
        <text class="section-title">支付方式</text>
        <view class="method-list">
          <view
            class="method-item"
            :class="{ selected: payMethod === 'wxpay' }"
            @click="payMethod = 'wxpay'"
          >
            <text class="method-icon">💚</text>
            <text class="method-name">微信支付</text>
            <view class="method-radio">
              <view v-if="payMethod === 'wxpay'" class="radio-inner"></view>
            </view>
          </view>
          <view
            class="method-item"
            :class="{ selected: payMethod === 'alipay' }"
            @click="payMethod = 'alipay'"
          >
            <text class="method-icon">💙</text>
            <text class="method-name">支付宝</text>
            <view class="method-radio">
              <view v-if="payMethod === 'alipay'" class="radio-inner"></view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Footer -->
    <view class="payment-footer">
      <view class="total-row">
        <text class="total-label">实付金额</text>
        <text class="total-value">¥{{ moduleInfo.price }}</text>
      </view>
      <button
        class="btn-pay"
        :disabled="paying"
        @click="handlePay"
      >
        <text v-if="paying">支付中...</text>
        <text v-else>立即支付</text>
      </button>
      <button class="btn-demo" @click="handleDemoPay">演示模式支付（开发用）</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { requestPayment } from '@/utils/pay'

interface ModuleInfo {
  id: string
  name: string
  icon: string
  price: number
}

const moduleId = ref('')
const recordId = ref('')
const paying = ref(false)
const payMethod = ref<'wxpay' | 'alipay'>('wxpay')

const moduleInfo = reactive<ModuleInfo>({
  id: '',
  name: '未知测验',
  icon: '📝',
  price: 0
})

function loadModuleInfo(id: string) {
  const mockModules: Record<string, ModuleInfo> = {
    'iq-2': { id: 'iq-2', name: '逻辑推理测试', icon: '🔢', price: 9.9 },
    'per-2': { id: 'per-2', name: '大五人格测试', icon: '🌈', price: 19.9 },
    'car-2': { id: 'car-2', name: '职业锚定测试', icon: '🎯', price: 29.9 },
    'mood-3': { id: 'mood-3', name: '睡眠质量测试', icon: '💤', price: 9.9 },
    'self-2': { id: 'self-2', name: '情绪智力测试', icon: '❤️', price: 9.9 }
  }
  const found = mockModules[id]
  if (found) {
    Object.assign(moduleInfo, found)
  } else {
    moduleInfo.id = id
    moduleInfo.name = '测验解锁'
    moduleInfo.price = 9.9
  }
}

async function handlePay() {
  if (paying.value) return
  paying.value = true
  try {
    await requestPayment({
      provider: payMethod.value,
      amount: moduleInfo.price,
      orderNo: `MOD_${moduleId.value}_${Date.now()}`,
      description: moduleInfo.name,
      attach: JSON.stringify({ moduleId: moduleId.value, recordId: recordId.value })
    })
    onPaySuccess()
  } catch (err: any) {
    uni.showToast({ title: err.message || '支付失败', icon: 'none' })
  } finally {
    paying.value = false
  }
}

function handleDemoPay() {
  uni.showModal({
    title: '演示模式',
    content: '模拟支付成功？',
    success: (res) => {
      if (res.confirm) {
        onPaySuccess()
      }
    }
  })
}

function onPaySuccess() {
  // mark record as paid
  const history: any[] = uni.getStorageSync('test_history') || []
  const idx = history.findIndex(r => r.id === recordId.value)
  if (idx >= 0) {
    history[idx].paid = true
    uni.setStorageSync('test_history', history)
  }
  uni.showToast({ title: '支付成功', icon: 'success' })
  setTimeout(() => {
    uni.redirectTo({
      url: `/pages/report/report?id=${recordId.value}&moduleId=${moduleId.value}`
    })
  }, 1200)
}

onLoad((query: any) => {
  moduleId.value = query?.moduleId || ''
  recordId.value = query?.id || ''
  if (!moduleId.value) {
    uni.showToast({ title: '缺少参数', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
    return
  }
  loadModuleInfo(moduleId.value)
})
</script>

<style scoped>
.payment-container {
  min-height: 100vh;
  background: #f5f6fa;
  display: flex;
  flex-direction: column;
}

.payment-card {
  flex: 1;
  margin: 30rpx;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
}

.product-header {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
  padding-bottom: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.product-icon {
  font-size: 64rpx;
  margin-right: 20rpx;
}

.product-meta {
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.product-desc {
  font-size: 26rpx;
  color: #999;
  margin-top: 4rpx;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.price-label {
  font-size: 28rpx;
  color: #666;
}

.price-value {
  font-size: 40rpx;
  color: #ff6b6b;
  font-weight: bold;
}

.feature-section {
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.feature-item {
  display: flex;
  align-items: center;
}

.feature-check {
  width: 36rpx;
  height: 36rpx;
  background: #51cf66;
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22rpx;
  margin-right: 16rpx;
}

.feature-text {
  font-size: 28rpx;
  color: #555;
}

.pay-method-section {
  margin-bottom: 20rpx;
}

.method-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.method-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border: 2rpx solid #e9ecef;
  border-radius: 16rpx;
}

.method-item.selected {
  border-color: #667eea;
  background: #f0f3ff;
}

.method-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.method-name {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.method-radio {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  border: 2rpx solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.method-item.selected .method-radio {
  border-color: #667eea;
}

.radio-inner {
  width: 18rpx;
  height: 18rpx;
  border-radius: 50%;
  background: #667eea;
}

.payment-footer {
  background: #ffffff;
  padding: 20rpx 30rpx 40rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.total-label {
  font-size: 28rpx;
  color: #666;
}

.total-value {
  font-size: 40rpx;
  color: #ff6b6b;
  font-weight: bold;
}

.btn-pay {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border-radius: 44rpx;
  font-size: 30rpx;
  border: none;
  margin-bottom: 16rpx;
}

.btn-pay[disabled] {
  opacity: 0.6;
}

.btn-demo {
  width: 100%;
  height: 72rpx;
  line-height: 72rpx;
  background: #f0f0f0;
  color: #999;
  border-radius: 36rpx;
  font-size: 26rpx;
  border: none;
}
</style>
