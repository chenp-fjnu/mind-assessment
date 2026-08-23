// 视觉搜索 / 找不同（Visual Search）—— 纯逻辑 + 元数据（可单测）
function hsl(h, s, l) {
  return 'hsl(' + h + ',' + s + '%,' + l + '%)'
}

function generate(level) {
  // level 1~3：网格边长 3/4/5，相似度递增（差异越小越难）
  const size = level + 2
  const total = size * size
  const baseH = Math.floor(Math.random() * 360)
  const oddIdx = Math.floor(Math.random() * total)
  const base = hsl(baseH, 60, 55)
  const odd = hsl((baseH + 180) % 360, 60, 55 - 0)
  const cells = []
  for (let i = 0; i < total; i++) cells.push(i === oddIdx ? odd : base)
  return { size, cells, oddIdx, total }
}

// state: { errors, time }
function score(state) {
  const time = state.time || 0
  const errors = state.errors || 0
  const penalty = Math.max(0, time - 2) * 6 + errors * 15
  const score = Math.max(0, Math.round(1000 - penalty))
  return { errors, time, score }
}

module.exports = {
  id: 'visual-search',
  name: '视觉搜索',
  dim: 'attention',
  dimLabel: '注意力',
  icon: '🔍',
  color: '#0891b2',
  desc: '在相似色块中找出不一样的一个，训练选择性注意与扫视。',
  reference: 'focus-game.org 视觉搜索任务',
  levels: [
    { value: 1, label: '3×3 易' },
    { value: 2, label: '4×4 中' },
    { value: 3, label: '5×5 难' },
  ],
  metric: { key: 'time', label: '用时', unit: 's', better: 'lower' },
  generate,
  score,
}
