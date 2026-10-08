const { mapDimensions } = require('../../utils/result-view')
/**
 * 808 神经元测试（图形推理练习）
 *
 * 题型源自北京八中「八少八素」甄别机测（神经元系统测试 808）公开描述的三类题：
 *   1. 找相同   —— 目标图案 + 一行候选，选出所有与目标完全相同的图形
 *   2. 图形类比 —— 第一个图形经某种变化成为第二个，第三个图形经同样变化选结果
 *   3. 找不同   —— 一排图形中选出与其他不同的少数几个（多选）
 *
 * 808 的关键规则：**多选题错选、漏选都不得分**，因此计分严格——
 * 全对得 1 分，否则按 (命中 - 错选) / 正确项数 部分给分并向下取整到 0。
 *
 * 题面全部由固定种子的确定性构造器生成（先构造正确答案、再生成干扰项），
 * 保证 getQuestions() 多次调用（答题页/结果页各算一次）返回完全一致的题目与答案。
 *
 * 重要提示：本模块为原创图形练习，非 808 官方真题，无标准化常模，
 * 结果仅用于自我探索与训练参考。
 */

// ---------- 确定性随机（mulberry32，固定种子保证题面稳定） ----------
function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ---------- 图形基元（utils/figure.js 的 cell 格式） ----------
const COLORS = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed']
const SHAPES = ['circle', 'square', 'triangle', 'diamond', 'hexagon', 'star', 'plus']

function ri(rng, n) {
  return Math.floor(rng() * n)
}
function pick(rng, arr) {
  return arr[ri(rng, arr.length)]
}
function otherPick(rng, arr, cur) {
  const others = arr.filter((x) => x !== cur)
  return others.length ? pick(rng, others) : cur
}
function clone(o) {
  return JSON.parse(JSON.stringify(o))
}

function randomCell(rng) {
  const type = pick(rng, SHAPES)
  const color = pick(rng, COLORS)
  const shape = {
    type,
    size: 56 + ri(rng, 3) * 8,
    color,
    rotation: type === 'circle' ? 0 : ri(rng, 4) * 45,
  }
  if (rng() < 0.4) shape.count = 2 + ri(rng, 2) // 数量也是可见差异（网格排列渲染）
  return { bg: '#ffffff', shapes: [shape] }
}

// 单点扰动：必定产生肉眼可见差异（换形/换色/非圆加转 45°/数量 ±1/缩放）
function mutate(c, rng) {
  const out = clone(c)
  const s = out.shapes[0]
  const kinds = ['type', 'color', 'size', 'count']
  if (s.type !== 'circle') kinds.push('rotation')
  const kind = pick(rng, kinds)
  if (kind === 'type') s.type = otherPick(rng, SHAPES, s.type)
  else if (kind === 'color') s.color = otherPick(rng, COLORS, s.color)
  else if (kind === 'rotation') s.rotation = ((s.rotation || 0) + 45) % 360
  else if (kind === 'count') s.count = (s.count || 1) + 1
  else s.size = Math.max(30, Math.min(90, (s.size || 60) + (s.size >= 60 ? -16 : 16)))
  return out
}

function sameCell(a, b) {
  return JSON.stringify(a) === JSON.stringify(b)
}

// 生成 count 个与 base 不同、且彼此互不相同的扰动结果（候选项公平性：
// 同题内不出现两个完全相同的干扰项，否则多选语义会对用户不公）
function distinctMutations(base, count, rng) {
  const out = []
  let guard = 0
  while (out.length < count && guard++ < 200) {
    const d = mutate(base, rng)
    if (sameCell(d, base)) continue
    if (out.some((x) => sameCell(x, d))) continue
    out.push(d)
  }
  while (out.length < count) out.push(mutate(base, rng)) // 兜底（理论不会走到）
  return out
}

