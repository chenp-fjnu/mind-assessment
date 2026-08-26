// 按要求找方格（Find by Rule）—— 纯逻辑 + 元数据（可单测）
const COLORS = [
  { key: 'red', hex: '#ef4444' },
  { key: 'blue', hex: '#3b82f6' },
  { key: 'green', hex: '#22c55e' },
  { key: 'yellow', hex: '#eab308' },
]

function generate(level) {
  const size = level + 3
  const total = size * size
  const rule = COLORS[Math.floor(Math.random() * COLORS.length)]
  const cells = []
  let targetCount = 0
  for (let i = 0; i < total; i++) {
    const isTarget = Math.random() < 0.4
    const c = isTarget ? rule : COLORS[Math.floor(Math.random() * COLORS.length)]
    if (isTarget) targetCount++
    cells.push({ hex: c.hex, key: c.key, target: isTarget })
  }
  return { size, cells, total, targetCount, ruleKey: rule.key, ruleHex: rule.hex }
}

function score(state) {
  const time = state.time || 0
  const errors = state.errors || 0
  const targetCount = state.targetCount || 0
  const found = state.found || 0
  const missed = Math.max(0, targetCount - found)
  const penalty = Math.max(0, time - targetCount * 1.0) * 2 + errors * 8 + missed * 10
  const score = Math.max(0, Math.round(1000 - penalty))
  return { found, targetCount, errors, missed, time, score }
}

module.exports = {
  id: 'find-rule',
  name: '按要求找方格',
  dim: 'attention',
  dimLabel: '注意力',
  icon: '🔎',
  color: '#db2777',
  desc: '按规则点选符合条件的方格，训练规则遵循与选择性注意。',
  reference: 'shuertefangge.com「按要求找方格」',
  levels: [
    { value: 2, label: '5×5' },
    { value: 3, label: '6×6' },
    { value: 4, label: '7×7' },
  ],
  metric: { key: 'time', label: '用时', unit: 's', better: 'lower' },
  generate,
  score,
}
