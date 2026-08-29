// 视觉搜索 / 找不同（Visual Search）—— 纯逻辑 + 元数据（可单测）
function hsl(h, s, l) {
  return 'hsl(' + h + ',' + s + '%,' + l + '%)'
}

// level 1~5 对应网格：3, 4, 5, 6, 7
const LEVEL_SIZES = [3, 4, 5, 6, 7]
const LEVEL_HUE_DIFFS = [180, 120, 80, 50, 30]

function generate(opts) {
  const level = opts.level || 1
  const trials = opts.trials || 8
  const trialsData = []
  const size = LEVEL_SIZES[Math.min(level - 1, LEVEL_SIZES.length - 1)]
  const hueDiff = LEVEL_HUE_DIFFS[Math.min(level - 1, LEVEL_HUE_DIFFS.length - 1)]

  for (let t = 0; t < trials; t++) {
    const total = size * size
    const baseH = Math.floor(Math.random() * 360)
    const oddIdx = Math.floor(Math.random() * total)

    const base = hsl(baseH, 60, 55)
    const odd = hsl((baseH + hueDiff) % 360, 60, 55)

    const cells = []
    for (let i = 0; i < total; i++) cells.push(i === oddIdx ? odd : base)

    trialsData.push({ size, cells, oddIdx, total, hueDiff })
  }

  return { level, trials, trialsData }
}

// state: { errors, time, trials }
function score(state) {
  const time = state.time || 0
  const errors = state.errors || 0
  const trials = state.trials || 1
  const avgTime = time / trials
  const penalty = Math.max(0, avgTime - 1.5) * 8 + errors * 12
  const score = Math.max(0, Math.round(1000 - penalty))
  return { errors, time, avgTime: Math.round(avgTime * 100) / 100, trials, score }
}

module.exports = {
  id: 'visual-search',
  name: '视觉搜索',
  dim: 'attention',
  dimLabel: '注意力',
  icon: '🔍',
  color: '#0891b2',
  desc: '在相似色块中快速找出不一样的一个，训练选择性注意与扫视速度。',
  reference: 'focus-game.org 视觉搜索任务 / Treisman 特征整合理论',
  hot: true,
  levels: [
    { value: 1, label: '3×3 入门', level: 1, trials: 6 },
    { value: 2, label: '4×4 简单', level: 2, trials: 8 },
    { value: 3, label: '5×5 中等', level: 3, trials: 10 },
    { value: 4, label: '6×6 困难', level: 4, trials: 10 },
    { value: 5, label: '7×7 大师', level: 5, trials: 12 },
  ],
  metric: { key: 'score', label: '得分', unit: '', better: 'higher' },
  generate,
  score,
}