// ---------- 类比规则（b = rule(a)，候选答案 = rule(c)） ----------
const RULES = [
  // 旋转 45°（仅用于非圆形）
  (c) => {
    const o = clone(c)
    o.shapes[0].rotation = ((o.shapes[0].rotation || 0) + 45) % 360
    return o
  },
  // 换色（取调色板下一种，必不相同）
  (c) => {
    const o = clone(c)
    const i = COLORS.indexOf(o.shapes[0].color)
    o.shapes[0].color = COLORS[(i + 1) % COLORS.length]
    return o
  },
  // 换形状（保持颜色/大小，取形状表下一种，必不相同）
  (c) => {
    const o = clone(c)
    const i = SHAPES.indexOf(o.shapes[0].type)
    o.shapes[0].type = SHAPES[(i + 1) % SHAPES.length]
    return o
  },
  // 数量 +1
  (c) => {
    const o = clone(c)
    o.shapes[0].count = (o.shapes[0].count || 1) + 1
    return o
  },
]

function forceNonCircle(c) {
  if (c.shapes[0].type !== 'circle') return c
  const o = clone(c)
  o.shapes[0].type = 'square'
  return o
}

// ---------- 三类题目构造 ----------
function makeSame(rng) {
  const target = randomCell(rng)
  const n = 12
  const k = 3
  const idxs = []
  while (idxs.length < k) {
    const x = ri(rng, n)
    if (idxs.indexOf(x) < 0) idxs.push(x)
  }
  const distractors = distinctMutations(target, n - k, rng)
  const candidates = []
  let di = 0
  for (let i = 0; i < n; i++) {
    if (idxs.indexOf(i) >= 0) candidates.push(clone(target))
    else candidates.push(distractors[di++])
  }
  return {
    type: 'multi',
    kind: 'same',
    dimension: 'observation',
    prompt: '目标图案已给出，从下方选项中选出与它完全相同的图形（可多选）',
    matrix: [[target]],
    candidates,
    answer: idxs.sort((a, b) => a - b),
    timeLimit: 25,
  }
}

function makeOdd(rng) {
  const base = randomCell(rng)
  const n = 10
  const oddCount = 1 + ri(rng, 2) // 1~2 个异类
  const idxs = []
  while (idxs.length < oddCount) {
    const x = ri(rng, n)
    if (idxs.indexOf(x) < 0) idxs.push(x)
  }
  const odds = distinctMutations(base, oddCount, rng)
  const candidates = []
  let oi = 0
  for (let i = 0; i < n; i++) {
    if (idxs.indexOf(i) >= 0) candidates.push(odds[oi++])
    else candidates.push(clone(base))
  }
  return {
    type: 'multi',
    kind: 'odd',
    dimension: 'observation',
    prompt: '下面一排图形中有少数几个与其他不同，请把它们全部选出来（可多选）',
    candidates,
    answer: idxs.sort((a, b) => a - b),
    timeLimit: 30,
  }
}

function makeAnalogy(rng) {
  const ruleIdx = ri(rng, RULES.length)
  const rule = RULES[ruleIdx]
  let a = randomCell(rng)
  if (ruleIdx === 0) a = forceNonCircle(a) // 旋转规则需要可见旋转
  const b = rule(a)
  let c = randomCell(rng)
  if (ruleIdx === 0) c = forceNonCircle(c)
  let guard = 0
  while ((sameCell(c, a) || sameCell(c, b)) && guard++ < 5) {
    c = randomCell(rng)
    if (ruleIdx === 0) c = forceNonCircle(c)
  }
  const answerCell = rule(c)
  const n = 8
  const ansIdx = ri(rng, n)
  const distractors = distinctMutations(answerCell, n - 1, rng)
  const candidates = []
  let di = 0
  for (let i = 0; i < n; i++) {
    if (i === ansIdx) candidates.push(clone(answerCell))
    else candidates.push(distractors[di++])
  }
  return {
    type: 'multi',
    kind: 'analogy',
    dimension: 'reasoning',
    prompt: '上行第一个图形经某种变化成为第二个；下行第三个图形经同样变化，应得到哪个图形？',
    analogy: { a, b, c },
    candidates,
    answer: [ansIdx],
    timeLimit: 35,
  }
}

