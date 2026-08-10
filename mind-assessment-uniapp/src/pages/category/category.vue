<template>
  <view class="category-container">
    <!-- Header -->
    <view class="category-header">
      <text class="header-title">{{ categoryTitle }}</text>
      <text class="header-count">共 {{ testList.length }} 个测验</text>
    </view>

    <!-- Test List -->
    <scroll-view scroll-y class="category-scroll">
      <view
        v-for="item in testList"
        :key="item.id"
        class="test-card"
        @click="navigateToTest(item.id)"
      >
        <view class="card-icon">{{ item.icon }}</view>
        <view class="card-info">
          <text class="card-name">{{ item.name }}</text>
          <text class="card-desc">{{ item.desc }}</text>
          <view class="card-meta">
            <text class="meta-item">{{ item.duration }}分钟</text>
            <text class="meta-item">{{ item.questionCount }}题</text>
          </view>
        </view>
        <view class="card-right">
          <view v-if="item.price > 0" class="card-price">¥{{ item.price }}</view>
          <view v-else class="card-free">免费</view>
          <text class="card-arrow">></text>
        </view>
      </view>

      <view v-if="testList.length === 0" class="empty-state">
        <text class="empty-icon">📂</text>
        <text class="empty-text">该分类暂无测验</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { listByType } from '@/modules/module-system'

interface TestItem {
  id: string
  icon: string
  name: string
  desc: string
  duration: number
  questionCount: number
  price: number
}

const categoryType = ref('')

const categoryTitle = computed(() => {
  const map: Record<string, string> = {
    intelligence: '智力测验',
    personality: '人格测验',
    mood: '情绪状态',
    career: '职业发展',
    self: '自我探索'
  }
  return map[categoryType.value] || '测验分类'
})

const testList = computed<TestItem[]>(() => {
  if (!categoryType.value) return []
  return listByType(categoryType.value).map((m: any) => ({
    id: m.id,
    icon: m.icon,
    name: m.name,
    desc: m.desc,
    duration: m.duration,
    questionCount: m.questionCount,
    price: m.price,
  }))
})

function navigateToTest(moduleId: string) {
  uni.navigateTo({
    url: `/pages/runner/runner?moduleId=${moduleId}`
  })
}

onLoad((query: any) => {
  categoryType.value = query?.type || ''
  if (!categoryType.value) {
    uni.showToast({ title: '缺少分类参数', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
  }
})
</script>

<style scoped>
.category-container {
  min-height: 100vh;
  background: #f5f6fa;
  display: flex;
  flex-direction: column;
}

.category-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 30rpx 40rpx;
}

.header-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
  display: block;
  margin-bottom: 8rpx;
}

.header-count {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.category-scroll {
  flex: 1;
  padding: 20rpx 30rpx;
}

.test-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.04);
}

.card-icon {
  font-size: 48rpx;
  margin-right: 20rpx;
  width: 80rpx;
  height: 80rpx;
  background: #f0f3ff;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 6rpx;
}

.card-desc {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.card-meta {
  display: flex;
  gap: 16rpx;
}

.meta-item {
  font-size: 22rpx;
  color: #bbb;
  background: #f5f6fa;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.card-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
}

.card-price {
  font-size: 28rpx;
  color: #ff6b6b;
  font-weight: bold;
}

.card-free {
  font-size: 24rpx;
  color: #51cf66;
  background: #dcfce7;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.card-arrow {
  font-size: 28rpx;
  color: #ccc;
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
</style>
