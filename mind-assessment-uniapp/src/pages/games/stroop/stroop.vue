<template>
  <view class="game-container">
    <view class="game-header">
      <text class="game-icon">🎨</text>
      <text class="game-title">斯特鲁普效应</text>
      <text class="game-desc">判断文字颜色，抑制干扰</text>
    </view>

    <view class="game-stats">
      <view class="stat">
        <text class="stat-label">得分</text>
        <text class="stat-value">{{ score }}</text>
      </view>
      <view class="stat">
        <text class="stat-label">连击</text>
        <text class="stat-value">{{ streak }}</text>
      </view>
      <view class="stat">
        <text class="stat-label">剩余</text>
        <text class="stat-value">{{ timeLeft }}s</text>
      </view>
    </view>

    <!-- 题目区域 -->
    <view v-if="status === 'playing'" class="question-area">
      <text class="question-text" :style="{ color: current.color }">{{ current.text }}</text>
      <text class="question-hint">文字显示的是什么颜色？</text>
    </view>

    <!-- 选项按钮 -->
    <view v-if="status === 'playing'" class="options-grid">
      <button
        v-for="(opt, idx) in options"
        :key="idx"
        class="option-btn"
        :style="{ backgroundColor: opt.value + '20', borderColor: opt.value }"
        @click="onAnswer(opt)"
      >
        <text class="option-text" :style="{ color: opt.value }">{{ opt.name }}</text>
      </button>
    </view>

    <!-- 开始/结束控制 -->
    <view v-if="status !== 'playing'" class="center-control">
      <button v-if="status === 'idle'" class="btn-primary" @click="startGame">开始挑战</button>
      <button v-if="status === 'finished'" class="btn-primary" @click="startGame">再来一次</button>
    </view>

    <!-- 结果 -->
    <view v-if="status === 'finished'" class="result-card">
      <text class="result-title">挑战结束</text>
      <text class="result-score">最终得分 {{ score }}</text>
      <text class="result-detail">正确 {{ correctCount }} / {{ totalCount }} 题</text>
      <text class="result-eval">{{ evaluation }}</text>
    </view>

    <!-- 历史 -->
    <view class="history-section">
      <text class="history-title">最近记录</text>
      <view v-for="(r, i) in records.slice(0, 5)" :key="i" class="history-row">
        <text class="history-score">{{ r.score }}分</text>
        <text class="history-accuracy">{{ r.accuracy }}%</text>
        <text class="history-date">{{ r.date }}</text>
      </view>
      <view v-if="records.length === 0" class="history-empty">暂无记录</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { GAME_COLORS, randomInt, shuffle, saveGameRecord, getGameRecords } from '@/utils/game-common';

interface ColorOption {
  name: string;
  value: string;
}

interface Question {
  text: string;
  color: string;
  correct: string;
}

const status = ref<'idle' | 'playing' | 'finished'>('idle');
const score = ref(0);
const streak = ref(0);
const timeLeft = ref(60);
const current = ref<Question>({ text: '', color: '', correct: '' });
const options = ref<ColorOption[]>([]);
const correctCount = ref(0);
const totalCount = ref(0);
const records = ref<any[]>([]);

let gameTimer: ReturnType<typeof setInterval> | null = null;
const GAME_DURATION = 60;

onLoad(() => {
  records.value = getGameRecords('stroop');
});

onUnmounted(() => {
  clearGameTimer();
});

function clearGameTimer() {
  if (gameTimer) {
    clearInterval(gameTimer);
    gameTimer = null;
  }
}

function generateQuestion() {
  const colors = GAME_COLORS.slice(0, 4);
  const textIdx = randomInt(0, colors.length - 1);
  const colorIdx = randomInt(0, colors.length - 1);

  current.value = {
    text: colors[textIdx].text,
    color: colors[colorIdx].value,
    correct: colors[colorIdx].name,
  };

  options.value = shuffle([...colors]).map((c) => ({
    name: c.name,
    value: c.value,
  }));
}

function startGame() {
  status.value = 'playing';
  score.value = 0;
  streak.value = 0;
  timeLeft.value = GAME_DURATION;
  correctCount.value = 0;
  totalCount.value = 0;

  generateQuestion();

  gameTimer = setInterval(() => {
    timeLeft.value--;
    if (timeLeft.value <= 0) {
      finishGame();
    }
  }, 1000);
}

function onAnswer(opt: ColorOption) {
  if (status.value !== 'playing') return;

  totalCount.value++;
  const isCorrect = opt.name === current.value.correct;

  if (isCorrect) {
    correctCount.value++;
    streak.value++;
    const bonus = Math.min(streak.value, 5);
    const isConflict = current.value.text !== current.value.correct;
    score.value += isConflict ? 20 + bonus * 5 : 10 + bonus * 3;
  } else {
    streak.value = 0;
    score.value = Math.max(0, score.value - 5);
  }

  generateQuestion();
}

function finishGame() {
  clearGameTimer();
  status.value = 'finished';

  const accuracy = totalCount.value > 0 ? Math.round((correctCount.value / totalCount.value) * 100) : 0;
  const record = {
    score: score.value,
    level: 1,
    accuracy,
    date: new Date().toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
  };
  saveGameRecord('stroop', record);
  records.value.unshift(record);
}

const evaluation = computed(() => {
  if (score.value >= 500) return '色彩大师！抑制能力极强 🎨';
  if (score.value >= 300) return '表现优秀，干扰难不倒你 👏';
  if (score.value >= 150) return '不错的成绩，继续练习 💪';
  return '斯特鲁普效应很强？多试试 📚';
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
.game-title { font-size: 44rpx; font-weight: bold; color: #dc2626; margin-bottom: 8rpx; }
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

.question-area {
  background: #fff;
  border-radius: 20rpx;
  padding: 60rpx 40rpx;
  margin-bottom: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
}

.question-text {
  font-size: 80rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.question-hint {
  font-size: 26rpx;
  color: #999;
}

.options-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  justify-content: center;
  margin-bottom: 30rpx;
}

.option-btn {
  width: 45%;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  border-width: 4rpx;
  border-style: solid;
  background: #fff;
}

.option-text {
  font-size: 36rpx;
  font-weight: bold;
}

.center-control {
  display: flex;
  justify-content: center;
  margin-bottom: 30rpx;
}

.btn-primary {
  width: 80%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #dc2626, #f87171);
  color: #fff;
  border-radius: 44rpx;
  font-size: 30rpx;
  border: none;
}

.result-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
}

.result-title { font-size: 40rpx; font-weight: bold; color: #dc2626; margin-bottom: 10rpx; }
.result-score { font-size: 36rpx; color: #333; margin-bottom: 8rpx; }
.result-detail { font-size: 28rpx; color: #666; margin-bottom: 12rpx; }
.result-eval { font-size: 28rpx; color: #16a34a; }

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

.history-score { font-size: 26rpx; color: #dc2626; width: 120rpx; }
.history-accuracy { font-size: 26rpx; color: #333; flex: 1; text-align: center; }
.history-date { font-size: 24rpx; color: #999; }

.history-empty { text-align: center; color: #999; font-size: 26rpx; padding: 20rpx 0; }
</style>
