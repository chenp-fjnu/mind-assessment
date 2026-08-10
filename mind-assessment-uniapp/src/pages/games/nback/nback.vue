<template>
  <view class="game-container">
    <view class="game-header">
      <text class="game-icon">🧠</text>
      <text class="game-title">N回溯</text>
      <text class="game-desc">判断是否与 {{ n }} 步前的图形相同</text>
    </view>

    <view class="game-stats">
      <view class="stat">
        <text class="stat-label">N值</text>
        <text class="stat-value">{{ n }}</text>
      </view>
      <view class="stat">
        <text class="stat-label">得分</text>
        <text class="stat-value">{{ score }}</text>
      </view>
      <view class="stat">
        <text class="stat-label">剩余</text>
        <text class="stat-value">{{ remaining }}</text>
      </view>
    </view>

    <!-- 刺激显示 -->
    <view v-if="phase === 'playing'" class="stimulus-area">
      <view class="stimulus-card" :style="{ backgroundColor: currentStim.color }">
        <text class="stimulus-text">{{ currentStim.text }}</text>
      </view>
      <text class="stimulus-index">第 {{ currentIndex }} / {{ totalTrials }} 个</text>
    </view>

    <!-- 响应按钮 -->
    <view v-if="phase === 'playing'" class="response-area">
      <button
        class="response-btn btn-match"
        :disabled="currentIndex <= n"
        @click="onResponse(true)"
      >
        <text class="btn-label">相同</text>
        <text class="btn-hint">与{{ n }}步前一样</text>
      </button>
      <button class="response-btn btn-no-match" @click="onResponse(false)">
        <text class="btn-label">不同</text>
        <text class="btn-hint">与{{ n }}步前不一样</text>
      </button>
    </view>

    <!-- 开始/结束 -->
    <view v-if="phase === 'idle' || phase === 'finished'" class="center-control">
      <view v-if="phase === 'idle'" class="intro">
        <text class="intro-title">游戏规则</text>
        <text class="intro-text">屏幕上会依次出现不同颜色和文字的图形</text>
        <text class="intro-text">如果当前图形与 {{ n }} 步前的图形相同，点击"相同"</text>
        <text class="intro-text">否则点击"不同"</text>
        <button class="btn-primary" @click="startGame">开始游戏</button>
      </view>
      <view v-if="phase === 'finished'" class="finish-panel">
        <text class="finish-title">挑战结束</text>
        <text class="finish-score">得分 {{ score }} / {{ totalTrials * 10 }}</text>
        <text class="finish-detail">正确 {{ correctCount }} / {{ totalTrials }} 题</text>
        <text class="finish-eval">{{ evaluation }}</text>
        <button class="btn-primary" @click="startGame">再来一次</button>
        <button class="btn-secondary" @click="goBack">返回</button>
      </view>
    </view>

    <!-- 历史 -->
    <view class="history-section">
      <text class="history-title">最近记录</text>
      <view v-for="(r, i) in records.slice(0, 5)" :key="i" class="history-row">
        <text class="history-n">N={{ r.n }}</text>
        <text class="history-score">{{ r.score }}分</text>
        <text class="history-accuracy">{{ r.accuracy }}%</text>
      </view>
      <view v-if="records.length === 0" class="history-empty">暂无记录</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { GAME_COLORS, randomInt, saveGameRecord, getGameRecords } from '@/utils/game-common';

type Phase = 'idle' | 'playing' | 'finished';

interface Stimulus {
  text: string;
  color: string;
  id: number;
}

const phase = ref<Phase>('idle');
const n = ref(2);
const score = ref(0);
const currentIndex = ref(0);
const totalTrials = 20;
const remaining = ref(totalTrials);
const currentStim = ref<Stimulus>({ text: '', color: '', id: -1 });
const sequence = ref<Stimulus[]>([]);
const correctCount = ref(0);
const records = ref<any[]>([]);

onLoad(() => {
  records.value = getGameRecords('nback');
});

function generateSequence(): Stimulus[] {
  const seq: Stimulus[] = [];
  const colors = GAME_COLORS.slice(0, 4);
  const matchRate = 0.3; // 30%匹配率

  for (let i = 0; i < totalTrials + n.value; i++) {
    if (i >= n.value && Math.random() < matchRate && seq[i - n.value]) {
      // 创建匹配项
      seq.push({ ...seq[i - n.value], id: i });
    } else {
      const c = colors[randomInt(0, colors.length - 1)];
      seq.push({ text: c.text, color: c.value, id: i });
    }
  }
  return seq;
}

