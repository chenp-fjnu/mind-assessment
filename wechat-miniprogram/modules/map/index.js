/**
 * MAP 职业性格测验（标准版 40 题 · 迫选二选一）
 *
 * 模型：本土化「思维倾向 M / 态度和动力 A / 人际特点 P」三大维度，
 *       下含 24 项特质（每维度 8 项）。
 *
 * 计分：迫选作答（每题二选一）。
 *   - 每特质：high 选项被选次数 hi，low 选项被选次数 lo，
 *     percent = hi / (hi + lo) * 100（无作答默认 50）。
 *     level = percent >= 70 ? 'high' : percent <= 30 ? 'low' : 'mid'。
 *   - 每维度：按该维度所有题聚合 hi/lo，得 percent。
 *   - 结果视图：3 维度 groups（M/A/P）+ interpretations（分维度解读）。
 */

const DIMS = [
  { key: 'M', name: '思维倾向', en: 'Mind' },
  { key: 'A', name: '态度和动力', en: 'Attitude' },
  { key: 'P', name: '人际特点', en: 'People' },
]

// 24 项特质（每维度 8 项）
const TRAITS = {
  M: ['创新性', '开放性', '理论思考', '质疑精神', '数据导向', '实践导向', '关注细节', '前瞻规划'],
  A: ['情绪稳定', '尽责性', '成就动机', '乐观性', '守规性', '好胜心', '坚韧性', '主动性'],
  P: ['社交自信', '乐群性', '人际敏锐', '助人倾向', '支配性', '说服力', '自主性', '人际影响'],
}

