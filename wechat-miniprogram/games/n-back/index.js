// N-Back (Visual, Auditory, Dual) — 纯逻辑 + 元数据（可单测）
// 标准工作记忆训练范式：Jaeggi et al. (2008)

const GRID_SIZES = { small: 3, medium: 4 }
const GRID_POSITIONS = {
  small: 9,
  medium: 16,
}
const AUDIO_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

function generateSequence(length, poolSize) {
  return Array.from({ length }, () => Math.floor(Math.random() * poolSize))
}

function generate(opts) {
  const n = opts.n
  const trials = opts.trials || 20
  const mode = opts.mode || 'dual' // 'visual' | 'auditory' | 'dual'
  const gridSize = opts.gridSize || 'small' // 'small' (3x3) | 'medium' (4x4)

  const visualPool = GRID_POSITIONS[gridSize]
  const auditoryPool = AUDIO_LETTERS.length

  const visualSeq = generateSequence(trials, visualPool)
  const auditorySeq = generateSequence(trials, auditoryPool)

  return {
    n,
    trials,
    mode,
    gridSize,
    visualSeq,
    auditorySeq,
  }
}

// 计算某位置是否匹配 N 步前
function isMatch(seq, idx, n) {
  return idx >= n && seq[idx] === seq[idx - n]
}

// 评分：准确率 + 反应时惩罚
function score(state) {
  const total = state.total || 0
  const correct = state.correct || 0
  const times = state.times || []
  const visualCorrect = state.visualCorrect || 0
  const auditoryCorrect = state.auditoryCorrect || 0
  const visualTotal = state.visualTotal || 0
  const auditoryTotal = state.auditoryTotal || 0

  const accuracy = total ? correct / total : 0
  const visualAcc = visualTotal ? visualCorrect / visualTotal : 0
  const auditoryAcc = auditoryTotal ? auditoryCorrect / auditoryTotal : 0
  const avgRt = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0

  // 基础分：准确率 * 1000，反应时惩罚
  const baseScore = Math.max(0, Math.round(accuracy * 1000 - avgRt * 0.3))

  return {
    correct,
    total,
    accuracy: Math.round(accuracy * 100) / 100,
    visualCorrect,
    visualTotal,
    visualAccuracy: Math.round(visualAcc * 100) / 100,
    auditoryCorrect,
    auditoryTotal,
    auditoryAccuracy: Math.round(auditoryAcc * 100) / 100,
    avgRt: Math.round(avgRt),
    score: baseScore,
  }
}

module.exports = {
  id: 'n-back',
  name: 'N-Back',
  dim: 'memory',
  dimLabel: '工作记忆',
  icon: '🎴',
  color: '#8b5cf6',
  desc: '经典双重 N-Back 训练：同时判断视觉位置与听觉字母是否与 N 步前匹配，有效提升工作记忆容量。',
  reference: 'Jaeggi et al. (2008) PNAS - Dual N-Back 改善流体智力',
  hot: true,
  levels: [
    { value: 1, label: 'N=1 入门', n: 1, trials: 20, mode: 'dual', gridSize: 'small' },
    { value: 2, label: 'N=2 进阶', n: 2, trials: 20, mode: 'dual', gridSize: 'small' },
    { value: 3, label: 'N=3 挑战', n: 3, trials: 20, mode: 'dual', gridSize: 'small' },
    { value: 4, label: 'N=4 大师', n: 4, trials: 20, mode: 'dual', gridSize: 'small' },
  ],
  metric: { key: 'score', label: '得分', unit: '', better: 'higher' },
  modes: [
    { value: 'dual', label: '双重 (视觉+听觉)', desc: '最经典模式，同时训练视觉与听觉工作记忆' },
    { value: 'visual', label: '仅视觉', desc: '仅判断位置匹配，适合入门' },
    { value: 'auditory', label: '仅听觉', desc: '仅判断字母匹配，锻炼语音环路' },
  ],
  gridSizes: [
    { value: 'small', label: '3×3 (9格)', positions: 9 },
    { value: 'medium', label: '4×4 (16格)', positions: 16 },
  ],
  generate,
  score,
  isMatch,
  AUDIO_LETTERS,
  GRID_SIZES,
  GRID_POSITIONS,
}