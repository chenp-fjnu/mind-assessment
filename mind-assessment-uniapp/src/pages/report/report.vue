<template>
  <view class="report-container">
    <!-- Loading -->
    <view v-if="loading" class="loading-state">
      <text>加载报告中...</text>
    </view>

    <!-- Locked State for Paid Reports -->
    <view v-else-if="isLocked" class="locked-state">
      <view class="lock-icon">🔒</view>
      <text class="lock-title">完整报告已锁定</text>
      <text class="lock-desc">解锁后即可查看详细分析与维度解读</text>
      <button class="btn-unlock" @click="navigateToPayment">立即解锁</button>
      <text class="lock-hint">支持微信支付，安全便捷</text>
    </view>

    <!-- Report Content -->
    <view v-else class="report-content">
      <!-- Header -->
      <view class="report-header">
        <text class="report-module">{{ record.name }}</text>
        <text class="report-date">{{ formatDate(record.date) }}</text>
      </view>

      <!-- Score Layout -->
      <view class="score-section">
        <view class="score-circle" :style="record.levelColor ? { borderColor: record.levelColor } : {}">
          <text class="score-num">{{ primaryValue }}</text>
          <text class="score-label">{{ primaryLabel }}{{ primarySuffix }}</text>
        </view>
        <text class="score-interpretation">{{ scoreInterpretation }}</text>
      </view>

      <!-- Groups / Dimensions -->
      <view v-if="displayGroups.length > 0" class="dimensions-section">
        <text class="section-title">维度分析</text>
        <view
          v-for="dim in displayGroups"
          :key="dim.key || dim.label"
          class="dimension-item"
        >
          <view class="dim-header">
            <text class="dim-name">{{ dim.label || dim.name }}</text>
            <text class="dim-score">{{ dim.display || (dim.score + '分') }}</text>
          </view>
          <view class="dim-bar">
            <view class="dim-fill" :style="{ width: (dim.percent || Math.min(dim.score * 10, 100)) + '%' }"></view>
          </view>
        </view>
      </view>

      <!-- Interpretations -->
      <view v-if="displayInterpretations.length > 0" class="interpretation-section">
        <text class="section-title">结果解读</text>
        <view
          v-for="(interp, idx) in displayInterpretations"
          :key="idx"
          class="interp-card"
        >
          <text v-if="interp.title" class="interp-level">{{ interp.title }}</text>
          <text v-else-if="interp.level" class="interp-level">{{ interp.level }}</text>
          <text class="interp-text">{{ interp.text }}</text>
        </view>
      </view>

      <!-- Crisis Banner for Mood Tests -->
      <view v-if="isMoodTest && showCrisisBanner" class="crisis-banner">
        <text class="crisis-title">温馨提示</text>
        <text class="crisis-text">
          根据您的回答，您可能正处于情绪低落状态。如果这种感觉持续存在，建议寻求专业帮助。
        </text>
        <view class="crisis-actions">
          <text class="crisis-phone" @click="callHotline">心理援助热线：400-161-9995</text>
        </view>
      </view>

      <!-- Actions -->
      <view class="report-actions">
        <button class="btn-share" @click="shareReport">分享结果</button>
        <button class="btn-back" @click="backToHome">返回首页</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getModule } from '@/modules/module-system'

interface Dimension {
  name: string
  score: number
}

interface Interpretation {
  title?: string
  level?: string
  text: string
}

interface HistoryRecord {
  id: string
  moduleId: string
  name: string
  icon: string
  date: string
  score?: number
  level?: string
  levelColor?: string
  dimensions?: Dimension[]
  interpretations?: Interpretation[]
  resultLayout?: any
  result?: any
  groupList?: any[]
  moduleType?: string
  paid?: boolean
  price?: number
}

const loading = ref(true)
const recordId = ref('')
const moduleId = ref('')
const record = ref<HistoryRecord>({
  id: '',
  moduleId: '',
  name: '',
  icon: '📝',
  date: ''
})
const isLocked = ref(false)

const layout = computed(() => record.value.resultLayout || {})
const primaryField = computed(() => layout.value.primaryField || 'score')
const primaryLabel = computed(() => layout.value.primaryLabel || '总分')
const primarySuffix = computed(() => layout.value.primarySuffix || '')
const primaryValue = computed(() => {
  if (record.value.result && record.value.result[primaryField.value] !== undefined) {
    return record.value.result[primaryField.value]
  }
  return record.value.score || 0
})

const displayGroups = computed(() => {
  if (record.value.groupList && record.value.groupList.length) {
    return record.value.groupList
  }
  if (record.value.dimensions) {
    return record.value.dimensions.map((d: any) => ({
      label: d.name,
      display: `${d.score}分`,
      percent: Math.min(d.score * 10, 100),
    }))
  }
  return []
})

const displayInterpretations = computed(() => {
  if (record.value.interpretations && record.value.interpretations.length) {
    return record.value.interpretations
  }
  return []
})

const isMoodTest = computed(() => {
  if (record.value.moduleType) return record.value.moduleType === 'mood'
  return record.value.name?.includes('抑郁') || record.value.name?.includes('焦虑')
})

