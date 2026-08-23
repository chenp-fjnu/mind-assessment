// 斯特鲁普（Stroop）—— 纯逻辑 + 元数据（可单测）
const COLORS = [
  { key: 'red', name: '红', hex: '#ef4444' },
  { key: 'blue', name: '蓝', hex: '#3b82f6' },
  { key: 'green', name: '绿', hex: '#22c55e' },
  { key: 'yellow', name: '黄', hex: '#eab308' },
  { key: 'purple', name: '紫', hex: '#a855f7' },
]

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// level = 试次数
function generate(trials) {
  const list = []
  for (let i = 0; i < trials; i++) {
    const word = pick(COLORS)
    let ink = pick(COLORS)
    // 约 60% 冲突（词义 ≠ 墨色）
    if (Math.random() < 0.6) {
      while (ink.key === word.key) ink = pick(COLORS)
    }
    list.push({ word: word.name, wordKey: word.key, inkKey: ink.key, inkHex: ink.hex })
  }
  return { trials, list, options: COLORS.map((c) => ({ key: c.key, name: c.name, hex: c.hex })) }
}

// state: { total, correct, errors, time(秒) }
function score(state) {
  const total = state.total || 0
  const correct = state.correct || 0
  const time = state.time || 0
  const accuracy = total ? correct / total : 0
  const score = Math.max(0, Math.round(accuracy * 1000 - Math.max(0, time - total * 1.2) * 4))
  return { time, correct, total, errors: state.errors || 0, accuracy, score }
}

module.exports = {
  id: 'stroop',
  name: '斯特鲁普',
  dim: 'reaction',
  dimLabel: '反应速度',
  icon: '🌈',
  color: '#f59e0b',
  desc: '说出墨水的颜色而非词义，训练抑制控制与冲突处理。',
  reference: 'Stroop (1935) 经典色词任务',
  levels: [
    { value: 10, label: '10 题 热身' },
    { value: 20, label: '20 题' },
    { value: 30, label: '30 题 挑战' },
  ],
  metric: { key: 'score', label: '得分', unit: '', better: 'higher' },
  generate,
  score,
  COLORS,
}