// 40 迫选题：{ id, dim, trait, prompt, a, b, high }
// a = 选项 0，b = 选项 1；high = 高极选项索引（0 或 1）
const QUESTIONS = [
  // —— M 思维倾向（13 题）——
  { id: 'MAP-01', dim: 'M', trait: '创新性', prompt: '面对新任务时，你更常：', a: '沿用成熟方案，稳妥推进', b: '尝试新方法，寻找更优路径', high: 1 },
  { id: 'MAP-02', dim: 'M', trait: '创新性', prompt: '你更看重：', a: '结果的确定性与可复制性', b: '过程的探索性与可能性', high: 1 },
  { id: 'MAP-03', dim: 'M', trait: '开放性', prompt: '面对陌生的领域或观点：', a: '偏好在熟悉范围内工作', b: '乐于接触新观念、新领域', high: 1 },
  { id: 'MAP-04', dim: 'M', trait: '理论思考', prompt: '遇到问题时你更倾向：', a: '先动手解决，边做边调整', b: '先弄清背后的原理再动手', high: 1 },
  { id: 'MAP-05', dim: 'M', trait: '理论思考', prompt: '你更关注：', a: '「怎么做」——具体操作步骤', b: '「为什么」——背后的逻辑', high: 1 },
  { id: 'MAP-06', dim: 'M', trait: '质疑精神', prompt: '面对既定说法或权威观点：', a: '通常先接受，再逐步验证', b: '习惯追问与独立检验', high: 1 },
  { id: 'MAP-07', dim: 'M', trait: '数据导向', prompt: '做判断时你更依赖：', a: '直觉与过往经验', b: '数据与可验证的事实', high: 1 },
  { id: 'MAP-08', dim: 'M', trait: '数据导向', prompt: '对「证据」的态度：', a: '感觉合理就够了', b: '必须有可查证的支持', high: 1 },
  { id: 'MAP-09', dim: 'M', trait: '实践导向', prompt: '对「理论」的看法：', a: '讲得再好不如亲自做一遍', b: '先把逻辑想透再动手更稳', high: 0 },
  { id: 'MAP-10', dim: 'M', trait: '实践导向', prompt: '你更喜欢：', a: '把想法落地成实物、成果', b: '停留在概念层面的推演', high: 0 },
  { id: 'MAP-11', dim: 'M', trait: '关注细节', prompt: '处理任务时：', a: '看大体方向即可，细节不重要', b: '连小细节也要弄清楚', high: 1 },
  { id: 'MAP-12', dim: 'M', trait: '前瞻规划', prompt: '对未来的规划：', a: '走一步看一步，随机应变', b: '提前布局多步、谋定后动', high: 1 },
  { id: 'MAP-13', dim: 'M', trait: '前瞻规划', prompt: '你更关注：', a: '眼前正在发生的事', b: '未来几年的走向与趋势', high: 1 },

  // —— A 态度和动力（14 题）——
  { id: 'MAP-14', dim: 'A', trait: '情绪稳定', prompt: '你的情绪状态：', a: '起伏较大，容易被外界带动', b: '平稳少波动，不易被带偏', high: 1 },
  { id: 'MAP-15', dim: 'A', trait: '情绪稳定', prompt: '面对压力：', a: '容易失控、想逃避', b: '仍能保持冷静、按步骤应对', high: 1 },
  { id: 'MAP-16', dim: 'A', trait: '尽责性', prompt: '对计划与执行：', a: '计划常被临时变化打乱', b: '做事有始有终、按计划推进', high: 1 },
  { id: 'MAP-17', dim: 'A', trait: '尽责性', prompt: '对工作质量：', a: '差不多就行，够用即可', b: '力求做到最好，不凑合', high: 1 },
  { id: 'MAP-18', dim: 'A', trait: '成就动机', prompt: '对目标：', a: '达到基本要求即可', b: '不断给自己设更高的目标', high: 1 },
  { id: 'MAP-19', dim: 'A', trait: '成就动机', prompt: '对成绩与排名：', a: '不太在意，尽力就好', b: '很在意表现与成就的反馈', high: 1 },
  { id: 'MAP-20', dim: 'A', trait: '乐观性', prompt: '遇到新挑战：', a: '先想到可能的困难与风险', b: '先看到机会与成长空间', high: 1 },
  { id: 'MAP-21', dim: 'A', trait: '乐观性', prompt: '对未来：', a: '偏谨慎，担心变差', b: '偏积极，相信会变好', high: 1 },
  { id: 'MAP-22', dim: 'A', trait: '守规性', prompt: '对规则与流程：', a: '灵活变通，规则可调整', b: '严格按制度和流程办事', high: 1 },
  { id: 'MAP-23', dim: 'A', trait: '好胜心', prompt: '面对竞争：', a: '被竞争激励、全力发挥', b: '有压力、想回避', high: 0 },
  { id: 'MAP-24', dim: 'A', trait: '坚韧性', prompt: '受挫之后：', a: '容易放弃、想换条路', b: '很快重新出发、不放弃', high: 1 },
  { id: 'MAP-25', dim: 'A', trait: '坚韧性', prompt: '做长期任务时：', a: '中途容易分心、想放弃', b: '能坚持到底、持续投入', high: 0 },
  { id: 'MAP-26', dim: 'A', trait: '主动性', prompt: '工作推进：', a: '等安排、等指令再动手', b: '主动发现问题和机会', high: 1 },
  { id: 'MAP-27', dim: 'A', trait: '主动性', prompt: '角色倾向：', a: '被动响应、配合执行', b: '主动发起、推动事情发生', high: 1 },

  // —— P 人际特点（13 题）——
  { id: 'MAP-28', dim: 'P', trait: '社交自信', prompt: '面对陌生人：', a: '有些拘谨、不敢开口', b: '能自在表达、自然搭话', high: 1 },
  { id: 'MAP-29', dim: 'P', trait: '社交自信', prompt: '主动发起对话：', a: '不太敢主动开口', b: '乐于主动搭话、破冰', high: 1 },
  { id: 'MAP-30', dim: 'P', trait: '乐群性', prompt: '对社交场合：', a: '独处更舒服、更专注', b: '人多更兴奋、更有活力', high: 1 },
  { id: 'MAP-31', dim: 'P', trait: '人际敏锐', prompt: '与人相处时你更关注：', a: '事情本身（任务、结果）', b: '人的情绪、态度与反应', high: 1 },
  { id: 'MAP-32', dim: 'P', trait: '人际敏锐', prompt: '察觉他人情绪变化：', a: '不太敏感，后知后觉', b: '能较快察觉并作出反应', high: 0 },
  { id: 'MAP-33', dim: 'P', trait: '助人倾向', prompt: '别人有困难：', a: '先衡量代价再决定帮不帮', b: '会主动伸手、愿意搭把手', high: 1 },
  { id: 'MAP-34', dim: 'P', trait: '助人倾向', prompt: '遇到问题：', a: '更倾向自己解决', b: '更倾向协作共担、寻求帮助', high: 1 },
  { id: 'MAP-35', dim: 'P', trait: '支配性', prompt: '在群体决策中：', a: '希望按自己的想法推进', b: '更习惯跟随他人安排', high: 0 },
  { id: 'MAP-36', dim: 'P', trait: '支配性', prompt: '在团队中你：', a: '自然成为主导、拿主意', b: '更习惯配合、支持角色', high: 0 },
  { id: 'MAP-37', dim: 'P', trait: '说服力', prompt: '表达想法：', a: '不太擅长说服他人', b: '能把想法讲清楚并带动他人', high: 1 },
  { id: 'MAP-38', dim: 'P', trait: '自主性', prompt: '工作节奏：', a: '更享受独立、自己定节奏', b: '更享受团队、跟随共同节拍', high: 0 },
  { id: 'MAP-39', dim: 'P', trait: '自主性', prompt: '对决策权：', a: '希望自己做主、自己拍板', b: '更依赖集体讨论再定', high: 0 },
  { id: 'MAP-40', dim: 'P', trait: '人际影响', prompt: '对周围人：', a: '较少影响他人看法', b: '能带动和感染身边的人', high: 1 },
]

