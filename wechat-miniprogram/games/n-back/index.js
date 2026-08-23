// N-Back（视觉位置，双重可选）—— 纯逻辑 + 元数据（可单测）
function generate(opts) {
  const n = opts.n
  const trials = opts.trials || 20
  const seq = []
  for (let i = 0; i < trials; i++) seq.push(Math.floor(Math.random() * 9))
  return { n, trials, seq }
}

// state: { correct, total, times }
function score(state) {
  const total = state.total || 0
  const correct = state.correct || 0
  const times = state.times || []
  const accuracy = total ? correct / total : 0
  const avg = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0
  const score = Math.max(0, Math.round(accuracy * 1000 - avg * 0.5))
  return { correct, total, accuracy, avg, score }
}

module.exports = {
  id: 'n-back',
  name: 'N-Back',
  dim: 'memory',
  dimLabel: '工作记忆',
  icon: '🧠',
  color: '#8b5cf6',
  desc: '判断当前方块位置是否与 N 步前相同，训练工作记忆。',
  reference: 'Jaeggi et al. (2008) 工作记忆训练范式（视觉位置版）',
  levels: [
    { value: 1, label: 'N=1 入门' },
    { value: 2, label: 'N=2' },
    { value: 3, label: 'N=3 挑战' },
  ],
  metric: { key: 'score', label: '得分', unit: '', better: 'higher' },
  generate,
  score,
}
