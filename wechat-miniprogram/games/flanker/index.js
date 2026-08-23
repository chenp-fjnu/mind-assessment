// Flanker 侧抑制（Eriksen Flanker）—— 纯逻辑 + 元数据（可单测）
function generate(trials) {
  const list = []
  for (let i = 0; i < trials; i++) {
    const dir = Math.random() < 0.5 ? 'left' : 'right'
    const congruent = Math.random() < 0.5
    list.push({ dir, congruent })
  }
  return { trials, list }
}

// state: { correct, total, times }
function score(state) {
  const total = state.total || 0
  const correct = state.correct || 0
  const times = state.times || []
  const accuracy = total ? correct / total : 0
  const avg = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0
  const score = Math.max(0, Math.round(accuracy * 1000 - avg * 0.5))
  return { correct, total, accuracy, avg, score }
}

module.exports = {
  id: 'flanker',
  name: 'Flanker 侧抑制',
  dim: 'reaction',
  dimLabel: '反应速度',
  icon: '➡️',
  color: '#f97316',
  desc: '按中间箭头方向判断，忽略两侧干扰箭头。',
  reference: 'Eriksen & Eriksen (1974) 侧抑制范式',
  levels: [
    { value: 10, label: '10 题 热身' },
    { value: 20, label: '20 题' },
    { value: 30, label: '30 题 挑战' },
  ],
  metric: { key: 'score', label: '得分', unit: '', better: 'higher' },
  generate,
  score,
}
