// 汉诺塔（Tower of Hanoi）—— 纯逻辑 + 元数据（可单测）
function generate(level) {
  const disks = level // 3,4,5
  const pegs = [Array.from({ length: disks }, (_, i) => disks - i), [], []]
  const optimal = Math.pow(2, disks) - 1
  return { disks, pegs, goal: 2, optimal }
}

function score(state) {
  const moves = state.moves || 0
  const optimal = state.optimal || 0
  const extra = Math.max(0, moves - optimal)
  return { moves, optimal, score: Math.max(0, Math.round(1000 - extra * 40)) }
}

module.exports = {
  id: 'hanoi',
  name: '汉诺塔',
  dim: 'exec',
  dimLabel: '执行功能',
  icon: '🗼',
  color: '#f43f5e',
  desc: '把整叠圆盘从最左移到最右，大盘不能压小盘，训练计划与执行功能。',
  reference: 'shuertefangge.com「汉诺塔」',
  hot: true,
  levels: [
    { value: 3, label: '3 盘' },
    { value: 4, label: '4 盘' },
    { value: 5, label: '5 盘' },
  ],
  metric: { key: 'moves', label: '步数', unit: '步', better: 'lower' },
  generate,
  score,
}