// 每特质的 high / low 文案（用于解读）
const TRAIT_TEXT = {
  // M
  '创新性': { high: '倾向于探索新路径、突破既有方案', low: '偏好沿用成熟方案、稳健推进' },
  '开放性': { high: '乐于接触新观念、新领域', low: '偏好熟悉的环境与话题' },
  '理论思考': { high: '习惯先弄清原理再动手', low: '倾向直接动手、边做边调整' },
  '质疑精神': { high: '习惯追问与独立检验', low: '先接受既定说法、再逐步验证' },
  '数据导向': { high: '依赖数据与可验证事实', low: '依赖直觉与经验' },
  '实践导向': { high: '重实操、把想法落地', low: '重概念推演、先想后做' },
  '关注细节': { high: '连小细节也要弄清楚', low: '看大体方向即可' },
  '前瞻规划': { high: '提前布局多步、谋定后动', low: '走一步看一步、随机应变' },
  // A
  '情绪稳定': { high: '情绪平稳、压力下保持冷静', low: '情绪起伏较大、易被外界带动' },
  '尽责性': { high: '有始有终、力求做到最好', low: '计划易被打破、质量要求偏宽松' },
  '成就动机': { high: '不断设更高目标、在意成绩', low: '达到基本要求即可' },
  '乐观性': { high: '看到机会与成长、对未来积极', low: '先看到困难风险、对未来偏谨慎' },
  '守规性': { high: '严格按制度和流程办事', low: '灵活变通、规则可调整' },
  '好胜心': { high: '被竞争激励、全力发挥', low: '竞争带来压力、倾向回避' },
  '坚韧性': { high: '受挫后很快重新出发', low: '遇挫容易分心或放弃' },
  '主动性': { high: '主动发现问题与机会、推动事情', low: '等安排再动手、被动响应' },
  // P
  '社交自信': { high: '面对陌生人能自在表达', low: '面对陌生人有些拘谨' },
  '乐群性': { high: '人多更兴奋、活力高', low: '独处更舒服、更专注' },
  '人际敏锐': { high: '能较快察觉他人情绪与反应', low: '更关注事情本身、对情绪不敏感' },
  '助人倾向': { high: '愿意主动伸手、协作共担', low: '先衡量代价、更倾向自己解决' },
  '支配性': { high: '在群体中自然主导、拿主意', low: '更习惯配合、跟随他人安排' },
  '说服力': { high: '能把想法讲清楚并带动他人', low: '不太擅长说服他人' },
  '自主性': { high: '独立工作、自己定节奏和方向', low: '依赖团队节拍、集体讨论再定' },
  '人际影响': { high: '能带动和感染周围的人', low: '较少影响他人看法' },
}

function computeResult(answers, qs) {
  const traitHi = {}, traitLo = {}, dimHi = { M: 0, A: 0, P: 0 }, dimLo = { M: 0, A: 0, P: 0 }
  const dimTotal = { M: 0, A: 0, P: 0 }
  let answered = 0

  qs.forEach((q, i) => {
    dimTotal[q.dim]++
    const a = answers[i]
    if (a == null) return
    answered++
    if (a === q.high) {
      traitHi[q.trait] = (traitHi[q.trait] || 0) + 1
      dimHi[q.dim]++
    } else {
      traitLo[q.trait] = (traitLo[q.trait] || 0) + 1
      dimLo[q.dim]++
    }
  })

  // 24 特质维度
  const dimensions = {}
  let traitPercentSum = 0
  let traitPercentCount = 0
  Object.keys(TRAITS).forEach((d) => {
    TRAITS[d].forEach((t) => {
      const hi = traitHi[t] || 0
      const lo = traitLo[t] || 0
      const total = hi + lo
      const percent = total ? Math.round((hi / total) * 100) : 50
      const level = percent >= 70 ? 'high' : percent <= 30 ? 'low' : 'mid'
      dimensions[t] = { name: t, percent, level, text: level === 'high' ? TRAIT_TEXT[t].high : level === 'low' ? TRAIT_TEXT[t].low : TRAIT_TEXT[t].high }
      traitPercentSum += percent
      traitPercentCount++
    })
  })

  // 3 大维度
  const groups = {}
  DIMS.forEach((d) => {
    const hi = dimHi[d.key], lo = dimLo[d.key], total = hi + lo
    const percent = total ? Math.round((hi / total) * 100) : 50
    groups[d.key] = {
      key: d.key,
      label: d.name,
      percent,
      display: `${hi}/${dimTotal[d.key] || total}`,
      isScale: false,
    }
  })

  // 综合 percent
  const overallPercent = traitPercentCount ? Math.round(traitPercentSum / traitPercentCount) : 50
  const overallLevel = overallPercent >= 70 ? '高' : overallPercent <= 30 ? '低' : '中'

  // 类型标签：M/A/P 三维度百分位
  const type = 'M' + groups.M.percent + '·A' + groups.A.percent + '·P' + groups.P.percent
  const description = `思维倾向 ${groups.M.percent}%（${groups.M.label}）、态度和动力 ${groups.A.percent}%（${groups.A.label}）、人际特点 ${groups.P.percent}%（${groups.P.label}）。综合倾向：${overallLevel}（${overallPercent}%）。`

  return {
    type,
    typeName: 'MAP 职业性格',
    trait: type,
    description,
    percent: overallPercent,
    level: overallLevel,
    groups,
    dimensions,
    totalStat: { correct: 0, wrong: 0, skipped: qs.length - answered },
    total: qs.length,
    raw: answered,
  }
}

