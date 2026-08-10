<template>
  <view class="runner-container">
    <!-- Header: Progress & Timer -->
    <view class="runner-header">
      <view class="progress-bar">
        <view class="progress-track">
          <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
        </view>
        <text class="progress-text">{{ currentIndex + 1 }} / {{ questions.length }}</text>
      </view>
      <view v-if="isIntelligenceTest" class="timer">
        <text :class="['timer-text', { 'timer-warning': remainingTime <= 60 }]">
          {{ formatTime(remainingTime) }}
        </text>
      </view>
    </view>

    <!-- Question Content -->
    <view v-if="currentQuestion" class="question-area">
      <text class="question-index">第 {{ currentIndex + 1 }} 题</text>
      <text class="question-title">{{ currentQuestion.prompt || currentQuestion.title || '' }}</text>

      <!-- Matrix Question: show 3x3 grid + figure options -->
      <view v-if="currentQuestion.type === 'matrix'" class="matrix-question">
        <MatrixView :matrix="currentQuestion.matrix" />
        <view class="matrix-options">
          <view
            v-for="(option, idx) in currentQuestion.options"
            :key="idx"
            class="matrix-option"
            :class="{ selected: selectedOption === idx }"
            @click="selectOption(idx)"
          >
            <view class="matrix-option-figure">
              <FigureView :figure="option" />
            </view>
            <text class="matrix-option-label">{{ String.fromCharCode(65 + idx) }}</text>
          </view>
        </view>
      </view>

      <!-- Choice Question -->
      <view v-else-if="currentQuestion.type === 'choice'" class="options-list">
        <view
          v-for="(option, idx) in currentQuestion.options"
          :key="idx"
          class="option-item choice"
          :class="{ selected: selectedOption === idx }"
          @click="selectOption(idx)"
        >
          <text class="choice-letter">{{ ['A','B','C','D','E','F'][idx] }}</text>
          <text class="option-text">{{ option.label }}</text>
        </view>
      </view>

      <!-- Scale Question -->
      <view v-else-if="currentQuestion.type === 'scale'" class="scale-area">
        <view class="scale-labels">
          <text class="scale-min">{{ currentQuestion.scale?.labels?.[0] || '非常不同意' }}</text>
          <text class="scale-max">{{ currentQuestion.scale?.labels?.[currentQuestion.scale?.labels?.length - 1] || '非常同意' }}</text>
        </view>
        <view class="scale-options">
          <view
            v-for="n in (currentQuestion.scale?.max || 5)"
            :key="n"
            class="scale-circle"
            :class="{ selected: selectedOption === n - 1 }"
            @click="selectOption(n - 1)"
          >
            <text>{{ n }}</text>
          </view>
        </view>
      </view>

      <!-- Number Question -->
      <view v-else-if="currentQuestion.type === 'number'" class="number-area">
        <input
          v-model.number="numberAnswer"
          type="number"
          class="number-input"
          :placeholder="currentQuestion.placeholder || '请输入数字'"
        />
        <slider
          v-if="currentQuestion.min !== undefined && currentQuestion.max !== undefined"
          :min="currentQuestion.min"
          :max="currentQuestion.max"
          :value="numberAnswer"
          @change="onSliderChange"
          class="number-slider"
          show-value
        />
      </view>
    </view>

    <!-- Empty State -->
    <view v-else class="empty-state">
      <text>加载中...</text>
    </view>

    <!-- Footer Actions -->
    <view class="runner-footer">
      <button
        v-if="currentIndex > 0"
        class="btn btn-secondary"
        @click="prevQuestion"
      >上一题</button>
      <button
        class="btn btn-primary"
        :disabled="!canProceed"
        @click="nextOrFinish"
      >
        {{ isLastQuestion ? '查看结果' : '下一题' }}
      </button>
      <button
        v-if="!isLastQuestion"
        class="btn btn-text"
        @click="skipQuestion"
      >跳过</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { onLoad, onHide, onUnload } from '@dcloudio/uni-app'
import { getModule } from '@/modules/module-system'
import MatrixView from '@/components/MatrixView.vue'
import FigureView from '@/components/FigureView.vue'

const moduleId = ref('')
const moduleInfo = ref<any>(null)
const questions = ref<any[]>([])
const currentIndex = ref(0)
const selectedOption = ref<number | null>(null)
const numberAnswer = ref<number | null>(null)
const answers = reactive<Record<string, number | string>>({})
const remainingTime = ref(0)
let timerId: ReturnType<typeof setInterval> | null = null

