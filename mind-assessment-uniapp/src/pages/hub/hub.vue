<template>
  <view class="hub-container">
    <!-- Hero Banner -->
    <view class="hero-banner">
      <view class="hero-content">
        <text class="hero-title">心智测验</text>
        <text class="hero-subtitle">探索自我，发现潜能</text>
        <view class="hero-search" @click="onSearch">
          <text class="search-placeholder">搜索测验、游戏...</text>
        </view>
      </view>
    </view>

    <!-- Stats Counter -->
    <view class="stats-bar">
      <view class="stat-item">
        <text class="stat-num">{{ stats.totalTests }}</text>
        <text class="stat-label">测验</text>
      </view>
      <view class="stat-item">
        <text class="stat-num">{{ stats.totalGames }}</text>
        <text class="stat-label">游戏</text>
      </view>
      <view class="stat-item">
        <text class="stat-num">{{ stats.completed }}</text>
        <text class="stat-label">已完成</text>
      </view>
    </view>

    <!-- Category Sections -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">智力测验</text>
        <text class="section-more" @click="navigateToCategory('intelligence')">更多 ></text>
      </view>
      <view class="card-grid">
        <view
          v-for="item in intelligenceList"
          :key="item.id"
          class="test-card"
          @click="navigateToTest(item.id)"
        >
          <view class="card-icon">{{ item.icon }}</view>
          <text class="card-name">{{ item.name }}</text>
          <text class="card-desc">{{ item.desc }}</text>
          <view class="card-meta">
            <text class="meta-item">{{ item.duration }}分钟</text>
            <text class="meta-item">{{ item.questionCount }}题</text>
          </view>
          <view v-if="item.price > 0" class="card-price">¥{{ item.price }}</view>
          <view v-else class="card-free">免费</view>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">人格测验</text>
        <text class="section-more" @click="navigateToCategory('personality')">更多 ></text>
      </view>
      <view class="card-grid">
        <view
          v-for="item in personalityList"
          :key="item.id"
          class="test-card"
          @click="navigateToTest(item.id)"
        >
          <view class="card-icon">{{ item.icon }}</view>
          <text class="card-name">{{ item.name }}</text>
          <text class="card-desc">{{ item.desc }}</text>
          <view class="card-meta">
            <text class="meta-item">{{ item.duration }}分钟</text>
            <text class="meta-item">{{ item.questionCount }}题</text>
          </view>
          <view v-if="item.price > 0" class="card-price">¥{{ item.price }}</view>
          <view v-else class="card-free">免费</view>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">情绪状态</text>
        <text class="section-more" @click="navigateToCategory('mood')">更多 ></text>
      </view>
      <view class="card-grid">
        <view
          v-for="item in moodList"
          :key="item.id"
          class="test-card"
          @click="navigateToTest(item.id)"
        >
          <view class="card-icon">{{ item.icon }}</view>
          <text class="card-name">{{ item.name }}</text>
          <text class="card-desc">{{ item.desc }}</text>
          <view class="card-meta">
            <text class="meta-item">{{ item.duration }}分钟</text>
            <text class="meta-item">{{ item.questionCount }}题</text>
          </view>
          <view v-if="item.price > 0" class="card-price">¥{{ item.price }}</view>
          <view v-else class="card-free">免费</view>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">职业发展</text>
        <text class="section-more" @click="navigateToCategory('career')">更多 ></text>
      </view>
      <view class="card-grid">
        <view
          v-for="item in careerList"
          :key="item.id"
          class="test-card"
          @click="navigateToTest(item.id)"
        >
          <view class="card-icon">{{ item.icon }}</view>
          <text class="card-name">{{ item.name }}</text>
          <text class="card-desc">{{ item.desc }}</text>
          <view class="card-meta">
            <text class="meta-item">{{ item.duration }}分钟</text>
            <text class="meta-item">{{ item.questionCount }}题</text>
          </view>
          <view v-if="item.price > 0" class="card-price">¥{{ item.price }}</view>
          <view v-else class="card-free">免费</view>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">自我探索</text>
        <text class="section-more" @click="navigateToCategory('self')">更多 ></text>
      </view>
      <view class="card-grid">
        <view
          v-for="item in selfList"
          :key="item.id"
          class="test-card"
          @click="navigateToTest(item.id)"
        >
          <view class="card-icon">{{ item.icon }}</view>
          <text class="card-name">{{ item.name }}</text>
          <text class="card-desc">{{ item.desc }}</text>
          <view class="card-meta">
            <text class="meta-item">{{ item.duration }}分钟</text>
            <text class="meta-item">{{ item.questionCount }}题</text>
          </view>
          <view v-if="item.price > 0" class="card-price">¥{{ item.price }}</view>
          <view v-else class="card-free">免费</view>
        </view>
      </view>
    </view>

    <!-- Games Section -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">脑力游戏</text>
        <text class="section-more" @click="navigateToGames">更多 ></text>
      </view>
      <view class="game-list">
        <view
          v-for="game in gameList"
          :key="game.id"
          class="game-item"
          @click="navigateToGame(game.id)"
        >
          <view class="game-icon">{{ game.icon }}</view>
          <view class="game-info">
            <text class="game-name">{{ game.name }}</text>
            <text class="game-desc">{{ game.desc }}</text>
          </view>
          <view class="game-arrow">></view>
        </view>
      </view>
    </view>

    <!-- Recent History -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">最近记录</text>
        <text class="section-more" @click="navigateToHistory">全部 ></text>
      </view>
      <view v-if="recentHistory.length === 0" class="empty-tip">
        <text>暂无记录，快去测验吧</text>
      </view>
      <view
        v-for="record in recentHistory"
        :key="record.id"
        class="history-item"
        @click="navigateToReport(record.id, record.moduleId)"
      >
        <view class="history-icon">{{ record.icon }}</view>
        <view class="history-info">
          <text class="history-name">{{ record.name }}</text>
          <text class="history-time">{{ formatDate(record.date) }}</text>
        </view>
        <view class="history-score" v-if="record.score !== undefined">
          <text>{{ record.score }}分</text>
        </view>
      </view>
    </view>

    <!-- Bottom Spacer -->
    <view class="bottom-spacer"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { listGrouped, getCard } from '@/modules/module-system'

