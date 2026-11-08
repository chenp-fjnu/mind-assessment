// 解压连字（Connect）—— 按 1→N 顺序连点数字，主打顺滑解压的连击快感（纯逻辑 + 元数据，可单测）
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = arr[i]
    arr[i] = arr[j]
    arr[j] = t
  }
  return arr
}

// level = 网格边长（5~9）
function generate(size) {
  const total = size * size
  const nums = []
  for (let i = 1; i <= total; i++) nums.push(i)
  shuffle(nums)
  // 连续点对的连击窗口（本实现里连击=连续未点错，此值保留给未来可能的“停手断连”用）
  return { size, total, cells: nums, comboWindowMs: 2200 }
}

// state: { total, time(秒), errors, bestCombo }
// 解压定位：每个数字有基础分，超时/点错扣分，最高连击加分 → 越顺越解压、分数越高
function score(state) {
  const total = state.total || 0
  const time = state.time || 0
  const errors = state.errors || 0
  const bestCombo = state.bestCombo || 0
  const base = total * 10
  const timePenalty = Math.max(0, time - total) * 3
  const errPenalty = errors * 8
  const comboBonus = bestCombo * 6
  const sc = Math.max(0, Math.round(base - timePenalty - errPenalty + comboBonus))
  return { time, errors, bestCombo, total, score: sc }
}

module.exports = {
  id: 'connect',
  name: '解压连字',
  dim: 'attention',
  dimLabel: '注意力',
  icon: '🔗',
  color: '#2563eb',
  desc: '按 1→N 顺序连点数字，连击越顺越解压。',
  reference: '视觉搜索 + 手速；点得越顺、错得越少、连击越高，得分越高。',
  levels: [
    { value: 5, label: '5×5 入门' },
    { value: 6, label: '6×6' },
    { value: 7, label: '7×7 解压' },
    { value: 8, label: '8×8' },
    { value: 9, label: '9×9 挑战' },
  ],
  metric: { key: 'score', label: '得分', unit: '分', better: 'higher' },
  generate,
  score,
}
