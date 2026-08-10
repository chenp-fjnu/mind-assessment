<template>
  <view class="game-container">
    <view class="game-header">
      <text class="game-icon">🎯</text>
      <text class="game-title">舒尔特方格</text>
      <text class="game-desc">按顺序点击数字，训练专注力</text>
    </view>

    <view class="game-stats">
      <view class="stat">
        <text class="stat-label">等级</text>
        <text class="stat-value">{{ level }}</text>
      </view>
      <view class="stat">
        <text class="stat-label">时间</text>
        <text class="stat-value">{{ formatTime(elapsed) }}</text>
      </view>
      <view class="stat">
        <text class="stat-label">下一个</text>
        <text class="stat-value next-num">{{ currentTarget }}</text>
      </view>
    </view>

    <!-- 游戏区域 -->
    <view class="grid-wrap">
      <view
        v-for="(item, index) in grid"
        :key="index"
        class="grid-cell"
        :class="{
          'cell-found': item.found,
          'cell-wrong': item.wrong,
        }"
        :style="{ width: cellSize + 'rpx', height: cellSize + 'rpx' }"
        @click="onCellClick(item)"
      >
        <text class="cell-num">{{ item.value }}</text>
      </view>
    </view>

    <!-- 控制按钮 -->
    <view class="controls">
      <button v-if="status === 'idle'" class="btn-primary" @click="startGame">开始游戏</button>
      <button v-if="status === 'finished'" class="btn-primary" @click="startGame">再来一次</button>
    </view>

    <!-- 结果弹窗 -->
    <view v-if="status === 'finished'" class="result-overlay">
      <view class="result-card">
        <text class="result-title">完成！</text>
        <text class="result-score">用时 {{ formatTime(elapsed) }}</text>
        <text class="result-level">等级 {{ level }} x {{ gridSize }} 方格</text>
        <text class="result-eval">{{ evaluation }}</text>
        <button class="btn-primary" @click="startGame">继续挑战</button>
        <button class="btn-secondary" @click="goBack">返回</button>
      </view>
    </view>

    <!-- 历史记录 -->
    <view class="history-section">
      <text class="history-title">最近记录</text>
      <view v-for="(r, i) in records.slice(0, 5)" :key="i" class="history-row">
        <text class="history-level">{{ r.level }}级</text>
        <text class="history-time">{{ formatTime(r.elapsed) }}</text>
        <text class="history-date">{{ r.date }}</text>
      </view>
      <view v-if="records.length === 0" class="history-empty">暂无记录</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { randomInt, shuffle, formatTime, saveGameRecord, getGameRecords } from '@/utils/game-common';

interface GridItem {
  value: number;
  found: boolean;
  wrong: boolean;
}

const status = ref<'idle' | 'playing' | 'finished'>('idle');
const level = ref(1);
const gridSize = computed(() => Math.min(3 + Math.floor((level.value - 1) / 2), 7));
const cellSize = computed(() => Math.floor(600 / gridSize.value));
const grid = ref<GridItem[]>([]);
const currentTarget = ref(1);
const elapsed = ref(0);
const records = ref<any[]>([]);

let timer: ReturnType<typeof setInterval> | null = null;
let startTime = 0;
let wrongTimer: ReturnType<typeof setTimeout> | null = null;

onLoad(() => {
  records.value = getGameRecords('schulte');
});

onUnmounted(() => {
  clearTimer();
});

function clearTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function startGame() {
  status.value = 'playing';
  currentTarget.value = 1;
  elapsed.value = 0;

  const size = gridSize.value;
  const total = size * size;
  const values = shuffle(Array.from({ length: total }, (_, i) => i + 1));
  grid.value = values.map((v) => ({ value: v, found: false, wrong: false }));

  startTime = Date.now();
  timer = setInterval(() => {
    elapsed.value = Date.now() - startTime;
  }, 50);
}

