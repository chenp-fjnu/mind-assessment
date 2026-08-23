// 方块记忆（Pattern Memory）—— 纯逻辑 + 元数据（可单测）
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = arr[i]
    arr[i] = arr[j]
    arr[j] = t
  }
  return arr
}

function generate(level) {
  const size = 4
  const total = size * size
  const patternCount = level
  const idxs = shuffle([...Array(total).keys()]).slice(0, patternCount)
  const cells = Array(total).fill(false)
  idxs.forEach((i) => (cells[i] = true))
  return { size, cells, patternCount }
}

function score(state) {
  const total = state.total || 0
  const correct = state.correct || 0
  const accuracy = total ? correct / total : 0
  return { correct, total, accuracy, score: Math.round(accuracy * 1000) }
}

module.exports = {
  id: 'pattern-memory',
  name: '方块记忆',
  dim: 'memory',
  dimLabel: '工作记忆',
  icon: '🟦',
  color: '#f59e0b',
  desc: '记住高亮的方块位置并复现，训练视觉工作记忆。',
  reference: 'shuertefangge.com「方块/图形记忆」',
  levels: [
    { value: 4, label: '4 格' },
    { value: 6, label: '6 格' },
    { value: 8, label: '8 格' },
    { value: 10, label: '10 格' },
  ],
  metric: { key: 'score', label: '得分', unit: '', better: 'higher' },
  generate,
  score,
}
