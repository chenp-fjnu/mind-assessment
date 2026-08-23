// 序列记忆 Simon（Simon）—— 纯逻辑 + 元数据（可单测）
function generate(level) {
  const pads = 4
  const seq = []
  for (let i = 0; i < level; i++) seq.push(Math.floor(Math.random() * pads))
  return { pads, seq }
}

function score(state) {
  const total = state.total || 0
  const correct = state.correct || 0
  const accuracy = total ? correct / total : 0
  return { correct, total, accuracy, score: Math.round(accuracy * 1000) }
}

module.exports = {
  id: 'simon',
  name: '序列记忆',
  dim: 'memory',
  dimLabel: '工作记忆',
  icon: '🎹',
  color: '#ef4444',
  desc: '记住并复述闪烁的色块顺序，训练序列工作记忆。',
  reference: 'shuertefangge.com「序列记忆 Simon」',
  levels: [
    { value: 3, label: '3 步' },
    { value: 5, label: '5 步' },
    { value: 7, label: '7 步' },
    { value: 9, label: '9 步' },
  ],
  metric: { key: 'score', label: '得分', unit: '', better: 'higher' },
  generate,
  score,
}