const isIntelligenceTest = computed(() => moduleInfo.value?.type === 'intelligence')
const currentQuestion = computed(() => questions.value[currentIndex.value] || null)
const isLastQuestion = computed(() => currentIndex.value >= questions.value.length - 1)
const progressPercent = computed(() => {
  if (questions.value.length === 0) return 0
  return ((currentIndex.value + 1) / questions.value.length) * 100
})

const canProceed = computed(() => {
  if (!currentQuestion.value) return false
  if (currentQuestion.value.type === 'number') {
    return numberAnswer.value !== null && numberAnswer.value !== undefined
  }
  return selectedOption.value !== null
})

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function startTimer() {
  if (!isIntelligenceTest.value || !moduleInfo.value?.duration) return
  remainingTime.value = moduleInfo.value.duration * 60
  timerId = setInterval(() => {
    remainingTime.value--
    if (remainingTime.value <= 0) {
      stopTimer()
      finishTest()
    }
  }, 1000)
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId)
    timerId = null
  }
}

function selectOption(idx: number) {
  selectedOption.value = idx
}

function onSliderChange(e: any) {
  numberAnswer.value = e.detail.value
}

function prevQuestion() {
  if (currentIndex.value > 0) {
    currentIndex.value--
    restoreAnswer()
  }
}

function nextOrFinish() {
  if (!canProceed.value) {
    uni.showToast({ title: '请先作答', icon: 'none' })
    return
  }
  saveAnswer()
  if (isLastQuestion.value) {
    finishTest()
  } else {
    currentIndex.value++
    restoreAnswer()
  }
}

function skipQuestion() {
  if (currentQuestion.value) {
    answers[currentQuestion.value.id] = -1
  }
  if (isLastQuestion.value) {
    finishTest()
  } else {
    currentIndex.value++
    restoreAnswer()
  }
}

function saveAnswer() {
  if (!currentQuestion.value) return
  const q = currentQuestion.value
  if (q.type === 'number' && numberAnswer.value !== null) {
    answers[q.id] = numberAnswer.value
  } else if (selectedOption.value !== null) {
    answers[q.id] = selectedOption.value
  }
  uni.setStorageSync(`runner_progress_${moduleId.value}`, {
    currentIndex: currentIndex.value,
    answers: { ...answers },
    remainingTime: remainingTime.value
  })
}

function restoreAnswer() {
  selectedOption.value = null
  numberAnswer.value = null
  const qid = currentQuestion.value?.id
  if (!qid) return
  const saved = answers[qid]
  if (saved === undefined || saved === null || saved === -1) return
  const q = currentQuestion.value
  if (q.type === 'number') {
    numberAnswer.value = saved as number
  } else {
    selectedOption.value = saved as number
  }
}

function finishTest() {
  stopTimer()
  const mod = getModule(moduleId.value)
  if (!mod) {
    uni.showToast({ title: '模块不存在', icon: 'none' })
    return
  }

  // 构建答案数组（按题目顺序）
  const qs = questions.value
  const answerArray = qs.map(q => {
    const a = answers[q.id]
    if (a === undefined || a === null || a === -1) return undefined
    return a
  })

  // 调用模块的 computeResult
  const result: any = mod.computeResult(answerArray, qs)
  const modAny = mod as any

  // 构建分组列表
  let groupList: any[] = []
  if (modAny.buildGroupList && mod.resultLayout) {
    groupList = modAny.buildGroupList(result, mod.resultLayout) || []
  }

  // 构建解读文本
  let interpretations: any[] = []
  if (modAny.buildInterpretations) {
    interpretations = modAny.buildInterpretations(result, groupList, []) || []
  }

  // 保存到历史记录
  const history = uni.getStorageSync('test_history') || []
  const recordId = `rec_${Date.now()}`
  const record = {
    id: recordId,
    moduleId: moduleId.value,
    name: mod.name,
    icon: mod.icon,
    date: new Date().toISOString(),
    score: result.score ?? result.raw ?? result.index ?? 0,
    level: result.level,
    levelColor: result.levelColor,
    answers: { ...answers },
    result,
    groupList,
    interpretations,
    resultLayout: mod.resultLayout,
    moduleType: mod.type,
  }
  history.unshift(record)
  uni.setStorageSync('test_history', history)
  uni.removeStorageSync(`runner_progress_${moduleId.value}`)

  uni.redirectTo({
    url: `/pages/report/report?id=${recordId}&moduleId=${moduleId.value}`
  })
}

