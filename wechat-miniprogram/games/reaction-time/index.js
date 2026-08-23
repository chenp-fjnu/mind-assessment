// 反应时间（Reaction Time）—— 纯逻辑 + 元数据（可单测）
function generate(trials) {
  return { trials }
}

// state: { times:number[], total, early }
function score(state) {
  const times = state.times || []
  const total = state.total || 0
  const avg = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0
  const best = times.length ? Math.min.apply(null, times) : 0
  const score = Math.max(0, Math.round(1000 - avg * 3))
  return { avg, best, total, early: state.early || 0, score }
}

module.exports = {
  id: 'reaction-time',
  name: '反应时间',
  dim: 'reaction',
  dimLabel: '反应速度',
  icon: '⚡',
  color: '#ef4444',
  desc: '屏幕变绿后尽快点击，测你的视觉反应速度。',
  reference: 'reactiontester.com 简单反应时范式',
  levels: [
    { value: 5, label: '5 次 热身' },
    { value: 10, label: '10 次' },
    { value: 20, label: '20 次 挑战' },
  ],
  metric: { key: 'avg', label: '平均反应', unit: 'ms', better: 'lower' },
  generate,
  score,
}
