// 数字迷宫（Number Maze）—— 纯逻辑 + 元数据（可单测）
function genMaze(size) {
  const walls = []
  for (let r = 0; r < size; r++) {
    walls.push([])
    for (let c = 0; c < size; c++) walls[r].push([true, true, true, true])
  }
  const visited = Array.from({ length: size }, () => Array(size).fill(false))
  const stack = [[0, 0]]
  visited[0][0] = true
  while (stack.length) {
    const [r, c] = stack[stack.length - 1]
    const neigh = []
    if (r > 0 && !visited[r - 1][c]) neigh.push([r - 1, c, 0, 2])
    if (c < size - 1 && !visited[r][c + 1]) neigh.push([r, c + 1, 1, 3])
    if (r < size - 1 && !visited[r + 1][c]) neigh.push([r + 1, c, 2, 0])
    if (c > 0 && !visited[r][c - 1]) neigh.push([r, c - 1, 3, 1])
    if (!neigh.length) {
      stack.pop()
      continue
    }
    const [nr, nc, dir, opp] = neigh[Math.floor(Math.random() * neigh.length)]
    walls[r][c][dir] = false
    walls[nr][nc][opp] = false
    visited[nr][nc] = true
    stack.push([nr, nc])
  }
  return walls
}

function generate(level) {
  const size = level
  const walls = genMaze(size)
  const optimal = size * size - 1
  return { size, walls, start: 0, exit: size * size - 1, optimal }
}

function score(state) {
  const steps = state.steps || 0
  const time = state.time || 0
  const optimal = state.optimal || 0
  const penalty = Math.max(0, steps - optimal) * 8 + Math.max(0, time - optimal * 0.8) * 3
  return { steps, time, optimal, score: Math.max(0, Math.round(1000 - penalty)) }
}

module.exports = {
  id: 'number-maze',
  name: '数字迷宫',
  dim: 'attention',
  dimLabel: '注意力',
  icon: '❓',
  color: '#4f46e5',
  desc: '从起点走到终点，训练视觉追踪与路径规划。',
  reference: 'shuertefangge.com「数字迷宫」',
  levels: [
    { value: 4, label: '4×4' },
    { value: 5, label: '5×5' },
    { value: 6, label: '6×6' },
    { value: 7, label: '7×7' },
  ],
  metric: { key: 'steps', label: '步数', unit: '步', better: 'lower' },
  generate,
  score,
}
