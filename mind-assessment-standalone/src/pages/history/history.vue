<template>
  <view class="history-container">
    <!-- Filter Tabs -->
    <view class="filter-bar">
      <view
        v-for="tab in filterTabs"
        :key="tab.value"
        class="filter-tab"
        :class="{ active: currentFilter === tab.value }"
        @click="currentFilter = tab.value as 'all' | 'test' | 'game'"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <!-- List -->
    <scroll-view scroll-y class="history-scroll">
      <view v-if="filteredList.length === 0" class="empty-state">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无{{ currentFilterLabel }}记录</text>
      </view>

      <view
        v-for="record in filteredList"
        :key="record.id"
        class="history-card"
        @click="viewReport(record)"
      >
        <view class="card-main">
          <view class="record-icon">{{ record.icon }}</view>
          <view class="record-info">
            <text class="record-name">{{ record.name }}</text>
            <text class="record-date">{{ formatDate(record.date) }}</text>
          </view>
          <view class="record-right">
            <text v-if="record.score !== undefined" class="record-score">{{ record.score }}分</text>
            <text class="record-type">{{ typeLabel(record.type) }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'

interface HistoryRecord {
  id: string
  moduleId: string
  name: string
  icon: string
  date: string
  type?: 'test' | 'game'
  score?: number
}

const currentFilter = ref<'all' | 'test' | 'game'>('all')
const historyList = ref<HistoryRecord[]>([])

const filterTabs = [
  { label: '全部', value: 'all' },
  { label: '测验', value: 'test' },
  { label: '游戏', value: 'game' }
]

const currentFilterLabel = computed(() => {
  const map: Record<string, string> = { all: '', test: '测验', game: '游戏' }
  return map[currentFilter.value]
})

const filteredList = computed(() => {
  if (currentFilter.value === 'all') return historyList.value
  return historyList.value.filter(r => (r.type || 'test') === currentFilter.value)
})

function loadHistory() {
  const stored: HistoryRecord[] = uni.getStorageSync('test_history') || []
  historyList.value = stored.map(item => ({
    ...item,
    type: item.type || 'test'
  }))
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const isToday = d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  if (isToday) {
    return `今天 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }
  const yesterday = new Date(now.getTime() - 86400000)
  const isYesterday = d.getDate() === yesterday.getDate() && d.getMonth() === yesterday.getMonth() && d.getFullYear() === yesterday.getFullYear()
  if (isYesterday) {
    return `昨天 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }
  return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function typeLabel(type?: string): string {
  if (type === 'game') return '游戏'
  return '测验'
}

function viewReport(record: HistoryRecord) {
  if (record.type === 'game') {
    uni.navigateTo({
      url: `/pages/game/game?id=${record.moduleId}`
    })
  } else {
    uni.navigateTo({
      url: `/pages/report/report?id=${record.id}&moduleId=${record.moduleId}`
    })
  }
}

onShow(() => {
  loadHistory()
})
</script>

<style scoped>
.history-container {
  min-height: 100vh;
  background: #f5f6fa;
  display: flex;
  flex-direction: column;
}

.filter-bar {
  display: flex;
  background: #ffffff;
  padding: 20rpx 30rpx;
  gap: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.04);
}

.filter-tab {
  padding: 10rpx 28rpx;
  border-radius: 30rpx;
  background: #f0f0f0;
  font-size: 26rpx;
  color: #666;
}

.filter-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.history-scroll {
  flex: 1;
  padding: 20rpx 30rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.history-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.04);
  position: relative;
}

.card-main {
  display: flex;
  align-items: center;
}

.record-icon {
  font-size: 44rpx;
  margin-right: 20rpx;
}

.record-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.record-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.record-date {
  font-size: 24rpx;
  color: #999;
  margin-top: 6rpx;
}

.record-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.record-score {
  font-size: 32rpx;
  color: #667eea;
  font-weight: bold;
}

.record-type {
  font-size: 22rpx;
  color: #bbb;
  margin-top: 4rpx;
}
</style>
