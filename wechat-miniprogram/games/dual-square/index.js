// 双任务方块（dual-square）—— 纯逻辑 + 元数据（可单测）
// 玩法：并行呈现两个通道的目标，任一命中即按「空格」：
//   视觉：4 个 × 是否恰好组成 2×2 正方形；
//   听觉：两个连续音是否同高（双音同高 → 命中）。
const TONES = [660, 330] // 高音 / 低音
const BLOCKS = [
  [0, 1, 3, 4],
  [1, 2, 4, 5],
  [3, 4, 6, 7],
  [4, 5, 7, 8],
]
const ALL_CELLS = [0, 1, 2, 3, 4, 5, 6, 7, 8]

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = a[i]
    a[i] = a[j]
    a[j] = t
  }
  return a
}

function isSquareBlock(cells) {
  const s = cells.slice().sort((a, b) => a - b).join(',')
  return BLOCKS.some((b) => b.slice().sort((a, b) => a - b).join(',') === s)
}

// 随机散摆 4 格，且不形成任何 2×2 方块
function scatterCells() {
  for (let guard = 0; guard < 100; guard++) {
    const cells = shuffle(ALL_CELLS).slice(0, 4).sort((a, b) => a - b)
    if (!isSquareBlock(cells)) return cells
  }
  return [0, 2, 4, 6]
}

// 生成一轮的组合：sq=视觉正方形，tn=双音同高
function makeRound(square, doubleTone) {
  const cells = square ? BLOCKS[Math.floor(Math.random() * BLOCKS.length)].slice().sort((a, b) => a - b) : scatterCells()
  const first = TONES[Math.floor(Math.random() * TONES.length)]
  const second = doubleTone
    ? first
    : TONES.filter((f) => f !== first)[Math.floor(Math.random() * (TONES.length - 1))]
  return { square, doubleTone, cells, tones: [first, second] }
}

function combosFor(level) {
  const lv = level >= 1 && level <= 3 ? level : 1
  if (lv === 1) return [[true, false], [false, true], [false, false]]
  if (lv === 2) return shuffle([[true, false], [false, true], [true, true], [false, false]])
  const pool = [[true, false], [false, true], [true, true], [false, false], [true, false], [false, true]]
  return shuffle(pool)
}

function generate(level) {
  const combos = combosFor(level)
  const rounds = combos.map(([sq, tn]) => makeRound(sq, tn))
  return { rounds: rounds.length, list: rounds, targets: rounds.map((r) => r.square || r.doubleTone) }
}

function score(state) {
  const total = state.total || 0
  const correct = state.correct || 0
  const accuracy = total ? correct / total : 0
  return { correct, total, accuracy, score: Math.round(accuracy * 1000) }
}

module.exports = {
  id: 'dual-square',
  name: '双任务方块',
  dim: 'exec',
  dimLabel: '执行功能',
  icon: '🔲',
  color: '#6366f1',
  desc: '双通道同时进行：4 个 × 组成正方形、或连续两个音同高，任一命中按空格。',
  reference: '双任务范式（视觉 + 听觉并行监控）',
  levels: [
    { value: 1, label: '3 轮' },
    { value: 2, label: '4 轮' },
    { value: 3, label: '6 轮' },
  ],
  metric: { key: 'score', label: '得分', unit: '', better: 'higher' },
  generate,
  score,
  isSquareBlock,
  TONES,
}
