<template>
  <view class="game-container">
    <view class="game-header">
      <text class="game-icon">🔢</text>
      <text class="game-title">数字广度</text>
      <text class="game-desc">记忆并回忆数字序列</text>
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

    <!-- 显示阶段 -->
    <view v-if="phase === 'show'" class="display-area">
      <text class="display-num">{{ displayNumber }}</text>
      <text class="display-hint">请记住这个数字</text>
    </view>

    <!-- 输入阶段 -->
    <view v-if="phase === 'input'" class="input-area">
      <text class="input-label">输入你记住的数字</text>
      <view class="input-display">{{ userInput }}</view>
      <view class="numpad">
        <button
          v-for="n in [1,2,3,4,5,6,7,8,9]"
          :key="n"
          class="num-btn"
          @click="onNumPress(n)"
        >{{ n }}</button>
        <button class="num-btn num-btn-0" @click="onNumPress(0)">0</button>
        <button class="num-btn num-btn-del" @click="onDelete">←</button>
      </view>
      <button class="btn-submit" @click="onSubmit">确认</button>
    </view>

    <!-- 反馈 -->
    <view v-if="phase === 'feedback'" class="feedback-area">
      <text class="feedback-icon">{{ feedbackIcon }}</text>
      <text class="feedback-text">{{ feedbackText }}</text>
      <text class="feedback-detail">正确答案: {{ correctSequence }}</text>
    </view>

    <!-- 控制 -->
    <view v-if="phase === 'idle' || phase === 'finished'" class="center-control">
      <button v-if="phase === 'idle'" class="btn-primary" @click="startGame">开始游戏</button>
      <view v-if="phase === 'finished'" class="finish-panel">
        <text class="finish-title">游戏结束</text>
        <text class="finish-score">最终等级: {{ level }} | 得分: {{ score }}</text>
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

type Phase = 'idle' | 'show' | 'input' | 'feedback' | 'finished';

const phase = ref<Phase>('idle');
const level = ref(1);
const score = ref(0);
const lives = ref(3);
const displayNumber = ref('');
const correctSequence = ref('');
const userInput = ref('');
const feedbackIcon = ref('');
const feedbackText = ref('');
const records = ref<any[]>([]);

let showTimer: ReturnType<typeof setTimeout> | null = null;
const SHOW_DURATION = [2000, 1800, 1600, 1400, 1200, 1000, 900, 800];

onLoad(() => {
  records.value = getGameRecords('span');
});

onUnmounted(() => {
  if (showTimer) clearTimeout(showTimer);
});

function generateSequence(len: number): string {
  let result = '';
  for (let i = 0; i < len; i++) {
    result += randomInt(0, 9);
  }
  return result;
}

async function startGame() {
  phase.value = 'idle';
  level.value = 1;
  score.value = 0;
  lives.value = 3;
  await delay(100);
  startRound();
}

async function startRound() {
  userInput.value = '';
  const seqLen = 3 + level.value;
  correctSequence.value = generateSequence(seqLen);

  // 逐个显示数字
  for (let i = 0; i < correctSequence.value.length; i++) {
    displayNumber.value = correctSequence.value[i];
    phase.value = 'show';
    const dur = SHOW_DURATION[Math.min(level.value - 1, SHOW_DURATION.length - 1)];
    await delay(dur);
  }

  displayNumber.value = '';
  phase.value = 'input';
}

function onNumPress(n: number) {
  if (userInput.value.length < correctSequence.value.length) {
    userInput.value += n;
  }
}

function onDelete() {
  userInput.value = userInput.value.slice(0, -1);
}

async function onSubmit() {
  if (userInput.value.length === 0) return;

  const isCorrect = userInput.value === correctSequence.value;
  phase.value = 'feedback';

  if (isCorrect) {
    feedbackIcon.value = '✅';
    feedbackText.value = '正确！记忆力很棒';
    score.value += level.value * 10;
    level.value++;
  } else {
    feedbackIcon.value = '❌';
    feedbackText.value = '记忆有误';
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
  saveGameRecord('span', record);
  records.value.unshift(record);
}

const evaluation = computed(() => {
  if (level.value >= 8) return '记忆天才！短期记忆超群 🧠';
  if (level.value >= 5) return '记忆力优秀，继续保持 👍';
  if (level.value >= 3) return '不错的成绩，多练习可提升 💪';
  return '加油，记忆是可以训练的 📖';
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
.game-title { font-size: 44rpx; font-weight: bold; color: #7c3aed; margin-bottom: 8rpx; }
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

.display-area {
  background: #fff;
  border-radius: 20rpx;
  padding: 80rpx 40rpx;
  margin-bottom: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
}

.display-num {
  font-size: 120rpx;
  font-weight: bold;
  color: #7c3aed;
  margin-bottom: 20rpx;
}

.display-hint {
  font-size: 28rpx;
  color: #999;
}

.input-area {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
}

.input-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.input-display {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  background: #f5f6fa;
  padding: 20rpx 60rpx;
  border-radius: 12rpx;
  margin-bottom: 30rpx;
  min-width: 200rpx;
  text-align: center;
  letter-spacing: 10rpx;
}

.numpad {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  justify-content: center;
  margin-bottom: 30rpx;
}

.num-btn {
  width: 160rpx;
  height: 100rpx;
  line-height: 100rpx;
  background: #f0f4ff;
  border-radius: 12rpx;
  font-size: 36rpx;
  font-weight: bold;
  color: #7c3aed;
  border: none;
}

.num-btn-0 { width: 160rpx; }
.num-btn-del { background: #fee2e2; color: #dc2626; }

.btn-submit {
  width: 80%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #7c3aed, #a78bfa);
  color: #fff;
  border-radius: 44rpx;
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

.btn-primary {
  width: 80%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #7c3aed, #a78bfa);
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

.finish-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.finish-title { font-size: 44rpx; font-weight: bold; color: #7c3aed; margin-bottom: 16rpx; }
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

.history-level { font-size: 26rpx; color: #7c3aed; width: 120rpx; }
.history-score { font-size: 26rpx; color: #333; flex: 1; text-align: center; }
.history-date { font-size: 24rpx; color: #999; }

.history-empty { text-align: center; color: #999; font-size: 26rpx; padding: 20rpx 0; }
</style>