function buildQuestions() {
  const rng = mulberry32(808)
  const sameList = []
  const oddList = []
  const anaList = []
  for (let i = 0; i < 8; i++) {
    sameList.push(makeSame(rng))
    oddList.push(makeOdd(rng))
    anaList.push(makeAnalogy(rng))
  }
  // 三类穿插出现，避免按题型分块带来的节奏单一
  const list = []
  for (let i = 0; i < 8; i++) list.push(sameList[i], oddList[i], anaList[i])
  return list.map((q, i) => Object.assign({ id: 'N808-' + String(i + 1).padStart(2, '0') }, q))
}

// ---------- 计分 ----------
const KIND_LABELS = { same: '找相同', analogy: '图形类比', odd: '找不同' }

function describeLevel(percent) {
  if (percent >= 85) return { level: '优秀', color: '#16a34a', desc: '图形辨识与规律迁移表现出色，限时压力下仍能保持准确。' }
  if (percent >= 70) return { level: '良好', color: '#2563eb', desc: '观察与推理能力不错，少数漏选/错选可通过熟练度提升弥补。' }
  if (percent >= 55) return { level: '中等', color: '#d97706', desc: '基本能力达标，建议加强图形细节比对与规则迁移的练习。' }
  return { level: '待提升', color: '#ea580c', desc: '对这类限时多选题较陌生，建议先求准确、再逐步提速。' }
}

function computeResult(answers, qs) {
  const n = qs.length
  const kindAgg = {
    same: { hit: 0, n: 0 },
    analogy: { hit: 0, n: 0 },
    odd: { hit: 0, n: 0 },
  }
  let exact = 0
  let sum = 0
  let wrong = 0
  let answered = 0
  const items = []

  qs.forEach((q, i) => {
    const raw = answers[i]
    const sel = Array.isArray(raw) ? raw : raw == null ? [] : [raw]
    const ans = Array.isArray(q.answer) ? q.answer : q.answer == null ? [] : [q.answer]
    if (sel.length) answered++
    const hit = sel.filter((x) => ans.indexOf(x) >= 0).length
    const fp = sel.filter((x) => ans.indexOf(x) < 0).length
    const miss = ans.length - hit
    const ok = ans.length > 0 && fp === 0 && miss === 0
    const s = ans.length === 0 ? 0 : ok ? 1 : Math.max(0, (hit - fp) / ans.length)
    if (ok) exact++
    sum += s
    wrong += fp
    const agg = kindAgg[q.kind] || kindAgg.same
    agg.hit += s
    agg.n++
    items.push({ id: q.id, kind: q.kind, answered: sel.length > 0, hit, fp, miss, score: Math.round(s * 100) / 100 })
  })

  const percent = n ? Math.round((sum / n) * 100) : 0
  const severity = describeLevel(percent)
  const rigor = Math.max(0, Math.min(100, Math.round(100 * (1 - wrong / Math.max(1, n)))))

  const groupStats = {}
  Object.keys(KIND_LABELS).forEach((k) => {
    const agg = kindAgg[k]
    groupStats[k] = {
      hit: agg.hit,
      n: agg.n,
      percent: agg.n ? Math.round((agg.hit / agg.n) * 100) : 0,
      display: (Math.round(agg.hit * 10) / 10) + '/' + agg.n,
    }
  })

  return {
    raw: percent,
    total: n,
    totalStat: { correct: exact, wrong, skipped: n - answered },
    // 核心输出
    score: exact,
    totalScore: percent,
    maxScore: n,
    percent,
    level: severity.level,
    levelColor: severity.color,
    type: String(percent),
    typeName: severity.level,
    trait: '正确率 ' + percent + '%',
    description: severity.desc,
    items,
    wrong,
    groupStats,
    dimensions: {
      observation: {
        name: '观察力',
        percent: groupStats.same.n || groupStats.odd.n
          ? Math.round(((groupStats.same.hit + groupStats.odd.hit) / Math.max(1, groupStats.same.n + groupStats.odd.n)) * 100)
          : 0,
        text: '找相同 / 找不同的细节辨识',
      },
      reasoning: {
        name: '推理力',
        percent: groupStats.analogy.percent,
        text: '图形类比的规律迁移',
      },
      rigor: {
        name: '严谨度',
        percent: rigor,
        text: wrong > 0 ? '存在 ' + wrong + ' 处错选' : '全程无错选',
      },
    },
  }
}