interface TestItem {
  id: string
  icon: string
  name: string
  desc: string
  duration: number
  questionCount: number
  price: number
  category: string
}

interface GameItem {
  id: string
  icon: string
  name: string
  desc: string
}

interface HistoryRecord {
  id: string
  moduleId: string
  icon: string
  name: string
  date: string
  score?: number
}

interface Stats {
  totalTests: number
  totalGames: number
  completed: number
}

const stats = reactive<Stats>({
  totalTests: 0,
  totalGames: 0,
  completed: 0
})

const intelligenceList = ref<TestItem[]>([])
const personalityList = ref<TestItem[]>([])
const moodList = ref<TestItem[]>([])
const careerList = ref<TestItem[]>([])
const selfList = ref<TestItem[]>([])
const gameList = ref<GameItem[]>([])
const recentHistory = ref<HistoryRecord[]>([])

const GAME_LIST: GameItem[] = [
  { id: 'schulte', icon: '🎯', name: '舒尔特方格', desc: '专注力训练' },
  { id: 'stroop', icon: '🎨', name: '斯特鲁普', desc: '抑制控制' },
  { id: 'span', icon: '🔢', name: '数字广度', desc: '短期记忆' },
  { id: 'nback', icon: '🧠', name: 'N回溯', desc: '工作记忆' },
  { id: 'reaction', icon: '⚡', name: '反应速度', desc: '处理速度' },
  { id: 'memory', icon: '🃏', name: '图形记忆', desc: '记忆图形位置' },
  { id: 'sequence', icon: '🔢', name: '数字序列', desc: '找出数字规律' },
  { id: 'rotation', icon: '🔄', name: '空间旋转', desc: '判断旋转方向' }
]

function toTestItem(card: any): TestItem {
  return {
    id: card.id,
    icon: card.icon,
    name: card.name,
    desc: card.desc,
    duration: card.duration,
    questionCount: card.questionCount,
    price: card.price,
    category: card.type,
  }
}

