// 任务切换（Task Switching）—— 纯逻辑 + 元数据（可单测）
function generate(level) {
  const trials = level * 6
  const list = []
  for (let i = 0; i < trials; i++) {
    const num = Math.floor(Math.random() * 9) + 1
    const color = Math.random() < 0.5 ? 'red' : 'green'
    const rule = Math.random() < 0.5 ? 'color' : 'parity'
    list.push({ num, color, rule })
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
  id: 'task-switch',
  name: '任务切换',
  dim: 'exec',
  dimLabel: '执行功能',
  icon: '🔁',
  color: '#a855f7',
  desc: '按提示在「看颜色」与「看奇偶」间切换并作答，训练认知灵活性。',
  reference: 'shuertefangge.com「任务切换」',
  levels: [
    { value: 1, label: '6 题' },
    { value: 2, label: '12 题' },
    { value: 3, label: '18 题' },
  ],
  metric: { key: 'score', label: '得分', unit: '', better: 'higher' },
  generate,
  score,
}
