// 科西方块（Corsi）—— 纯逻辑 + 元数据（可单测）
function generate(level) {
  const blocks = 9
  const seq = []
  for (let i = 0; i < level; i++) seq.push(Math.floor(Math.random() * blocks))
  return { blocks, seq }
}

function score(state) {
  const total = state.total || 0
  const correct = state.correct || 0
  const accuracy = total ? correct / total : 0
  return { correct, total, accuracy, score: Math.round(accuracy * 1000) }
}

module.exports = {
  id: 'corsi',
  name: '科西方块',
  dim: 'memory',
  dimLabel: '工作记忆',
  icon: '🟪',
  color: '#8b5cf6',
  desc: '记住点亮方块的先后顺序并依序点出，训练视空间工作记忆。',
  reference: 'shuertefangge.com「科西方块 Corsi」',
  levels: [
    { value: 3, label: '3 步' },
    { value: 4, label: '4 步' },
    { value: 5, label: '5 步' },
    { value: 6, label: '6 步' },
  ],
  metric: { key: 'score', label: '得分', unit: '', better: 'higher' },
  generate,
  score,
}
