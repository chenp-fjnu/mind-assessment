/**
 * question-item mapping tool
 * 映射所有测评问题到其关联的评估项
 * 输出结构便于结果内容富化和项分析
 *
 * 运行：node tools/map-questions.js
 */

const { getMetaList, getModule } = require('../utils/registry')
const { getResultView } = require('../utils/result-view')

function pickAnswer(q) {
  if (q.answer != null) return q.answer
  const n = (q.options || []).length
  if (n) return Math.floor(n / 2)
  if (q.scale && q.scale.labels) return Math.floor(q.scale.labels.length / 2)
  return 0
}

function getGroupInfo(q) {
  // 从问题中提取组别信息（用于SPM）
  if (q.set) return { set: q.set }
  return {}
}

function getRuleInfo(q) {
  // 从问题中提取规则信息（用于SPM矩阵题）
  if (q.rule) return { rule: q.rule }
  return {}
}

function analyzeModule(meta) {
  const mod = getModule(meta.id)
  if (!mod) return null

  const questions = mod.getQuestions()
  const answers = questions.map(pickAnswer)
  const r = mod.computeResult(answers, questions)
  const layout = mod.resultLayout || {}
  const view = getResultView(mod, r, layout)

  const analysis = {
    moduleId: meta.id,
    moduleName: meta.name,
    type: meta.type,
    questionCount: questions.length,

    // 问题属性分布
    itemAssociations: {
      // SPM: set 分布
      sets: {},
      // 韦氏: subtest/domain 分布
      subtests: {},
      domains: {},
      // MBTI/大五: dimension/pole 分布
      dimensions: {},
      // 其他: 通用属性
      rules: {},
      promptsWithText: 0,
    },

    // 结果视图项目
    resultView: {
      groups: view.groups ? view.groups.length : 0,
      dims: view.dims ? view.dims.length : 0,
      subtests: view.subtests ? view.subtests.length : 0,
      interpretations: view.interpretations ? view.interpretations.length : 0,
      showBipolar: view.showBipolar || false,
    },

    // 原始结果键
    resultKeys: Object.keys(r).filter(
      k => ['iq', 'score', 'index', 'trait', 'type', 'level', 'percent', 'summary'].includes(k)
    ),
  }

  // 分析问题属性分布
  questions.forEach((q, i) => {
    // SPM set 分布
    const setInfo = getGroupInfo(q)
    if (setInfo.set) {
      analysis.itemAssociations.sets[setInfo.set] = (analysis.itemAssociations.sets[setInfo.set] || 0) + 1
    }

    // 韦氏 subtest 分布
    if (q.subtest) {
      analysis.itemAssociations.subtests[q.subtest] = (analysis.itemAssociations.subtests[q.subtest] || 0) + 1
    }
    if (q.domain) {
      analysis.itemAssociations.domains[q.domain] = (analysis.itemAssociations.domains[q.domain] || 0) + 1
    }

    // MBTI/大五 dimension 分布
    if (q.dimension) {
      analysis.itemAssociations.dimensions[q.dimension] = (analysis.itemAssociations.dimensions[q.dimension] || 0) + 1
    }

    // 规则信息
    const ruleInfo = getRuleInfo(q)
    if (ruleInfo.rule) {
      analysis.itemAssociations.rules[ruleInfo.rule] = (analysis.itemAssociations.rules[ruleInfo.rule] || 0) + 1
    }

    // 有题干的问题计数
    const p = q.prompt || q.text || q.prompt
    if (p) analysis.itemAssociations.promptsWithText++
  })

  // 排序分布
  analysis.itemAssociations.sets = Object.entries(analysis.itemAssociations.sets).sort((a, b) => b[1] - a[1])
  analysis.itemAssociations.subtests = Object.entries(analysis.itemAssociations.subtests).sort((a, b) => b[1] - a[1])
  analysis.itemAssociations.domains = Object.entries(analysis.itemAssociations.domains).sort((a, b) => b[1] - a[1])
  analysis.itemAssociations.dimensions = Object.entries(analysis.itemAssociations.dimensions).sort((a, b) => b[1] - a[1])
  analysis.itemAssociations.rules = Object.entries(analysis.itemAssociations.rules).sort((a, b) => b[1] - a[1])

  return analysis
}

function run() {
  const metaList = getMetaList()
  console.log(`=== 问题-评估项映射分析 (共 ${metaList.length} 个模块) ===\n`)

  const results = []
  let totalQuestions = 0

  metaList.forEach((meta) => {
    const analysis = analyzeModule(meta)
    if (analysis) {
      results.push(analysis)
      totalQuestions += analysis.questionCount
    }
  })

  // 输出汇总
  console.log(`总问题数: ${totalQuestions}`)
  console.log(`模块数: ${results.length}`)
  console.log('')

  // 按类型分组统计
  const byType = {}
  results.forEach(r => {
    if (!byType[r.type]) byType[r.type] = { count: 0, questions: 0, modules: [] }
    byType[r.type].count++
    byType[r.type].questions += r.questionCount
    byType[r.type].modules.push(r.moduleName)
  })

  console.log('按类型统计:')
  Object.entries(byType).forEach(([type, data]) => {
    console.log(`  ${type}: ${data.modules.length}个模块, ${data.questionCount}题`)
  })
  console.log('')

  // 输出每个模块的详细映射
  console.log('=== 模块详细映射 ===')
  results.forEach((r, idx) => {
    console.log(`\n${idx + 1}. ${r.moduleName} (${r.moduleId})`)
    console.log(`   类型: ${r.type} | 问题: ${r.questionCount}题`)
    console.log(`   结果视图: groups=${r.resultView.groups} dims=${r.resultView.dims} subtests=${r.resultView.subtests} interpretations=${r.resultView.interpretations} bipolar=${r.resultView.showBipolar}`)
    console.log(`   结果键: ${r.resultKeys.join(', ')}`)

    if (r.itemAssociations.sets.length > 0) {
      console.log(`   Set分布: ${r.itemAssociations.sets.map(([k, v]) => `${k}:${v}题`).join(', ')}`)
    }
    if (r.itemAssociations.subtests.length > 0) {
      console.log(`   Subtest分布: ${r.itemAssociations.subtests.map(([k, v]) => `${k}:${v}题`).join(', ')}`)
    }
    if (r.itemAssociations.domains.length > 0) {
      console.log(`   Domain分布: ${r.itemAssociations.domains.map(([k, v]) => `${k}:${v}题`).join(', ')}`)
    }
    if (r.itemAssociations.dimensions.length > 0) {
      console.log(`   Dimension分布: ${r.itemAssociations.dimensions.map(([k, v]) => `${k}:${v}题`).join(', ')}`)
    }
    if (r.itemAssociations.rules.length > 0) {
      console.log(`   Rule分布: ${r.itemAssociations.rules.map(([k, v]) => `${k}:${v}题`).join(', ')}`)
    }
    if (r.itemAssociations.promptsWithText > 0) {
      console.log(`   有题干问题: ${r.itemAssociations.promptsWithText}题`)
    }
  })

  console.log('\n=== 完成 ===')
}

run()