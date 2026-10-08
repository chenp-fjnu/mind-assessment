// 边缘聚焦（Edge Focus）—— 纯逻辑 + 元数据（可单测）
// 玩法：全程锁定一个「目标图形」。每轮 3×3 网格中，中央格出现目标则按「空格」；
// 中央没出现、仅边缘格出现同形干扰（诱导）时必须忍住不按。
const SHAPES = ['●', '■', '▲', '★', '◆']
const ROUND_COUNT = [8, 12, 16]

function otherShape(target) {
  const pool = SHAPES.filter((s) => s !== target)
  return pool[Math.floor(Math.random() * pool.length)]
}

function generate(level) {
  const lv = level >= 1 && level <= 3 ? level : 1
  const rounds = ROUND_COUNT[lv - 1]
  const target = SHAPES[Math.floor(Math.random() * SHAPES.length)]
  const list = []
  for (let i = 0; i < rounds; i++) {
    const central = Math.random() < 0.5
    // 中央未命中时，边缘带同形诱导的概率（诱发误按）
    const edgeSame = !central && Math.random() < 0.6
    const edges = []
    for (let j = 0; j < 8; j++) {
      // edgeSame 时隔位放目标形（最多 4 个），否则全为异形
      edges.push(edgeSame && j % 2 === 0 ? target : otherShape(target))
    }
    list.push({
      central,
      edgeSame,
      edges,
      center: central ? target : otherShape(target),
    })
  }
  return { rounds, target, list }
}

function score(state) {
  const total = state.total || 0
  const correct = state.correct || 0
  const accuracy = total ? correct / total : 0
  return { correct, total, accuracy, score: Math.round(accuracy * 1000) }
}

module.exports = {
  id: 'edge-focus',
  name: '边缘聚焦',
  dim: 'attention',
  dimLabel: '注意力',
  icon: '🎯',
  color: '#0ea5e9',
  desc: '中央出现目标图形按空格，边缘同形干扰要忍住，训练选择性注意与冲动抑制。',
  reference: '八少八素「808 神测」边缘聚焦题型（公开真题描述改编）',
  levels: [
    { value: 1, label: '8 轮' },
    { value: 2, label: '12 轮' },
    { value: 3, label: '16 轮' },
  ],
  metric: { key: 'score', label: '得分', unit: '', better: 'higher' },
  generate,
  score,
}
