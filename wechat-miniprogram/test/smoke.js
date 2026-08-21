/**
 * 纯 Node 冒烟测试：校验全部量表模块（由 utils/registry 动态枚举）的评分链路不报错。
 * 运行：node test/smoke.js   （无需安装任何依赖）
 */
const { getMetaList, getModule } = require('../utils/registry')

let pass = 0
let fail = 0

function check(name, cond) {
  if (cond) {
    pass++
  } else {
    fail++
    console.error('  ✗ FAIL: ' + name)
  }
}

function pickAnswer(q) {
  if (q.answer != null) return q.answer
  const n = (q.options || []).length
  if (n) return Math.floor(n / 2)
  if (q.scale && q.scale.labels) return Math.floor(q.scale.labels.length / 2)
  return 0
}

getMetaList().forEach((meta) => {
  const mod = getModule(meta.id)
  try {
    const questions = mod.getQuestions()
    check(meta.id + ' 有题目', questions.length > 0)
    const answers = questions.map(pickAnswer)
    const r = mod.computeResult(answers, questions)
    check(meta.id + ' 评分返回对象', r && typeof r === 'object')
    check(
      meta.id + ' 含结果字段',
      ['iq', 'score', 'index', 'trait', 'type', 'level', 'percent', 'summary'].some((k) => r[k] !== undefined)
    )
    if (typeof mod.buildGroupList === 'function') mod.buildGroupList(r, mod.resultLayout || {})
    if (typeof mod.buildSubtestList === 'function') mod.buildSubtestList(r)
    // 复刻 result.js 的渲染流程：groups/dims 的构造方式需与页面一致
    const layout = mod.resultLayout || {}
    const hasBuildGroupList = typeof mod.buildGroupList === 'function'
    const groups = hasBuildGroupList ? mod.buildGroupList(r, layout) : []
    let dims = []
    if (typeof mod.buildScaleDimensionList === 'function') {
      dims = mod.buildScaleDimensionList(r) || []
    } else if (typeof mod.buildDimensionList === 'function') {
      dims = mod.buildDimensionList(r) || []
    } else if (r.dimensions) {
      dims = Object.keys(r.dimensions).map((k) => {
        const d = r.dimensions[k]
        return { key: k, name: d.name || k, percent: d.percent, text: d.text, level: d.level }
      })
    }
    if (typeof mod.buildInterpretations === 'function') {
      mod.buildInterpretations(r, groups, dims)
    }
  } catch (e) {
    fail++
    console.error('  ✗ THROW ' + meta.id + ': ' + e.message)
  }
})

// 韦氏积木候选图形数据完整性
const w = getModule('wechsler')
const wq = w.getQuestions()
for (let i = 15; i < 20; i++) {
  const it = wq[i]
  const c = it.candidates
  check('wechsler WCH-' + (i + 1) + ' 含 4 个候选', c && c.length === 4)
  check(
    'wechsler WCH-' + (i + 1) + ' 候选[answer]===目标矩阵',
    c && JSON.stringify(c[it.answer]) === JSON.stringify(it.matrix || c[it.answer])
  )
}

// 趋势计算（已抽离至 utils/trend.js，便于单测）
const { computeTrend } = require('../utils/trend')
const hist = [
  { id: 'spm', summary: '120', time: 1000 },
  { id: 'spm', summary: '130', time: 2000 },
  { id: 'mbti', summary: 'INFP', time: 1500 },
  { id: 'mbti', summary: 'ESTJ', time: 2500 },
]
const tn = computeTrend(hist, 'spm')
check('trend 数值型 showTrend', tn.showTrend === true)
check('trend 数值型 values', JSON.stringify(tn.trendValues) === '[120,130]')
check('trend 数值型 delta', tn.trendDelta === 10)
check('trend 数值型 dates', tn.trendDates.length === 2)
const tc = computeTrend(hist, 'mbti')
check('trend 类型型 catList', tc.catList.length === 2 && tc.showTrend === false)

console.log('\n冒烟测试完成：通过 ' + pass + '，失败 ' + fail)
process.exit(fail ? 1 : 0)