const showCrisisBanner = computed(() => {
  if (!isMoodTest.value) return false
  const r = record.value.result
  if (r) {
    // SDS: index >= 50, SAS: index >= 50
    const idx = r.index || r.score || record.value.score || 0
    return idx >= 50
  }
  return false
})

const scoreInterpretation = computed(() => {
  if (record.value.level) return record.value.level
  if (record.value.result?.description) return record.value.result.description
  const s = record.value.score || 0
  if (s >= 120) return '优秀水平，表现非常出色'
  if (s >= 100) return '良好水平，高于平均水平'
  if (s >= 80) return '中等水平，处于正常范围'
  if (s >= 60) return '及格水平，仍有提升空间'
  return '建议加强相关能力训练'
})

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function loadRecord() {
  loading.value = true
  const history: HistoryRecord[] = uni.getStorageSync('test_history') || []
  const found = history.find(r => r.id === recordId.value)
  if (found) {
    record.value = found
    // 从模块系统获取价格信息
    const mod = getModule(found.moduleId)
    const price = found.price ?? mod?.price ?? 0
    const paid = found.paid || false
    if (price > 0 && !paid) {
      isLocked.value = true
    } else {
      isLocked.value = false
    }
  } else {
    uni.showToast({ title: '记录不存在', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
  }
  loading.value = false
}

function navigateToPayment() {
  uni.navigateTo({
    url: `/pages/payment/payment?moduleId=${moduleId.value}&id=${recordId.value}`
  })
}

function shareReport() {
  // #ifdef MP-WEIXIN
  uni.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline']
  })
  // #endif
  // #ifdef H5
  if (navigator.share) {
    navigator.share({
      title: `我在心智测验完成了${record.value.name}`,
      text: `得分：${record.value.score || 'N/A'}`,
      url: window.location.href
    }).catch(() => {
      uni.showToast({ title: '分享失败', icon: 'none' })
    })
  } else {
    uni.showToast({ title: '请使用浏览器分享功能', icon: 'none' })
  }
  // #endif
}

function backToHome() {
  uni.switchTab({ url: '/pages/hub/hub' })
}

function callHotline() {
  uni.makePhoneCall({
    phoneNumber: '4001619995',
    fail: () => {
      uni.showModal({
        title: '心理援助热线',
        content: '400-161-9995',
        showCancel: false
      })
    }
  })
}

onLoad((query: any) => {
  recordId.value = query?.id || ''
  moduleId.value = query?.moduleId || ''
  if (!recordId.value) {
    uni.showToast({ title: '缺少参数', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
    return
  }
  loadRecord()
})

onShow(() => {
  if (recordId.value) {
    loadRecord()
  }
})
</script>

<style scoped>
.report-container {
  min-height: 100vh;
  background: #f5f6fa;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: #999;
}

.locked-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 60rpx;
}

.lock-icon {
  font-size: 100rpx;
  margin-bottom: 30rpx;
}

.lock-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.lock-desc {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 40rpx;
  text-align: center;
}

.btn-unlock {
  width: 80%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border-radius: 44rpx;
  font-size: 30rpx;
  border: none;
  margin-bottom: 20rpx;
}

.lock-hint {
  font-size: 24rpx;
  color: #bbb;
}

.report-content {
  padding: 30rpx;
}

.report-header {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 20rpx;
  text-align: center;
}

.report-module {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.report-date {
  font-size: 24rpx;
  color: #999;
}

.score-section {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 60rpx 40rpx;
  margin-bottom: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-circle {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 30rpx;
}

.score-num {
  font-size: 64rpx;
  font-weight: bold;
  color: #ffffff;
}

.score-label {
  font-size: 24rpx;
  color: rgba(255,255,255,0.9);
}

.score-interpretation {
  font-size: 28rpx;
  color: #666;
}

.dimensions-section {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.dimension-item {
  margin-bottom: 24rpx;
}

.dim-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.dim-name {
  font-size: 28rpx;
  color: #333;
}

.dim-score {
  font-size: 28rpx;
  color: #667eea;
  font-weight: bold;
}

.dim-bar {
  height: 16rpx;
  background: #e9ecef;
  border-radius: 8rpx;
  overflow: hidden;
}

.dim-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 8rpx;
  transition: width 0.5s;
}

.interpretation-section {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.interp-card {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.interp-level {
  font-size: 26rpx;
  color: #667eea;
  font-weight: bold;
  margin-bottom: 8rpx;
  display: block;
}

.interp-text {
  font-size: 28rpx;
  color: #555;
  line-height: 1.6;
}

.crisis-banner {
  background: #fff3cd;
  border: 2rpx solid #ffeaa7;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.crisis-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #856404;
  display: block;
  margin-bottom: 10rpx;
}

.crisis-text {
  font-size: 26rpx;
  color: #856404;
  line-height: 1.6;
  display: block;
  margin-bottom: 16rpx;
}

.crisis-actions {
  display: flex;
  justify-content: flex-start;
}

.crisis-phone {
  font-size: 28rpx;
  color: #667eea;
  text-decoration: underline;
}

.report-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 20rpx;
}

.btn-share {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  background: #ffffff;
  color: #667eea;
  border: 2rpx solid #667eea;
  border-radius: 44rpx;
  font-size: 30rpx;
}

.btn-back {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border-radius: 44rpx;
  font-size: 30rpx;
  border: none;
}
</style>