function startGame() {
  phase.value = 'playing';
  score.value = 0;
  correctCount.value = 0;
  currentIndex.value = 0;
  remaining.value = totalTrials;
  sequence.value = generateSequence();
  showNext();
}

function showNext() {
  if (currentIndex.value >= totalTrials + n.value) {
    finishGame();
    return;
  }
  currentStim.value = sequence.value[currentIndex.value];
  currentIndex.value++;
  remaining.value = totalTrials - (currentIndex.value - n.value);
  if (remaining.value < 0) remaining.value = 0;
}

function onResponse(isMatch: boolean) {
  if (phase.value !== 'playing') return;
  if (currentIndex.value <= n.value) return;

  const idx = currentIndex.value - 1;
  const shouldMatch = sequence.value[idx].text === sequence.value[idx - n.value].text;

  const isCorrect = isMatch === shouldMatch;
  if (isCorrect) {
    correctCount.value++;
    score.value += 10;
  } else {
    score.value = Math.max(0, score.value - 5);
  }

  showNext();
}

function finishGame() {
  phase.value = 'finished';
  const accuracy = Math.round((correctCount.value / totalTrials) * 100);
  const record = {
    score: score.value,
    level: n.value,
    n: n.value,
    accuracy,
    date: new Date().toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
  };
  saveGameRecord('nback', record);
  records.value.unshift(record);

  // N值调整
  if (accuracy >= 80 && n.value < 4) n.value++;
  else if (accuracy < 50 && n.value > 1) n.value--;
}

const evaluation = computed(() => {
  const accuracy = totalTrials > 0 ? Math.round((correctCount.value / totalTrials) * 100) : 0;
  if (accuracy >= 90) return '工作记忆超群！N-back大师 🧠';
  if (accuracy >= 75) return '表现优秀，工作记忆很强 👍';
  if (accuracy >= 60) return '不错的成绩，继续训练 💪';
  return '工作记忆需要训练，加油 📚';
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

.game-icon { font-size: 80rpx; margin-bottom: 10rpx; }
.game-title { font-size: 44rpx; font-weight: bold; color: #0d9488; margin-bottom: 8rpx; }
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

.stimulus-area {
  background: #fff;
  border-radius: 20rpx;
  padding: 60rpx 40rpx;
  margin-bottom: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
}

.stimulus-card {
  width: 200rpx;
  height: 200rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

.stimulus-text {
  font-size: 72rpx;
  font-weight: bold;
  color: #fff;
}

.stimulus-index {
  font-size: 26rpx;
  color: #999;
}

.response-area {
  display: flex;
  gap: 30rpx;
  justify-content: center;
  margin-bottom: 30rpx;
}

.response-btn {
  flex: 1;
  height: 140rpx;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: none;
}

.response-btn[disabled] {
  opacity: 0.4;
}

.btn-match {
  background: linear-gradient(135deg, #0d9488, #14b8a6);
}

.btn-no-match {
  background: linear-gradient(135deg, #dc2626, #f87171);
}

.btn-label {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.btn-hint {
  font-size: 22rpx;
  color: rgba(255,255,255,0.8);
  margin-top: 4rpx;
}

.center-control {
  display: flex;
  justify-content: center;
  margin-bottom: 30rpx;
}

.intro {
  background: #fff;
  border-radius: 20rpx;
  padding: 50rpx 40rpx;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
}

.intro-title { font-size: 36rpx; font-weight: bold; color: #0d9488; margin-bottom: 20rpx; }
.intro-text { font-size: 28rpx; color: #666; margin-bottom: 12rpx; text-align: center; }

.btn-primary {
  width: 80%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #0d9488, #14b8a6);
  color: #fff;
  border-radius: 44rpx;
  font-size: 30rpx;
  border: none;
  margin-top: 30rpx;
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

.finish-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.finish-title { font-size: 44rpx; font-weight: bold; color: #0d9488; margin-bottom: 16rpx; }
.finish-score { font-size: 32rpx; color: #333; margin-bottom: 8rpx; }
.finish-detail { font-size: 28rpx; color: #666; margin-bottom: 12rpx; }
.finish-eval { font-size: 28rpx; color: #16a34a; margin-bottom: 40rpx; }

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

.history-n { font-size: 26rpx; color: #0d9488; width: 100rpx; }
.history-score { font-size: 26rpx; color: #333; flex: 1; text-align: center; }
.history-accuracy { font-size: 24rpx; color: #999; }

.history-empty { text-align: center; color: #999; font-size: 26rpx; padding: 20rpx 0; }
</style>
