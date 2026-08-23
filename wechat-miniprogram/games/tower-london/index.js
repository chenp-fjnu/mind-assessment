// 伦敦塔（Tower of London）—— 纯逻辑 + 元数据（可单测）
const BALL_COLORS = ['#ef4444', '#22c55e', '#3b82f6']
const BALL_NAMES = ['红', '绿', '蓝']

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = arr[i]
    arr[i] = arr[j]
    arr[j] = t
  }
  return arr
}

function randStart() {
  const balls = shuffle([0, 1, 2])
  const pegs = [[], [], []]
  balls.forEach((b) => {
    const p = Math.floor(Math.random() * 3)
    pegs[p].push(b)
  })
  if (pegs.every((p) => p.length <= 1)) return randStart()
  return pegs
}

function same(a, b) {
  return JSON.stringify(a) === JSON.stringify(b)
}

function generate(level) {
  const start = randStart()
  let goal = start
  let guard = 0
  while ((same(goal, start) || guard < 6) && guard < 60) {
    goal = start.map((p) => p.slice())
    const steps = 4 + level
    for (let s = 0; s < steps; s++) {
      const from = Math.floor(Math.random() * 3)
      if (!goal[from].length) continue
      let to = Math.floor(Math.random() * 3)
      if (to === from) to = (to + 1) % 3
      goal[to].push(goal[from].pop())
    }
    guard++
    if (!same(goal, start)) break
  }
  return { start, goal, balls: BALL_COLORS, names: BALL_NAMES }
}

function score(state) {
  const moves = state.moves || 0
  return { moves, score: Math.max(0, Math.round(1000 - moves * 30)) }
}

module.exports = {
  id: 'tower-london',
  name: '伦敦塔',
  dim: 'exec',
  dimLabel: '执行功能',
  icon: '🏰',
  color: '#0d9488',
  desc: '用最少步数把彩球移动到目标位置，训练计划与执行功能。',
  reference: 'shuertefangge.com「伦敦塔」',
  levels: [
    { value: 2, label: '简单' },
    { value: 4, label: '普通' },
    { value: 6, label: '困难' },
  ],
  metric: { key: 'moves', label: '步数', unit: '步', better: 'lower' },
  generate,
  score,
}
