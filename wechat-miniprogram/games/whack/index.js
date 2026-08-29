// 打地鼠（Whack）—— 纯逻辑 + 元数据（可单测）
function generate(level) {
  const grid = 3
  const total = grid * grid
  // 地鼠数量固定（命中目标），炸弹为额外随机若干个
  const moles = level * 5
  const bombMin = level
  const bombMax = level + 2
  // 难度越高，地鼠冒头停留越短（毫秒）；同时留一点间隔避免连点误判
  const showMs = level <= 2 ? 1000 : level === 3 ? 800 : 650
  const gapMs = 200
  return { grid, total, moles, bombMin, bombMax, showMs, gapMs }
}

function score(state) {
  const hits = state.hits || 0
  const misses = state.misses || 0
  const escaped = state.escaped || 0
  const bombs = state.bombs || 0
  // 游戏内会累计连击得分（state.score）；纯函数场景下按命中/失误/炸弹估算，保证可比较
  const score = state.score != null ? state.score : hits * 10 - misses * 5 - bombs * 15
  return { hits, misses, escaped, bombs, score, bestCombo: state.bestCombo || 0 }
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
