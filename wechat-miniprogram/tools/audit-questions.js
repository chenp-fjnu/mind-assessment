const path = require('path')
const qs = require(path.resolve(__dirname, '..', 'utils', 'questions'))

function cellSig(c) {
  if (!c) return 'NULL'
  const sh = (c.shapes || []).map((s) => `${s.type}:${s.size}:${s.color}:${s.fill}:${s.rotation}:${s.count}`).join('|')
  return (c.bg || '') + '#' + sh
}
function matrixSig(m) {
  return m.map((row) => row.map(cellSig).join(',')).join(';')
}
function optSig(o) {
  return (Array.isArray(o) ? o.map(cellSig).join(',') : cellSig(o))
}

console.log('total questions:', qs.length)
const matSet = new Set()
const optSet = new Set()
let bad = []
qs.forEach((q, i) => {
  const ms = matrixSig(q.matrix)
  matSet.add(ms)
  const os = (q.options || []).map(optSig).join('||')
  optSet.add(os)
  if (!q.options || q.options.length !== 6) bad.push(`#${i} ${q.id} options=${q.options ? q.options.length : 'none'}`)
  if (typeof q.answer !== 'number' || q.answer < 0 || q.answer > 5) bad.push(`#${i} ${q.id} answer=${q.answer}`)
  // last cell (bottom-right) should be the "missing" placeholder?
  const rows = q.matrix.length
  const lastRow = q.matrix[rows - 1]
  const lastCell = lastRow[lastRow.length - 1]
  const lastEmpty = !lastCell || !lastCell.shapes || lastCell.shapes.length === 0
  if (i < 8) {
    console.log(`${q.id} set=${q.set} matrix=${rows}x${lastRow.length} lastCellEmpty=${lastEmpty} ans=${q.answer} optShapes=${q.options[0].shapes.length}`)
  }
})
console.log('unique matrices:', matSet.size)
console.log('unique option-sets:', optSet.size)
console.log('bad:', bad.length)
bad.slice(0, 20).forEach((b) => console.log('  ', b))

// 检查相邻题是否矩阵相同（重复）
let dup = 0
for (let i = 1; i < qs.length; i++) {
  if (matrixSig(qs[i].matrix) === matrixSig(qs[i - 1].matrix)) dup++
}
console.log('consecutive identical matrices:', dup)
