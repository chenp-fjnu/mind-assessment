/**
 * 校验：每个题目的「选项」内部不得出现重复（正确答案必须唯一可辨）。
 * 运行：node tools/audit-options.js
 */
const { getMetaList, getModule } = require('../utils/registry')

let problems = 0
let checked = 0

function optionList(q) {
  if (Array.isArray(q.candidates) && q.candidates.length) return q.candidates
  if (Array.isArray(q.options)) return q.options
  return []
}
function keyOf(o) {
  if (o == null) return 'null'
  if (typeof o === 'string') return 't:' + o
  if (typeof o === 'number') return 'n:' + o
  return 'j:' + JSON.stringify(o)
}

// 视觉等价键：旋转对称图形（圆/方/六边形）的不同旋转角视觉相同，需归一化，
// 以捕获“形状相同但因旋转看起来重复”的隐患（瑞文曾用 rotation 作变化属性导致此问题）
const SYMMETRIC = { circle: true, square: true, hexagon: true }
function normCell(cell) {
  const shapes = (cell && cell.shapes) || []
  // 注意：不排序，保留单元格位置（网格题中不同排布视觉不同）
  return shapes
    .map((s) => {
      const rot = SYMMETRIC[s.type] ? 0 : s.rotation || 0
      return [s.type, s.color, s.fill, s.count || 1, rot].join('|')
    })
    .join(',')
}
function visualKeyOf(o) {
  if (o == null) return 'null'
  if (typeof o === 'string') return 't:' + o
  if (typeof o === 'number') return 'n:' + o
  if (Array.isArray(o)) {
    // 积木候选（2x2 网格）：逐行、逐单元格归一化，保留位置
    return 'g:' + o.map((row) => (Array.isArray(row) ? row.map(normCell).join(',') : normCell(row))).join(';')
  }
  return 'c:' + normCell(o) // 瑞文选项（单个单元格）
}

getMetaList().forEach((meta) => {
  const mod = getModule(meta.id)
  const qs = mod.getQuestions()
  qs.forEach((q, qi) => {
    const opts = optionList(q)
    if (!opts.length) return
    checked++
    const keys = opts.map(keyOf)
    const seen = new Map()
    keys.forEach((k, i) => {
      if (seen.has(k)) {
        problems++
        console.error(`✗ [${meta.id}] #${qi + 1} (${q.id || ''}) 选项重复：第 ${seen.get(k) + 1} 与第 ${i + 1} 个选项相同`)
      } else {
        seen.set(k, i)
      }
    })
    // 视觉等价（旋转对称图形不同转角视为相同）重复检测
    const vkeys = opts.map(visualKeyOf)
    const vseen = new Map()
    vkeys.forEach((k, i) => {
      if (vseen.has(k)) {
        problems++
        console.error(`✗ [${meta.id}] #${qi + 1} (${q.id || ''}) 视觉重复：第 ${vseen.get(k) + 1} 与第 ${i + 1} 个选项看起来相同`)
      } else {
        vseen.set(k, i)
      }
    })
    // 正确答案唯一性（仅对“有标准答案”的题目校验；自陈量表 answer 为 null 属正常）
    if (q.answer != null) {
      if (typeof q.answer !== 'number' || q.answer < 0 || q.answer >= opts.length) {
        problems++
        console.error(`✗ [${meta.id}] #${qi + 1} (${q.id || ''}) answer 越界: ${q.answer}`)
      } else {
        const ak = keyOf(opts[q.answer])
        const sameCount = keys.filter((k) => k === ak).length
        if (sameCount > 1) {
          problems++
          console.error(`✗ [${meta.id}] #${qi + 1} (${q.id || ''}) 正确答案对应选项出现 ${sameCount} 次（不唯一）`)
        }
      }
    }
  })
})

console.log(`\n校验完成：检查题目 ${checked} 道，发现问题 ${problems} 处`)
process.exit(problems ? 1 : 0)
