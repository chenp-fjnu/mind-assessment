<template>
  <view class="game-container">
    <view class="game-header">
      <text class="game-icon">🔢</text>
      <text class="game-title">数字序列</text>
      <text class="game-desc">找出数字规律，填出下一个数</text>
    </view>

    <view class="game-stats">
      <view class="stat">
        <text class="stat-label">等级</text>
        <text class="stat-value">{{ level }}</text>
      </view>
      <view class="stat">
        <text class="stat-label">得分</text>
        <text class="stat-value">{{ score }}</text>
      </view>
      <view class="stat">
        <text class="stat-label">生命</text>
        <text class="stat-value">{{ lives }}</text>
      </view>
    </view>

    <!-- 题目 -->
    <view v-if="phase === 'playing'" class="question-area">
      <text class="question-label">找出规律，下一个数字是？</text>
      <view class="sequence-row">
        <text v-for="(n, i) in sequence" :key="i" class="seq-num">{{ n }}</text>
        <text class="seq-num seq-q">?</text>
      </view>
      <view class="answer-row">
        <input
          v-model="userAnswer"
          type="number"
          class="answer-input"
          placeholder="输入答案"
          @confirm="onSubmit"
        />
        <button class="btn-submit" @click="onSubmit">确认</button>
      </view>
    </view>

    <!-- 反馈 -->
    <view v-if="phase === 'feedback'" class="feedback-area">
      <text class="feedback-icon">{{ feedbackIcon }}</text>
      <text class="feedback-text">{{ feedbackText }}</text>
      <text class="feedback-detail">序列: {{ sequence.join(', ') }}, {{ answer }}</text>
    </view>

    <!-- 控制 -->
    <view v-if="phase === 'idle' || phase === 'finished'" class="center-control">
      <view v-if="phase === 'idle'" class="intro">
        <text class="intro-title">游戏规则</text>
        <text class="intro-text">观察数字序列，找出规律</text>
        <text class="intro-text">填入下一个数字</text>
        <text class="intro-text">每关难度递增</text>
        <button class="btn-primary" @click="startGame">开始挑战</button>
      </view>
      <view v-if="phase === 'finished'" class="finish-panel">
        <text class="finish-title">游戏结束</text>
        <text class="finish-score">等级 {{ level }} | 得分 {{ score }}</text>
        <text class="finish-eval">{{ evaluation }}</text>
        <button class="btn-primary" @click="startGame">再来一次</button>
        <button class="btn-secondary" @click="goBack">返回</button>
      </view>
    </view>

    <!-- 历史 -->
    <view class="history-section">
      <text class="history-title">最近记录</text>
      <view v-for="(r, i) in records.slice(0, 5)" :key="i" class="history-row">
        <text class="history-level">等级{{ r.level }}</text>
        <text class="history-score">{{ r.score }}分</text>
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

type Phase = 'idle' | 'playing' | 'feedback' | 'finished';

const phase = ref<Phase>('idle');
const level = ref(1);
const score = ref(0);
const lives = ref(3);
const sequence = ref<number[]>([]);
const answer = ref(0);
const userAnswer = ref('');
const feedbackIcon = ref('');
const feedbackText = ref('');
const records = ref<any[]>([]);

onLoad(() => {
  records.value = getGameRecords('sequence');
});

function generateSequence(): { seq: number[]; ans: number } {
  const type = Math.min(Math.floor((level.value - 1) / 2), 4);
  const start = randomInt(1, 20);

  switch (type) {
    case 0: { // 等差数列
      const d = randomInt(2, 10);
      const seq = Array.from({ length: 4 }, (_, i) => start + i * d);
      return { seq, ans: start + 4 * d };
    }
    case 1: { // 等比数列
      const r = randomInt(2, 4);
      const seq = Array.from({ length: 4 }, (_, i) => start * Math.pow(r, i));
      return { seq, ans: start * Math.pow(r, 4) };
    }
    case 2: { // 斐波那契型
      const a = randomInt(1, 5);
      const b = randomInt(1, 5);
      const seq = [a, b, a + b, a + 2 * b];
      return { seq, ans: 2 * a + 3 * b };
    }
    case 3: { // 平方数列
      const seq = Array.from({ length: 4 }, (_, i) => Math.pow(start + i, 2));
      return { seq, ans: Math.pow(start + 4, 2) };
    }
    default: { // 混合
      const d = randomInt(1, 5);
      const seq = Array.from({ length: 4 }, (_, i) => start + i * d + i * i);
      return { seq, ans: start + 4 * d + 16 };
    }
  }
}