function loadData() {
  // 从真实模块系统加载
  const grouped = listGrouped()
  intelligenceList.value = (grouped['intelligence'] || []).map(toTestItem)
  personalityList.value = (grouped['personality'] || []).map(toTestItem)
  moodList.value = (grouped['mood'] || []).map(toTestItem)
  careerList.value = (grouped['career'] || []).map(toTestItem)
  selfList.value = (grouped['self'] || []).map(toTestItem)

  gameList.value = GAME_LIST

  // 从本地存储加载历史记录
  const stored = uni.getStorageSync('test_history')
  if (stored && Array.isArray(stored)) {
    recentHistory.value = stored.slice(0, 5)
  } else {
    recentHistory.value = []
  }

  // 更新统计
  stats.totalTests = intelligenceList.value.length + personalityList.value.length +
    moodList.value.length + careerList.value.length + selfList.value.length
  stats.totalGames = gameList.value.length
  stats.completed = stored && Array.isArray(stored) ? stored.length : 0
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function onSearch() {
  uni.showToast({ title: '搜索功能开发中', icon: 'none' })
}

function navigateToCategory(category: string) {
  uni.navigateTo({
    url: `/pages/category/category?type=${category}`
  })
}

function navigateToTest(moduleId: string) {
  uni.navigateTo({
    url: `/pages/runner/runner?moduleId=${moduleId}`
  })
}

function navigateToGame(gameId: string) {
  uni.navigateTo({
    url: `/pages/games/${gameId}/${gameId}`
  })
}

function navigateToGames() {
  // 显示游戏选择列表或跳转到第一个游戏
  uni.showActionSheet({
    title: '选择脑力游戏',
    itemList: gameList.value.map(g => g.name),
    success: (res) => {
      const game = gameList.value[res.tapIndex]
      if (game) {
        navigateToGame(game.id)
      }
    }
  })
}

function navigateToHistory() {
  uni.navigateTo({
    url: '/pages/history/history'
  })
}

function navigateToReport(id: string, moduleId: string) {
  uni.navigateTo({
    url: `/pages/report/report?id=${id}&moduleId=${moduleId}`
  })
}

onMounted(() => {
  loadData()
})

onShow(() => {
  loadData()
})
</script>

<style scoped>
.hub-container {
  min-height: 100vh;
  background-color: #f5f6fa;
}

.hero-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 30rpx 80rpx;
  border-radius: 0 0 40rpx 40rpx;
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 10rpx;
}

.hero-subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 30rpx;
}

.hero-search {
  width: 90%;
  height: 72rpx;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-placeholder {
  color: rgba(255, 255, 255, 0.8);
  font-size: 26rpx;
}

.stats-bar {
  display: flex;
  justify-content: space-around;
  background: #ffffff;
  margin: -30rpx 30rpx 20rpx;
  padding: 30rpx 0;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  position: relative;
  z-index: 1;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 40rpx;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 6rpx;
}

.section {
  margin: 0 30rpx 30rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.section-more {
  font-size: 26rpx;
  color: #667eea;
}

.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.test-card {
  width: calc(50% - 10rpx);
  background: #ffffff;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  position: relative;
}

.card-icon {
  font-size: 48rpx;
  margin-bottom: 12rpx;
}

.card-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.card-desc {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 12rpx;
  display: block;
}

.card-meta {
  display: flex;
  gap: 16rpx;
}

.meta-item {
  font-size: 22rpx;
  color: #bbb;
}

.card-price {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  font-size: 24rpx;
  color: #ff6b6b;
  font-weight: bold;
}

.card-free {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  font-size: 22rpx;
  color: #51cf66;
  background: rgba(81, 207, 102, 0.1);
  padding: 2rpx 10rpx;
  border-radius: 8rpx;
}

.game-list {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 0 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.game-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.game-item:last-child {
  border-bottom: none;
}

.game-icon {
  font-size: 44rpx;
  margin-right: 20rpx;
}

.game-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.game-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.game-desc {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}

.game-arrow {
  font-size: 28rpx;
  color: #ccc;
}

.empty-tip {
  text-align: center;
  padding: 40rpx 0;
  color: #999;
  font-size: 26rpx;
  background: #ffffff;
  border-radius: 20rpx;
}

.history-item {
  display: flex;
  align-items: center;
  background: #ffffff;
  padding: 24rpx;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
}

.history-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.history-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.history-name {
  font-size: 28rpx;
  color: #333;
}

.history-time {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}

.history-score {
  font-size: 32rpx;
  color: #667eea;
  font-weight: bold;
}

.bottom-spacer {
  height: 40rpx;
}
</style>
