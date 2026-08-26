// 更大数字挑战（Bigger Number）—— 纯逻辑 + 元数据（可单测）
function generate(level) {
  const trials = level * 5
  const max = level <= 1 ? 9 : level === 2 ? 99 : 999
  const list = []
  for (let i = 0; i < trials; i++) {
    const a = Math.floor(Math.random() * max) + 1
    let b = Math.floor(Math.random() * max) + 1
    while (b === a) b = Math.floor(Math.random() * max) + 1
    list.push({ a, b })
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
  id: 'bigger-number',
  name: '更大数字挑战',
  dim: 'reaction',
  dimLabel: '反应速度',
  icon: '➕',
  color: '#06b6d4',
  desc: '在两个数字中尽快点出更大的那个，训练数量比较与反应。',
  reference: 'shuertefangge.com「更大数字挑战」',
  levels: [
    { value: 1, label: '1 位' },
    { value: 2, label: '2 位' },
    { value: 3, label: '3 位' },
  ],
  metric: { key: 'score', label: '得分', unit: '', better: 'higher' },
  generate,
  score,
}