function startGame() {
  phase.value = 'idle';
  level.value = 1;
  score.value = 0;
  lives.value = 3;
  startRound();
}

function startRound() {
  userAnswer.value = '';
  const result = generateSequence();
  sequence.value = result.seq;
  answer.value = result.ans;
  phase.value = 'playing';
}

async function onSubmit() {
  if (!userAnswer.value) return;
  const val = parseInt(userAnswer.value);
  const isCorrect = val === answer.value;

  phase.value = 'feedback';
  if (isCorrect) {
    feedbackIcon.value = '✅';
    feedbackText.value = '正确！推理能力很棒';
    score.value += level.value * 15;
    level.value++;
  } else {
    feedbackIcon.value = '❌';
    feedbackText.value = `答案是 ${answer.value}`;
    lives.value--;
    if (lives.value <= 0) {
      await delay(1500);
      finishGame();
      return;
    }
  }

  await delay(1500);
  startRound();
}

function finishGame() {
  phase.value = 'finished';
  const record = {
    score: score.value,
    level: level.value,
    date: new Date().toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
  };
  saveGameRecord('sequence', record);
  records.value.unshift(record);
}

const evaluation = computed(() => {
  if (level.value >= 10) return '推理大师！逻辑能力极强 🧠';
  if (level.value >= 6) return '推理能力优秀 👍';
  if (level.value >= 3) return '不错的成绩，继续练习 💪';
  return '数学推理可以提升，多试试 📚';
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
.game-title { font-size: 44rpx; font-weight: bold; color: #2563eb; margin-bottom: 8rpx; }
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
  padding: 50rpx 40rpx;
  margin-bottom: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
}

.question-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 30rpx;
}

.sequence-row {
  display: flex;
  gap: 20rpx;
  margin-bottom: 40rpx;
  flex-wrap: wrap;
  justify-content: center;
}

.seq-num {
  width: 80rpx;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  background: #f0f4ff;
  border-radius: 12rpx;
  font-size: 36rpx;
  font-weight: bold;
  color: #2563eb;
}

.seq-q {
  background: linear-gradient(135deg, #2563eb, #60a5fa);
  color: #fff;
}

.answer-row {
  display: flex;
  gap: 20rpx;
  width: 100%;
}

.answer-input {
  flex: 1;
  height: 88rpx;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 32rpx;
  text-align: center;
}

.btn-submit {
  width: 200rpx;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #2563eb, #60a5fa);
  color: #fff;
  border-radius: 12rpx;
  font-size: 30rpx;
  border: none;
}

.feedback-area {
  background: #fff;
  border-radius: 20rpx;
  padding: 60rpx 40rpx;
  margin-bottom: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
}

.feedback-icon { font-size: 80rpx; margin-bottom: 16rpx; }
.feedback-text { font-size: 36rpx; font-weight: bold; color: #333; margin-bottom: 10rpx; }
.feedback-detail { font-size: 28rpx; color: #999; }

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

.intro-title { font-size: 36rpx; font-weight: bold; color: #2563eb; margin-bottom: 20rpx; }
.intro-text { font-size: 28rpx; color: #666; margin-bottom: 12rpx; text-align: center; }

.btn-primary {
  width: 80%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #2563eb, #60a5fa);
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

.finish-title { font-size: 44rpx; font-weight: bold; color: #2563eb; margin-bottom: 16rpx; }
.finish-score { font-size: 32rpx; color: #333; margin-bottom: 12rpx; }
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

.history-level { font-size: 26rpx; color: #2563eb; width: 120rpx; }
.history-score { font-size: 26rpx; color: #333; flex: 1; text-align: center; }
.history-date { font-size: 24rpx; color: #999; }

.history-empty { text-align: center; color: #999; font-size: 26rpx; padding: 20rpx 0; }
</style>
