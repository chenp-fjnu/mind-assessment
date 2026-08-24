// 数字划消（Cancellation）—— 纯逻辑 + 元数据（可单测）
const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

function generate(level) {
  const target = String(level)
  // 最大 9×9，避免 10×10 过大导致点击困难
  const size = level === 7 ? 9 : 8
  const rows = size
  const cols = size
  const total = rows * cols
  const cells = []
  let targetCount = 0
  for (let i = 0; i < total; i++) {
    if (Math.random() < 0.32) {
      cells.push(target)
      targetCount++
    } else {
      let c
      do {
        c = DIGITS[Math.floor(Math.random() * DIGITS.length)]
      } while (c === target)
      cells.push(c)
    }
  }
  return { rows, cols, target, cells, total, targetCount, size }
}

// state: { targetCount, found, errors, time }
function score(state) {
  const targetCount = state.targetCount || 0
  const found = state.found || 0
  const errors = state.errors || 0
  const time = state.time || 0
  const missed = Math.max(0, targetCount - found)
  const accuracy = targetCount ? found / targetCount : 0
  const penalty = Math.max(0, time - targetCount * 1.2) * 2 + errors * 8 + missed * 10
  const score = Math.max(0, Math.round(1000 - penalty))
  return { found, targetCount, errors, missed, time, accuracy, score }
}

module.exports = {
  id: 'cancellation',
  name: '数字划消',
  dim: 'attention',
  dimLabel: '注意力',
  icon: '🧹',
  color: '#0d9488',
  desc: '在字符矩阵中划掉所有目标数字，训练视觉分辨与持续注意。',
  reference: '临床注意力持续操作常用任务',
  levels: [
    { value: 0, label: '划掉 0（8×8）' },
    { value: 3, label: '划掉 3（8×8）' },
    { value: 7, label: '划掉 7（9×9）' },
  ],
  metric: { key: 'time', label: '用时', unit: 's', better: 'lower' },
  generate,
  score,
}