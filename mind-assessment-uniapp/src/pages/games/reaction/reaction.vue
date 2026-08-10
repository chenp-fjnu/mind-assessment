<template>
  <view class="game-container">
    <view class="game-header">
      <text class="game-icon">⚡</text>
      <text class="game-title">反应速度</text>
      <text class="game-desc">看到颜色变化立即点击</text>
    </view>

    <view class="game-stats">
      <view class="stat">
        <text class="stat-label">轮次</text>
        <text class="stat-value">{{ round }} / {{ totalRounds }}</text>
      </view>
      <view class="stat">
        <text class="stat-label">平均</text>
        <text class="stat-value">{{ avgReaction }}ms</text>
      </view>
      <view class="stat">
        <text class="stat-label">最快</text>
        <text class="stat-value">{{ bestReaction }}ms</text>
      </view>
    </view>

    <!-- 反应区域 -->
    <view
      class="reaction-zone"
      :class="{ 'zone-ready': phase === 'ready', 'zone-go': phase === 'go', 'zone-early': phase === 'early' }"
      @click="onZoneClick"
    >
      <text v-if="phase === 'idle'" class="zone-text">点击开始</text>
      <text v-if="phase === 'ready'" class="zone-text">等待绿色...</text>
      <text v-if="phase === 'go'" class="zone-text">点！</text>
      <text v-if="phase === 'early'" class="zone-text">太早了！</text>
      <text v-if="phase === 'finished'" class="zone-text">完成</text>
    </view>

    <!-- 本轮结果 -->
    <view v-if="lastResult !== null" class="round-result">
      <text class="round-time">{{ lastResult }}ms</text>
      <text class="round-eval">{{ roundEval }}</text>
    </view>

    <!-- 控制 -->
    <view class="controls">
      <button v-if="phase === 'idle'" class="btn-primary" @click="startRound">开始测试</button>
      <button v-if="phase === 'finished'" class="btn-primary" @click="restartGame">重新测试</button>
      <button v-if="phase === 'finished'" class="btn-secondary" @click="goBack">返回</button>
    </view>

    <!-- 历史 -->
    <view class="history-section">
      <text class="history-title">最近记录</text>
      <view v-for="(r, i) in records.slice(0, 5)" :key="i" class="history-row">
        <text class="history-avg">平均{{ r.avg }}ms</text>
        <text class="history-best">最快{{ r.best }}ms</text>
        <text class="history-date">{{ r.date }}</text>
      </view>
      <view v-if="records.length === 0" class="history-empty">暂无记录</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { randomInt, delay, saveGameRecord, getGameRecords } from '@/utils/game-common';

type Phase = 'idle' | 'ready' | 'go' | 'early' | 'finished';

const phase = ref<Phase>('idle');
const round = ref(0);
const totalRounds = 5;
const reactionTimes = ref<number[]>([]);
const lastResult = ref<number | null>(null);
const records = ref<any[]>([]);

let startTime = 0;
let readyTimer: ReturnType<typeof setTimeout> | null = null;

onLoad(() => {
  records.value = getGameRecords('reaction');
});

onUnmounted(() => {
  if (readyTimer) clearTimeout(readyTimer);
});

const avgReaction = computed(() => {
  if (reactionTimes.value.length === 0) return 0;
  return Math.round(reactionTimes.value.reduce((a, b) => a + b, 0) / reactionTimes.value.length);
});

const bestReaction = computed(() => {
  if (reactionTimes.value.length === 0) return 0;
  return Math.min(...reactionTimes.value);
});

const roundEval = computed(() => {
  if (lastResult.value === null) return '';
  if (lastResult.value < 200) return '闪电反应！⚡';
  if (lastResult.value < 300) return '非常快！🚀';
  if (lastResult.value < 400) return '反应不错 👍';
  if (lastResult.value < 600) return '还可以更快 💪';
  return '集中注意力！👀';
});

async function startRound() {
  if (round.value >= totalRounds) {
    restartGame();
    return;
  }

  phase.value = 'ready';
  lastResult.value = null;

  const waitTime = randomInt(1500, 4000);

  readyTimer = setTimeout(() => {
    phase.value = 'go';
    startTime = Date.now();
  }, waitTime);
}

function onZoneClick() {
  if (phase.value === 'idle') {
    startRound();
    return;
  }

  if (phase.value === 'ready') {
    // 点太早了
    if (readyTimer) clearTimeout(readyTimer);
    phase.value = 'early';
    lastResult.value = null;
    setTimeout(() => {
      phase.value = 'idle';
    }, 1000);
    return;
  }

  if (phase.value === 'go') {
    const rt = Date.now() - startTime;
    reactionTimes.value.push(rt);
    lastResult.value = rt;
    round.value++;

    if (round.value >= totalRounds) {
      phase.value = 'finished';
      saveResult();
    } else {
      phase.value = 'idle';
      setTimeout(() => startRound(), 800);
    }
  }
}

function saveResult() {
  const record = {
    score: avgReaction.value,
    level: 1,
    avg: avgReaction.value,
    best: bestReaction.value,
    date: new Date().toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
  };
  saveGameRecord('reaction', record);
  records.value.unshift(record);
}

function restartGame() {
  round.value = 0;
  reactionTimes.value = [];
  lastResult.value = null;
  phase.value = 'idle';
}

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

.game-icon { font-size: 80rpx; margin-bottom: 10rpx; }
.game-title { font-size: 44rpx; font-weight: bold; color: #d97706; margin-bottom: 8rpx; }
.game-desc { font-size: 26rpx; color: #999; }

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

.stat-label { font-size: 24rpx; color: #999; margin-bottom: 6rpx; }
.stat-value { font-size: 36rpx; font-weight: bold; color: #333; }

.reaction-zone {
  height: 400rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30rpx;
  background: #e5e7eb;
  transition: background-color 0.1s;
}

.zone-ready {
  background: #dc2626;
}

.zone-go {
  background: #16a34a;
}

.zone-early {
  background: #d97706;
}

.zone-text {
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
}

.round-result {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
}

.round-time {
  font-size: 48rpx;
  font-weight: bold;
  color: #d97706;
}

.round-eval {
  font-size: 28rpx;
  color: #666;
  margin-top: 8rpx;
}

.controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 30rpx;
}

.btn-primary {
  width: 80%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #d97706, #f59e0b);
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
}

.history-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
}

.history-title { font-size: 30rpx; font-weight: bold; color: #333; margin-bottom: 20rpx; display: block; }

.history-row {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.history-avg { font-size: 26rpx; color: #d97706; width: 180rpx; }
.history-best { font-size: 26rpx; color: #333; flex: 1; text-align: center; }
.history-date { font-size: 24rpx; color: #999; }

.history-empty { text-align: center; color: #999; font-size: 26rpx; padding: 20rpx 0; }
</style>