function loadModuleData(id: string) {
  const mod = getModule(id)
  if (!mod) {
    uni.showToast({ title: '模块不存在', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
    return
  }
  moduleInfo.value = mod
  questions.value = mod.getQuestions()

  // 恢复进度
  const progress = uni.getStorageSync(`runner_progress_${id}`)
  if (progress && progress.answers) {
    Object.assign(answers, progress.answers)
    currentIndex.value = progress.currentIndex || 0
    if (progress.remainingTime) remainingTime.value = progress.remainingTime
    restoreAnswer()
  }

  startTimer()
}

onLoad((query: any) => {
  moduleId.value = query?.moduleId || ''
  if (!moduleId.value) {
    uni.showToast({ title: '缺少参数', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1500)
    return
  }
  loadModuleData(moduleId.value)
})

onHide(() => {
  saveAnswer()
})

onUnmounted(() => {
  stopTimer()
})
</script>

<style scoped>
.runner-container {
  min-height: 100vh;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.runner-header {
  background: #ffffff;
  padding: 20rpx 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
}

.progress-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.progress-track {
  flex: 1;
  height: 12rpx;
  background: #e9ecef;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 6rpx;
  transition: width 0.3s;
}

.progress-text {
  font-size: 24rpx;
  color: #999;
}

.timer {
  margin-top: 10rpx;
  text-align: right;
}

.timer-text {
  font-size: 28rpx;
  color: #667eea;
  font-weight: bold;
}

.timer-warning {
  color: #ff6b6b;
}

.question-area {
  flex: 1;
  padding: 40rpx 30rpx;
}

.question-index {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 16rpx;
  display: block;
}

.question-title {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
  line-height: 1.6;
  display: block;
  margin-bottom: 30rpx;
}

/* Matrix question */
.matrix-question {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.matrix-options {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  justify-content: center;
}

.matrix-option {
  width: calc(33.333% - 14rpx);
  aspect-ratio: 1;
  border: 4rpx solid #e9ecef;
  border-radius: 16rpx;
  overflow: hidden;
  position: relative;
  background: #fff;
  transition: all 0.2s;
}

.matrix-option.selected {
  border-color: #667eea;
  background: #f0f3ff;
  transform: scale(0.95);
}

.matrix-option-figure {
  width: 100%;
  height: calc(100% - 40rpx);
}

.matrix-option-label {
  position: absolute;
  bottom: 4rpx;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24rpx;
  color: #999;
  font-weight: bold;
}

.matrix-option.selected .matrix-option-label {
  color: #667eea;
}

/* Choice question */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.option-item {
  display: flex;
  align-items: center;
  background: #ffffff;
  padding: 24rpx;
  border-radius: 16rpx;
  border: 2rpx solid #e9ecef;
  transition: all 0.2s;
}

.option-item.selected {
  border-color: #667eea;
  background: #f0f3ff;
}

.option-radio {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  border: 2rpx solid #ccc;
  margin-right: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.option-item.selected .option-radio {
  border-color: #667eea;
}

.radio-inner {
  width: 18rpx;
  height: 18rpx;
  border-radius: 50%;
  background: #667eea;
}

.option-text {
  font-size: 28rpx;
  color: #333;
  flex: 1;
}

.choice-letter {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #f0f0f0;
  color: #666;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  font-weight: bold;
  flex-shrink: 0;
}

.option-item.choice.selected .choice-letter {
  background: #667eea;
  color: #fff;
}

/* Scale question */
.scale-area {
  background: #ffffff;
  padding: 30rpx;
  border-radius: 16rpx;
}

.scale-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.scale-min,
.scale-max {
  font-size: 24rpx;
  color: #999;
}

.scale-options {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
}

.scale-circle {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #666;
}

.scale-circle.selected {
  background: #667eea;
  color: #ffffff;
}

/* Number question */
.number-area {
  background: #ffffff;
  padding: 30rpx;
  border-radius: 16rpx;
}

.number-input {
  height: 80rpx;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  margin-bottom: 20rpx;
}

.number-slider {
  width: 100%;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.runner-footer {
  background: #ffffff;
  padding: 20rpx 30rpx 40rpx;
  display: flex;
  gap: 16rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
}

.btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  border-radius: 44rpx;
  font-size: 30rpx;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.btn-primary[disabled] {
  opacity: 0.6;
}

.btn-secondary {
  background: #f0f0f0;
  color: #666;
}

.btn-text {
  background: transparent;
  color: #999;
  font-size: 26rpx;
}
</style>
