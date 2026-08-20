/**
 * 重新生成 SPM（瑞文标准推理）60 题数据。
 * 设计目标：
 *   - 每题恰好 6 个候选选项；
 *   - 右下角单元格为空（需补全）；
 *   - 正确答案（options[answer]）放进空单元格后，整图严格符合一条可复现的图形规律
 *     （沿行/列的递进，或两个属性的组合递进），从而数据"准确"且可解；
 *   - 干扰项均为"只改一个属性"的近似项，保证答案唯一；
 *   - 60 题矩阵互不重复。
 *
 * 运行：node tools/gen-spm.js  ->  覆盖 utils/questions.js
 */
const fs = require('fs')
const path = require('path')

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rng = mulberry32(20260820)
const ri = (n) => Math.floor(rng() * n)
const pick = (arr) => arr[ri(arr.length)]
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = ri(i + 1)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const SHAPES = ['circle', 'square', 'triangle', 'diamond', 'hexagon', 'star']
const COLORS = ['#1f2937', '#dc2626', '#2563eb', '#16a34a', '#d97706']
const FILLS = ['solid', 'hollow']
const ROTS = [0, 90, 180, 270]
const COUNTS = [1, 2, 3]

function base() {
  return { shape: pick(SHAPES), color: pick(COLORS), fill: 'solid', rotation: pick(ROTS), count: 1 }
}
function cellOf(v) {
  return {
    bg: null,
    shapes: [{ type: v.shape, size: 80, color: v.color, rotation: v.rotation, fill: v.fill, count: v.count }],
  }
}
function otherAttr(attr, cur) {
  const dom = { shape: SHAPES, color: COLORS, fill: FILLS, rotation: ROTS, count: COUNTS }[attr]
  let v
  do { v = pick(dom) } while (v === cur)
  return v
}
function seqFor(attr, N) {
  if (attr === 'rotation') return ROTS.slice(0, N)
  if (attr === 'count') return COUNTS.slice(0, N)
  const dom = { shape: SHAPES, color: COLORS, fill: FILLS }[attr]
  return shuffle(dom.slice()).slice(0, N)
}

function progRule(attr, seq, dir, b) {
  return (r, c) => {
    const v = { ...b }
    v[attr] = seq[dir === 'col' ? c : r]
    return v
  }
}
function combRule(aX, seqX, dirX, aY, seqY, dirY, b) {
  return (r, c) => {
    const v = { ...b }
    v[aX] = seqX[dirX === 'col' ? c : r]
    v[aY] = seqY[dirY === 'col' ? c : r]
    return v
  }
}

function makeItem(set, N, idx, gi, kind) {
  const b = base()
  let ruleFn, varying, ruleDesc
  if (kind === 'prog') {
    const attr = pick(['shape', 'color', 'rotation', 'count'].concat(N === 2 ? ['fill'] : []))
    const seq = seqFor(attr, N)
    const dir = pick(['row', 'col'])
    ruleFn = progRule(attr, seq, dir, b)
    varying = [attr]
    ruleDesc = `${attr} 沿${dir === 'col' ? '列' : '行'}递进`
  } else {
    const attrs = shuffle(['shape', 'color', 'rotation', 'count']).slice(0, 2)
    const [aX, aY] = attrs
    const seqX = seqFor(aX, N)
    const seqY = seqFor(aY, N)
    let dirX = pick(['row', 'col'])
    let dirY = pick(['row', 'col'])
    if (set === 'E') { dirX = 'row'; dirY = 'col' }
    ruleFn = combRule(aX, seqX, dirX, aY, seqY, dirY, b)
    varying = [aX, aY]
    ruleDesc = `${aX}(${dirX === 'col' ? '列' : '行'})+${aY}(${dirY === 'col' ? '列' : '行'})`
  }

  const grid = []
  for (let r = 0; r < N; r++) {
    const row = []
    for (let c = 0; c < N; c++) row.push(cellOf(ruleFn(r, c)))
    grid.push(row)
  }
  grid[N - 1][N - 1] = { bg: null, shapes: [] } // 空缺单元格

  const correct = ruleFn(N - 1, N - 1)
  const correctCell = cellOf(correct)

  const opts = [correctCell]
  const seen = new Set([JSON.stringify(correctCell)])
  let guard = 0
  while (opts.length < 6 && guard < 300) {
    guard++
    const v = { ...correct }
    const a = pick(varying)
    v[a] = otherAttr(a, correct[a])
    const cell = cellOf(v)
    const key = JSON.stringify(cell)
    if (!seen.has(key)) { seen.add(key); opts.push(cell) }
  }
  while (opts.length < 6) {
    const v = { ...correct }
    const a = pick(['shape', 'color', 'rotation', 'count', 'fill'])
    v[a] = otherAttr(a, correct[a])
    const cell = cellOf(v)
    const key = JSON.stringify(cell)
    if (!seen.has(key)) { seen.add(key); opts.push(cell) }
  }
  shuffle(opts)
  const answer = opts.findIndex((o) => JSON.stringify(o) === JSON.stringify(correctCell))
  if (answer < 0) throw new Error('answer not found at ' + gi)
  const matches = opts.filter((o) => JSON.stringify(o) === JSON.stringify(correctCell)).length
  if (matches !== 1) throw new Error('answer not unique at ' + gi)
  return {
    id: `SPM-${String(gi).padStart(3, '0')}`,
    set,
    indexInSet: idx + 1,
    globalIndex: gi,
    rule: ruleDesc,
    matrix: grid,
    options: opts,
    answer,
    timeLimit: 40,
  }
}

const SETS = [
  { set: 'A', N: 2, kind: 'prog' },
  { set: 'B', N: 3, kind: 'prog' },
  { set: 'C', N: 3, kind: 'combo' },
  { set: 'D', N: 3, kind: 'combo' },
  { set: 'E', N: 3, kind: 'combo' },
]
const items = []
let gi = 1
const sigs = new Set()
for (const s of SETS) {
  for (let i = 0; i < 12; i++) {
    let it
    let guard = 0
    do { it = makeItem(s.set, s.N, i, gi, s.kind); guard++ } while (sigs.has(JSON.stringify(it.matrix)) && guard < 20)
    sigs.add(JSON.stringify(it.matrix))
    items.push(it)
    gi++
  }
}

const header = `/**
 * SPM 题目数据（由 tools/gen-spm.js 重新生成，保证每题 6 个选项、答案唯一且符合图形规律）
 * 生成时间：${new Date().toISOString()}
 * 题目数：60（A/B/C/D/E 各 12 题）
 * 图形结构：{ bg, shapes: [{ type, size, color, rotation, fill, count }] }
 * 约定：matrix 为 N×N，右下角单元格（最后一行最后一列）为空，需从 options 中补全。
 */\n`
fs.writeFileSync(
  path.resolve(__dirname, '..', 'utils', 'questions.js'),
  header + 'module.exports = ' + JSON.stringify(items, null, 2) + '\n'
)
console.log('generated', items.length, 'items')
