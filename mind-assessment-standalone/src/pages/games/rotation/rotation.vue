<template>
  <view class="game-container">
    <view class="game-header">
      <text class="game-icon">🔄</text>
      <text class="game-title">空间旋转</text>
      <text class="game-desc">判断旋转后的图形方向</text>
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
      <text class="question-label">目标图形经过旋转后，对应哪个选项？</text>
      <view class="target-shape" :style="targetStyle">
        <text class="shape-text">{{ targetShape }}</text>
      </view>
      <text class="rotation-info">{{ rotationInfo }}</text>
      <view class="options-row">
        <button
          v-for="(opt, idx) in options"
          :key="idx"
          class="shape-option"
          :class="{ 'option-correct': showResult && idx === correctIdx, 'option-wrong': showResult && selectedIdx === idx && idx !== correctIdx }"
          @click="onSelect(idx)"
        >
          <text class="shape-opt-text" :style="opt.style">{{ opt.shape }}</text>
        </button>
      </view>
    </view>

    <!-- 控制 -->
    <view v-if="phase === 'idle' || phase === 'finished'" class="center-control">
      <view v-if="phase === 'idle'" class="intro">
        <text class="intro-title">游戏规则</text>
        <text class="intro-text">观察目标图形</text>
        <text class="intro-text">根据旋转提示</text>
        <text class="intro-text">选择正确的旋转结果</text>
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

type Phase = 'idle' | 'playing' | 'finished';

const SHAPES = ['▲', '◆', '■', '●', '★', '◐'];
const ROTATIONS = [
  { label: '顺时针90°', deg: 90 },
  { label: '逆时针90°', deg: -90 },
  { label: '旋转180°', deg: 180 },
  { label: '顺时针45°', deg: 45 },
];

const phase = ref<Phase>('idle');
const level = ref(1);
const score = ref(0);
const lives = ref(3);
const targetShape = ref('');
const rotationInfo = ref('');
const options = ref<{ shape: string; style: string }[]>([]);
const correctIdx = ref(0);
const selectedIdx = ref(-1);
const showResult = ref(false);
const records = ref<any[]>([]);

onLoad(() => {
  records.value = getGameRecords('rotation');
});

const targetStyle = computed(() => {
  return '';
});

function generateQuestion() {
  const shape = SHAPES[randomInt(0, SHAPES.length - 1)];
  targetShape.value = shape;

  const rot = ROTATIONS[Math.min(Math.floor((level.value - 1) / 2), ROTATIONS.length - 1)];
  rotationInfo.value = rot.label;

  // 生成选项
  const opts: { shape: string; style: string }[] = [];
  correctIdx.value = randomInt(0, 3);

  for (let i = 0; i < 4; i++) {
    if (i === correctIdx.value) {
      opts.push({ shape, style: `transform: rotate(${rot.deg}deg); display: inline-block;` });
    } else {
      const wrongRot = randomInt(0, 360);
      opts.push({ shape, style: `transform: rotate(${wrongRot}deg); display: inline-block;` });
    }
  }
  options.value = opts;
}

function startGame() {
  phase.value = 'idle';
  level.value = 1;
  score.value = 0;
  lives.value = 3;
  showResult.value = false;
  startRound();
}

function startRound() {
  showResult.value = false;
  selectedIdx.value = -1;
  generateQuestion();
  phase.value = 'playing';
}

async function onSelect(idx: number) {
  if (showResult.value) return;
  selectedIdx.value = idx;
  showResult.value = true;

  const isCorrect = idx === correctIdx.value;
  if (isCorrect) {
    score.value += level.value * 12;
    level.value++;
  } else {
    lives.value--;
    if (lives.value <= 0) {
      await delay(1500);
      finishGame();
      return;
    }
  }

  await delay(1200);
  startRound();
}

function finishGame() {
  phase.value = 'finished';
  const record = {
    score: score.value,
    level: level.value,
    date: new Date().toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
  };
  saveGameRecord('rotation', record);
  records.value.unshift(record);
}

const evaluation = computed(() => {
  if (level.value >= 10) return '空间大师！三维思维超群 🧠';
  if (level.value >= 6) return '空间想象力优秀 👍';
  if (level.value >= 3) return '不错的成绩，继续训练 💪';
  return '空间思维可以提升，多练习 📚';
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
.game-title { font-size: 44rpx; font-weight: bold; color: #16a34a; margin-bottom: 8rpx; }
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
  padding: 40rpx;
  margin-bottom: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
}

.question-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 24rpx;
  text-align: center;
}

.target-shape {
  width: 160rpx;
  height: 160rpx;
  background: #f0fdf4;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
  border: 4rpx solid #16a34a;
}

.shape-text {
  font-size: 72rpx;
}

.rotation-info {
  font-size: 32rpx;
  font-weight: bold;
  color: #16a34a;
  margin-bottom: 30rpx;
}

.options-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  justify-content: center;
}

.shape-option {
  width: 140rpx;
  height: 140rpx;
  background: #f5f6fa;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid #e9ecef;
}

.shape-opt-text {
  font-size: 56rpx;
}

.option-correct {
  background: #dcfce7;
  border-color: #16a34a;
}

.option-wrong {
  background: #fee2e2;
  border-color: #dc2626;
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

.intro-title { font-size: 36rpx; font-weight: bold; color: #16a34a; margin-bottom: 20rpx; }
.intro-text { font-size: 28rpx; color: #666; margin-bottom: 12rpx; text-align: center; }

.btn-primary {
  width: 80%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #16a34a, #4ade80);
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

.finish-title { font-size: 44rpx; font-weight: bold; color: #16a34a; margin-bottom: 16rpx; }
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

.history-level { font-size: 26rpx; color: #16a34a; width: 120rpx; }
.history-score { font-size: 26rpx; color: #333; flex: 1; text-align: center; }
.history-date { font-size: 24rpx; color: #999; }

.history-empty { text-align: center; color: #999; font-size: 26rpx; padding: 20rpx 0; }
</style>
