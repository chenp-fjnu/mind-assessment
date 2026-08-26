// 数字广度（Digit Span）—— 纯逻辑 + 元数据（可单测）
function generate(level) {
  const len = level
  const seq = []
  for (let i = 0; i < len; i++) seq.push(Math.floor(Math.random() * 10))
  return { len, seq }
}

function score(state) {
  const total = state.total || 0
  const correct = state.correct || 0
  const accuracy = total ? correct / total : 0
  return { correct, total, accuracy, score: Math.round(accuracy * 1000) }
}

module.exports = {
  id: 'digit-span',
  name: '数字广度',
  dim: 'memory',
  dimLabel: '工作记忆',
  icon: '🧮',
  color: '#10b981',
  desc: '记住短暂显示的数字序列并依次点出，训练言语工作记忆广度。',
  reference: 'shuertefangge.com「数字广度」',
  levels: [
    { value: 4, label: '4 位' },
    { value: 6, label: '6 位' },
    { value: 8, label: '8 位' },
    { value: 10, label: '10 位' },
  ],
  metric: { key: 'score', label: '得分', unit: '', better: 'higher' },
  generate,
  score,
}
