// Go-NoGo（Go-NoGo）—— 纯逻辑 + 元数据（可单测）
function generate(level) {
  const trials = level * 8
  const list = []
  for (let i = 0; i < trials; i++) {
    const go = Math.random() < 0.7
    list.push({ go, color: go ? 'green' : 'red' })
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
  id: 'go-no-go',
  name: 'Go-NoGo',
  dim: 'reaction',
  dimLabel: '反应速度',
  icon: '🟢',
  color: '#22c55e',
  desc: '绿色出现要点击、红色出现要忍住，训练冲动抑制。',
  reference: 'shuertefangge.com「Go-NoGo」',
  levels: [
    { value: 1, label: '8 题' },
    { value: 2, label: '16 题' },
    { value: 3, label: '24 题' },
  ],
  metric: { key: 'score', label: '得分', unit: '', better: 'higher' },
  generate,
  score,
}