let _questions = null

module.exports = {
  id: 'n808',
  type: 'intelligence',
  name: '808神经元测试',
  shortName: '808神测',
  desc: '仿八中「八少八素」808 神测题型的限时图形练习：找相同、图形类比、找不同，多选错选漏选均失分。',
  reference: '题型参考北京八中「八少八素」甄别机测（神经元系统测试 808）公开描述；本题为原创图形练习，非官方真题，无标准化常模',
  scoring: '24 题多选严格计分：全对得 1 分，错选/漏选按比例扣分，正确率换算等级',
  icon: '🧠',
  color: '#0d9488',
  duration: 15,
  questionCount: 24,
  tag: ['智力', '图形', '观察力', '限时'],
  questionType: 'multi',
  hot: true,
  // 整卷倒计时（秒）：到点自动交卷，模拟 808 的限时压迫感
  totalTimeLimit: 900,

  getQuestions() {
    if (!_questions) _questions = buildQuestions()
    return _questions
  },

  computeResult,

  getResultView(r, layout) {
    const _mkGroup = function (r, layout) {
      return Object.keys(KIND_LABELS).map((k) => ({
        key: k,
        label: KIND_LABELS[k],
        percent: r.groupStats[k].percent,
        display: r.groupStats[k].display,
        isScale: false,
      }))
    }
    const _mkInterp = function (r, groupList, scaleDimensionList) {
      const sorted = groupList.slice().sort((a, b) => b.percent - a.percent)
      const best = sorted[0]
      const worst = sorted[sorted.length - 1]
      const out = [
        { title: '总体水平', text: '正确率 ' + r.percent + '%，' + r.level + '。' + r.description },
        { title: '优势题型', text: '「' + best.label + '」表现最佳（' + best.display + '），该类辨识/推理较稳。' },
        { title: '提升方向', text: '「' + worst.label + '」相对薄弱（' + worst.display + '），可针对性增加同类练习。' },
      ]
      out.push({
        title: '作答严谨度',
        text:
          r.wrong > 0
            ? '共错选 ' + r.wrong + ' 处。808 式多选错选会直接失分，建议逐项核对后再选。'
            : '全程无错选，作答严谨；在保持准确的前提下可继续提速。',
      })
      out.push({ title: '重要提示', text: '本测为原创图形练习，非 808 官方真题、无标准化常模，结果仅供自我探索与训练参考。' })
      return out
    }
    const groups = _mkGroup(r, layout)
    const dims = mapDimensions(r.dimensions)
    const subtests = []
    const interpretations = _mkInterp(r, groups, dims)
    const showBipolar = !!(dims[0] && dims[0].leftPercent !== undefined)
    return { groups, dims, subtests, interpretations, showBipolar }
  },

  resultLayout: {
    primaryField: 'percent',
    primaryLabel: '正确率',
    primarySuffix: '%',
    groupLabels: { same: '找相同', analogy: '图形类比', odd: '找不同' },
    detailType: 'grid',
    interpretation: true,
    renderMode: 'intelligence',
    showGroupLegend: true,
  },
}
