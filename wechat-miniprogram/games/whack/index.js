// 打地鼠（Whack）—— 纯逻辑 + 元数据（可单测）
function generate(level) {
  const grid = 3
  const total = grid * grid
  const trials = level * 5
  return { grid, total, trials }
}

function score(state) {
  const hits = state.hits || 0
  const misses = state.misses || 0
  return { hits, misses, score: hits }
}

module.exports = {
  id: 'whack',
  name: '打地鼠',
  dim: 'reaction',
  dimLabel: '反应速度',
  icon: '🔨',
  color: '#f97316',
  desc: '地鼠冒头尽快点击，训练反应速度与手眼协调。',
  reference: 'shuertefangge.com「打地鼠」',
  levels: [
    { value: 2, label: '10 只' },
    { value: 3, label: '15 只' },
    { value: 4, label: '20 只' },
  ],
  metric: { key: 'hits', label: '命中', unit: '只', better: 'higher' },
  generate,
  score,
}
