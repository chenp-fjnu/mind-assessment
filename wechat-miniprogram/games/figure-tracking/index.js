// 图形追踪（Figure Tracking）—— 纯逻辑 + 元数据（可单测）
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = arr[i]
    arr[i] = arr[j]
    arr[j] = t
  }
  return arr
}

function generate(size) {
  const total = size * size
  const nums = []
  for (let i = 1; i <= total; i++) nums.push(i)
  shuffle(nums)
  return { size, cells: nums }
}

function score(state) {
  const total = state.size * state.size
  const time = state.time || 0
  const errors = state.errors || 0
  const ideal = total
  const penalty = Math.max(0, time - ideal) * 2 + errors * 5
  return { time, errors, score: Math.max(0, Math.round(1000 - penalty)), size: state.size }
}

module.exports = {
  id: 'figure-tracking',
  name: '图形追踪',
  dim: 'attention',
  dimLabel: '注意力',
  icon: '🧵',
  color: '#7c3aed',
  desc: '沿 1→N 的数字轨道顺序点击，训练视觉追踪。',
  reference: '河南健康网注意力训练（图形追踪）',
  levels: [
    { value: 3, label: '3×3' },
    { value: 4, label: '4×4' },
    { value: 5, label: '5×5' },
    { value: 6, label: '6×6' },
    { value: 7, label: '7×7' },
  ],
  metric: { key: 'time', label: '用时', unit: 's', better: 'lower' },
  generate,
  score,
}