function onCellClick(item: GridItem) {
  if (status.value !== 'playing' || item.found) return;

  if (item.value === currentTarget.value) {
    item.found = true;
    currentTarget.value++;

    // 检查是否完成
    if (currentTarget.value > grid.value.length) {
      finishGame();
    }
  } else {
    // 错误反馈
    item.wrong = true;
    if (wrongTimer) clearTimeout(wrongTimer);
    wrongTimer = setTimeout(() => {
      item.wrong = false;
    }, 300);
  }
}

function finishGame() {
  clearTimer();
  status.value = 'finished';

  // 保存记录
  const record = {
    score: elapsed.value,
    level: level.value,
    elapsed: elapsed.value,
    date: new Date().toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
  };
  saveGameRecord('schulte', record);
  records.value.unshift(record);

  // 升级判断
  const size = gridSize.value;
  const avgTime = elapsed.value / (size * size);
  if (avgTime < 800 && level.value < 10) {
    level.value++;
  }
}

const evaluation = computed(() => {
  const size = gridSize.value;
  const avgTime = elapsed.value / (size * size);
  if (avgTime < 400) return '反应极快！专注力超群 🌟';
  if (avgTime < 600) return '表现优秀，继续保持 👍';
  if (avgTime < 1000) return '不错的成绩，还可以更快 💪';
  return '加油，多练习会有进步 📈';
});

function goBack() {
  uni.navigateBack();
}
</script>

<style scoped>
.game-container {
  min-height: 100vh;
  background: #f5f6fa;
  padding: 40rpx 30rpx;
}

.game-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30rpx;
}

.game-icon {
  font-size: 80rpx;
  margin-bottom: 10rpx;
}

.game-title {
  font-size: 44rpx;
  font-weight: bold;
  color: #1e3a8a;
  margin-bottom: 8rpx;
}

.game-desc {
  font-size: 26rpx;
  color: #999;
}

.game-stats {
  display: flex;
  justify-content: space-around;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx 0;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 6rpx;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.next-num {
  color: #1e3a8a;
}

.grid-wrap {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
}

.grid-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f4ff;
  border-radius: 12rpx;
  transition: all 0.15s;
}

.grid-cell:active {
  transform: scale(0.95);
}

.cell-num {
  font-size: 36rpx;
  font-weight: bold;
  color: #1e3a8a;
}

.cell-found {
  background: #dcfce7;
}

.cell-found .cell-num {
  color: #16a34a;
}

.cell-wrong {
  background: #fee2e2;
  animation: shake 0.3s;
}

.cell-wrong .cell-num {
  color: #dc2626;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6rpx); }
  75% { transform: translateX(6rpx); }
}

.controls {
  display: flex;
  justify-content: center;
  margin-bottom: 30rpx;
}

.btn-primary {
  width: 80%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #1e3a8a, #3b82f6);
  color: #fff;
  border-radius: 44rpx;
  font-size: 30rpx;
  border: none;
}

.btn-secondary {
  width: 80%;
  height: 80rpx;
  line-height: 80rpx;
  background: #f0f0f0;
  color: #666;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: none;
  margin-top: 16rpx;
}

.result-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.result-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 60rpx 50rpx;
  width: 80%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.result-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #1e3a8a;
  margin-bottom: 20rpx;
}

.result-score {
  font-size: 40rpx;
  color: #333;
  margin-bottom: 10rpx;
}

.result-level {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.result-eval {
  font-size: 28rpx;
  color: #16a34a;
  margin-bottom: 40rpx;
}

.history-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
}

.history-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.history-row {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.history-level {
  font-size: 26rpx;
  color: #1e3a8a;
  width: 100rpx;
}

.history-time {
  font-size: 26rpx;
  color: #333;
  flex: 1;
  text-align: center;
}

.history-date {
  font-size: 24rpx;
  color: #999;
}

.history-empty {
  text-align: center;
  color: #999;
  font-size: 26rpx;
  padding: 20rpx 0;
}
</style>
