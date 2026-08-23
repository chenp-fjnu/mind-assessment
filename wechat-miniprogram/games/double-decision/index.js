// 双重决策（Double Decision）—— 纯逻辑 + 元数据（可单测）
function generate(level) {
  const trials = level * 6
  const list = []
  for (let i = 0; i < trials; i++) {
    const dir = Math.random() < 0.5 ? -1 : 1
    const cue = Math.random() < 0.5 ? 'blue' : 'red'
    list.push({ dir, cue })
  }
  return { trials, list }
}

function score(state) {
  const total = state.total || 0
  const correct = state.correct || 0
  const accuracy = total ? correct / total : 0
  return { correct, total, accuracy, score: Math.round(accuracy * 1000) }
}

module.exports = {
  id: 'double-decision',
  name: '双重决策',
  dim: 'reaction',
  dimLabel: '反应速度',
  icon: '🔀',
  color: '#0ea5e9',
  desc: '蓝箭头按方向点、红箭头按反方向点，训练双重任务转换。',
  reference: 'shuertefangge.com「双重决策」',
  levels: [
    { value: 1, label: '6 题' },
    { value: 2, label: '12 题' },
    { value: 3, label: '18 题' },
  ],
  metric: { key: 'score', label: '得分', unit: '', better: 'higher' },
  generate,
  score,
}