function getResultView(r, layout) {
  // 3 维度 groups
  const groups = DIMS.map((d) => ({
    key: d.key,
    label: (layout && layout.groupLabels && layout.groupLabels[d.key]) || d.name,
    percent: r.groups[d.key].percent,
    display: r.groups[d.key].display,
    isScale: false,
  }))

  // interpretations：分维度解读
  const interpretations = []
  DIMS.forEach((d) => {
    const p = r.groups[d.key].percent
    const traits = TRAITS[d.key]
    const highTraits = traits.filter((t) => r.dimensions[t] && r.dimensions[t].level === 'high')
    const lowTraits = traits.filter((t) => r.dimensions[t] && r.dimensions[t].level === 'low')
    let text = `${d.name}维度得分 ${p}%。`
    if (highTraits.length) text += ` 高倾向特质：${highTraits.join('、')}。`
    if (lowTraits.length) text += ` 低倾向特质：${lowTraits.join('、')}。`
    text += p >= 70 ? ' 整体偏积极，可在该方向持续发挥。' : p <= 30 ? ' 整体偏保守，建议有意识拓展。' : ' 整体均衡，可按需灵活调整。'
    interpretations.push({ title: d.name, text })
  })
  // 综合建议
  const top = DIMS.slice().sort((a, b) => r.groups[b.key].percent - r.groups[a.key].percent)[0]
  const bottom = DIMS.slice().sort((a, b) => r.groups[a.key].percent - r.groups[b.key].percent)[0]
  interpretations.push({
    title: '综合建议',
    text: `你的最强维度是「${top.name}」（${r.groups[top.key].percent}%），最弱维度是「${bottom.name}」（${r.groups[bottom.key].percent}%）。建议优先发挥强项，同时有意识补足弱项，形成更均衡的职业性格画像。`,
  })

  return { groups, dims: [], subtests: [], interpretations, showBipolar: false }
}

module.exports = {
  id: 'map',
  type: 'career',
  name: 'MAP 职业性格测验',
  shortName: 'MAP',
  desc: '本土化职业性格测验：思维倾向、态度和动力、人际特点三大维度，24 项特质迫选作答。',
  reference: 'MAP（Measuring Aptitude and Personality）本土化职业性格模型 · 标准版 40 题迫选',
  scoring: '迫选二选一计分：每特质 hi/(hi+lo) 百分位，每维度聚合，level 高/中/低',
  icon: '🧭',
  color: '#0ea5e9',
  duration: 15,
  questionCount: QUESTIONS.length,
  tag: ['职业', '性格', '胜任力', '迫选'],
  questionType: 'choice',
  hot: true,

  getQuestions() {
    return QUESTIONS.map((q) => ({
      id: q.id,
      type: 'choice',
      prompt: q.prompt,
      options: [q.a, q.b],
      answer: null,
      // 计分所需元数据（页面渲染仅用 prompt/options，多出的字段无副作用）
      dim: q.dim,
      trait: q.trait,
      high: q.high,
    }))
  },

  computeResult,
  getResultView,

  resultLayout: {
    primaryField: 'type',
    primaryLabel: '职业性格画像',
    primarySuffix: '',
    groupLabels: { M: '思维倾向', A: '态度和动力', P: '人际特点' },
    interpretation: true,
  },
}
