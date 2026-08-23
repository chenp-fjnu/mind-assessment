// 镜像沙漏（Mirror）—— 纯逻辑 + 元数据（可单测）
function randPattern() {
  const cells = []
  for (let i = 0; i < 9; i++) cells.push(Math.random() < 0.55 ? 1 : 0)
  if (cells.every((v) => !v)) cells[4] = 1
  return cells
}
function mirrorH(p) {
  return [p[2], p[1], p[0], p[5], p[4], p[3], p[8], p[7], p[6]]
}

function generate(level) {
  const trials = level * 5
  const list = []
  for (let i = 0; i < trials; i++) {
    const p = randPattern()
    const isMirror = Math.random() < 0.5
    let q
    if (isMirror) {
      q = mirrorH(p)
    } else {
      do {
        q = randPattern()
      } while (JSON.stringify(q) === JSON.stringify(mirrorH(p)) || JSON.stringify(q) === JSON.stringify(p))
    }
    list.push({ p, q, answer: isMirror })
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
  id: 'mirror',
  name: '镜像沙漏',
  dim: 'attention',
  dimLabel: '注意力',
  icon: '🪞',
  color: '#0ea5e9',
  desc: '判断两个图形是否互为镜像，训练视觉转换与注意。',
  reference: 'shuertefangge.com「镜像沙漏」',
  levels: [
    { value: 2, label: '10 题' },
    { value: 3, label: '15 题' },
    { value: 4, label: '20 题' },
  ],
  metric: { key: 'score', label: '得分', unit: '', better: 'higher' },
  generate,
  score,
}
