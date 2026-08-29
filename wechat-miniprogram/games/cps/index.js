// 连点 CPS（Clicks Per Second）—— 纯逻辑 + 元数据（可单测）
function generate(level) {
  return { duration: level * 5 }
}

function score(state) {
  const clicks = state.clicks || 0
  const duration = state.duration || 0
  const cps = duration > 0 ? Math.round((clicks / duration) * 100) / 100 : 0
  return { clicks, score: clicks, duration, cps }
}

module.exports = {
  id: 'cps',
  name: '连点 CPS',
  dim: 'reaction',
  dimLabel: '反应速度',
  icon: '💥',
  color: '#eab308',
  desc: '限定时间内尽快点击，测量每秒点击数（CPS）。',
  reference: 'shuertefangge.com「CPS 连点」',
  levels: [
    { value: 1, label: '5 秒' },
    { value: 2, label: '10 秒' },
    { value: 3, label: '15 秒' },
  ],
  metric: { key: 'clicks', label: '点击数', unit: '次', better: 'higher' },
  generate,
  score,
}
