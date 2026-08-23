// 颜色匹配冲刺（Color Match）—— 纯逻辑 + 元数据（可单测）
const PALETTE = [
  { name: '红', hex: '#ef4444' },
  { name: '绿', hex: '#22c55e' },
  { name: '蓝', hex: '#3b82f6' },
  { name: '黄', hex: '#eab308' },
]

function generate(level) {
  const trials = level * 5
  const list = []
  for (let i = 0; i < trials; i++) {
    list.push({ ans: Math.floor(Math.random() * PALETTE.length), hex: PALETTE[Math.floor(Math.random() * PALETTE.length)].hex })
  }
  return { trials, list, palette: PALETTE }
}

function score(state) {
  const total = state.total || 0
  const correct = state.correct || 0
  const accuracy = total ? correct / total : 0
  return { correct, total, accuracy, score: Math.round(accuracy * 1000) }
}

module.exports = {
  id: 'color-match',
  name: '颜色匹配冲刺',
  dim: 'reaction',
  dimLabel: '反应速度',
  icon: '🎨',
  color: '#ec4899',
  desc: '看色块点出对应颜色名，训练颜色识别与反应。',
  reference: 'shuertefangge.com「颜色匹配冲刺」',
  levels: [
    { value: 1, label: '5 题' },
    { value: 2, label: '10 题' },
    { value: 3, label: '15 题' },
  ],
  metric: { key: 'score', label: '得分', unit: '', better: 'higher' },
  generate,
  score,
}
