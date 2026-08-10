<template>
  <view class="game-container">
    <view class="game-header">
      <text class="game-icon">🃏</text>
      <text class="game-title">图形记忆</text>
      <text class="game-desc">记住图形位置，找出配对的卡片</text>
    </view>

    <view class="game-stats">
      <view class="stat">
        <text class="stat-label">等级</text>
        <text class="stat-value">{{ level }}</text>
      </view>
      <view class="stat">
        <text class="stat-label">翻牌</text>
        <text class="stat-value">{{ flips }}</text>
      </view>
      <view class="stat">
        <text class="stat-label">得分</text>
        <text class="stat-value">{{ score }}</text>
      </view>
    </view>

    <!-- 卡片网格 -->
    <view class="card-grid" :style="gridStyle">
      <view
        v-for="(card, idx) in cards"
        :key="idx"
        class="memory-card"
        :class="{ 'card-flipped': card.flipped || card.matched, 'card-matched': card.matched }"
        @click="onCardClick(idx)"
      >
        <view class="card-face card-back">?</view>
        <view class="card-face card-front" :style="{ backgroundColor: card.color }">
          <text class="card-symbol">{{ card.symbol }}</text>
        </view>
      </view>
    </view>

    <!-- 控制 -->
    <view class="controls">
      <button v-if="phase === 'idle'" class="btn-primary" @click="startGame">开始游戏</button>
      <button v-if="phase === 'finished'" class="btn-primary" @click="startGame">再来一次</button>
      <button v-if="phase === 'finished'" class="btn-secondary" @click="goBack">返回</button>
    </view>

    <!-- 结果 -->
    <view v-if="phase === 'finished'" class="result-card">
      <text class="result-title">完成！</text>
      <text class="result-score">得分 {{ score }}</text>
      <text class="result-detail">翻牌 {{ flips }} 次 | 等级 {{ level }}</text>
      <text class="result-eval">{{ evaluation }}</text>
    </view>

    <!-- 历史 -->
    <view class="history-section">
      <text class="history-title">最近记录</text>
      <view v-for="(r, i) in records.slice(0, 5)" :key="i" class="history-row">
        <text class="history-level">等级{{ r.level }}</text>
        <text class="history-score">{{ r.score }}分</text>
        <text class="history-flips">{{ r.flips }}翻</text>
      </view>
      <view v-if="records.length === 0" class="history-empty">暂无记录</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { shuffle, saveGameRecord, getGameRecords } from '@/utils/game-common';

interface Card {
  symbol: string;
  color: string;
  flipped: boolean;
  matched: boolean;
}

const SYMBOLS = ['🌟', '🌙', '☀️', '💎', '🔥', '❄️', '🍀', '🌈', '🎵', '⚡', '🍎', '🦋'];
const COLORS = ['#dc2626', '#2563eb', '#16a34a', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#65a30d'];

const phase = ref<'idle' | 'playing' | 'finished'>('idle');
const level = ref(1);
const flips = ref(0);
const score = ref(0);
const cards = ref<Card[]>([]);
const records = ref<any[]>([]);

let firstPick: number | null = null;
let lockBoard = false;

const pairCount = computed(() => Math.min(3 + level.value, 10));
const gridStyle = computed(() => {
  const cols = pairCount.value <= 4 ? 3 : pairCount.value <= 6 ? 4 : 4;
  return { gridTemplateColumns: `repeat(${cols}, 1fr)` };
});

onLoad(() => {
  records.value = getGameRecords('memory');
});

function startGame() {
  phase.value = 'playing';
  flips.value = 0;
  score.value = 0;
  firstPick = null;
  lockBoard = false;

  const count = pairCount.value;
  const selected = SYMBOLS.slice(0, count);
  const pairs = shuffle([...selected, ...selected]);

  cards.value = pairs.map((s, i) => ({
    symbol: s,
    color: COLORS[i % COLORS.length],
    flipped: false,
    matched: false,
  }));
}

function onCardClick(idx: number) {
  if (phase.value !== 'playing' || lockBoard) return;
  const card = cards.value[idx];
  if (card.flipped || card.matched) return;

  card.flipped = true;
  flips.value++;

  if (firstPick === null) {
    firstPick = idx;
    return;
  }

  lockBoard = true;
  const first = cards.value[firstPick];

  if (first.symbol === card.symbol) {
    first.matched = true;
    card.matched = true;
    score.value += 20;
    firstPick = null;
    lockBoard = false;

    // 检查是否全部匹配
    if (cards.value.every((c) => c.matched)) {
      setTimeout(() => {
        score.value += Math.max(0, 100 - flips.value * 2);
        finishGame();
      }, 500);
    }
  } else {
    score.value = Math.max(0, score.value - 5);
    setTimeout(() => {
      first.flipped = false;
      card.flipped = false;
      firstPick = null;
      lockBoard = false;
    }, 800);
  }
}

function finishGame() {
  phase.value = 'finished';
  const record = {
    score: score.value,
    level: level.value,
    flips: flips.value,
    date: new Date().toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
  };
  saveGameRecord('memory', record);
  records.value.unshift(record);

  if (flips.value <= pairCount.value * 2 + 2 && level.value < 8) {
    level.value++;
  }
}

const evaluation = computed(() => {
  const minFlips = pairCount.value * 2;
  if (flips.value <= minFlips + 2) return '完美记忆！简直过目不忘 🌟';
  if (flips.value <= minFlips + 6) return '记忆力很棒 👍';
  if (flips.value <= minFlips + 12) return '不错的成绩 💪';
  return '记忆力可以提升，多练习 📚';
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
.game-title { font-size: 44rpx; font-weight: bold; color: #be185d; margin-bottom: 8rpx; }
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

.card-grid {
  display: grid;
  gap: 16rpx;
  justify-content: center;
  margin-bottom: 30rpx;
}

.memory-card {
  width: 140rpx;
  height: 140rpx;
  position: relative;
  perspective: 600rpx;
  cursor: pointer;
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  backface-visibility: hidden;
  transition: transform 0.4s;
}

.card-back {
  background: linear-gradient(135deg, #be185d, #db2777);
  color: #fff;
  font-size: 48rpx;
  font-weight: bold;
}

.card-front {
  transform: rotateY(180deg);
}

.card-symbol {
  font-size: 56rpx;
}

.card-flipped .card-back {
  transform: rotateY(180deg);
}

.card-flipped .card-front {
  transform: rotateY(0deg);
}

.card-matched .card-front {
  opacity: 0.6;
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
  background: linear-gradient(135deg, #be185d, #db2777);
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

.result-title { font-size: 40rpx; font-weight: bold; color: #be185d; margin-bottom: 10rpx; }
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

.history-level { font-size: 26rpx; color: #be185d; width: 120rpx; }
.history-score { font-size: 26rpx; color: #333; flex: 1; text-align: center; }
.history-flips { font-size: 24rpx; color: #999; }

.history-empty { text-align: center; color: #999; font-size: 26rpx; padding: 20rpx 0; }
</style>
