// 舒尔特方格（Schulte Grid）—— 纯逻辑 + 元数据（可单测）
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = arr[i]
    arr[i] = arr[j]
    arr[j] = t
  }
  return arr
}

// level = 网格边长（3~9）
function generate(size) {
  const total = size * size
  const nums = []
  for (let i = 1; i <= total; i++) nums.push(i)
  shuffle(nums)
  return { size, cells: nums }
}

// state: { size, time(秒), errors }
function score(state) {
  const total = state.size * state.size
  const time = state.time || 0
  const errors = state.errors || 0
  // 基准：每格约 1 秒为优良；超出与错误均扣分
  const ideal = total
  const penalty = Math.max(0, time - ideal) * 2 + errors * 5
  const score = Math.max(0, Math.round(1000 - penalty))
  return { time, errors, score, size: state.size }
}

module.exports = {
  id: 'schulte',
  name: '舒尔特方格',
  dim: 'attention',
  dimLabel: '注意力',
  icon: '🔢',
  color: '#7c3aed',
  desc: '按 1→N 顺序尽快点选，训练视觉搜索速度与专注度。',
  reference: '国际通行视觉定向搜索训练范式（shuertefangge.com / App Store 多款同类）',
  levels: [
    { value: 3, label: '3×3 入门' },
    { value: 4, label: '4×4' },
    { value: 5, label: '5×5 标准' },
    { value: 6, label: '6×6' },
    { value: 7, label: '7×7' },
    { value: 8, label: '8×8' },
    { value: 9, label: '9×9 挑战' },
  ],
  metric: { key: 'time', label: '用时', unit: 's', better: 'lower' },
  generate,
  score,
}
