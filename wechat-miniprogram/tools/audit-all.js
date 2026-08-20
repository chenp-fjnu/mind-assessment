/**
 * 全量审计：对所有 14 个测评模块检查题目与答案的完整性/一致性。
 * 运行：node tools/audit-all.js
 */
const { getMetaList, getModule } = require('../utils/registry')

function run() {
  let fail = 0
  const report = []
  for (const meta of getMetaList()) {
    const m = getModule(meta.id)
    const issues = []
    let qs
    try {
      qs = m.getQuestions()
    } catch (e) {
      issues.push('getQuestions 抛错: ' + e.message)
      report.push({ id: m.id, n: 0, issues })
      fail++
      continue
    }
  const n = qs.length
  const ids = new Set()
  const prompts = new Set()
  const dimCount = {}
  let reverse = 0
  let minOpts = 99, maxOpts = 0

    qs.forEach((q, i) => {
      if (!q.id) issues.push(`#${i} 缺少 id`)
      else {
        if (ids.has(q.id)) issues.push('重复 id: ' + q.id)
        ids.add(q.id)
      }
      const p = q.prompt || q.text
      if (!p && q.type !== 'matrix') issues.push(`#${i} 缺少题干`)
      else if (p) {
        const sig = p + '|' + JSON.stringify(q.options || [])
        if (prompts.has(sig)) issues.push('完全重复题目: ' + p.slice(0, 12))
        prompts.add(sig)
      }
      const dim = q.dimension || q.dim || q.subtest || '-'
      dimCount[dim] = (dimCount[dim] || 0) + 1
      if (q.reverse) reverse++

      const opts = q.options || []
      if (opts.length) {
        minOpts = Math.min(minOpts, opts.length)
        maxOpts = Math.max(maxOpts, opts.length)
      }

      // 答案/选项校验
      if (q.type === 'matrix') {
        if (opts.length !== 6) issues.push(`${q.id} 矩阵选项数=${opts.length}(应为6)`)
        if (typeof q.answer !== 'number' || q.answer < 0 || q.answer > 5) issues.push(`${q.id} answer 越界: ${q.answer}`)
        // 空缺单元格
        const last = q.matrix[q.matrix.length - 1][q.matrix.length - 1]
        if (last && last.shapes && last.shapes.length) issues.push(`${q.id} 右下角应为空`)
      } else if (q.type === 'choice') {
        if (m.id === 'mbti') {
          if (opts.length !== 2) issues.push(`${q.id} MBTI 选项数=${opts.length}(应为2)`)
          if (!['E','I','S','N','T','F','J','P'].includes(q.pole)) issues.push(`${q.id} pole 非法: ${q.pole}`)
        } else if (m.id === 'wechsler') {
          if (opts.length !== 4) issues.push(`${q.id} 选项数=${opts.length}(应为4)`)
          if (typeof q.answer !== 'number' || q.answer < 0 || q.answer > 3) issues.push(`${q.id} answer 越界: ${q.answer}`)
          if (q.candidates && (!q.candidates[q.answer])) issues.push(`${q.id} candidates[answer] 缺失`)
        } else if (m.id === 'disc') {
          if (opts.length !== 4) issues.push(`${q.id} DISC 选项数=${opts.length}(应为4)`)
        }
      } else if (q.type === 'scale') {
        const sc = q.scale || {}
        if (sc.min == null || sc.max == null) issues.push(`${q.id} 缺少 scale.min/max`)
      }
    })

    // computeResult 冒烟：全部作答
    try {
      const answers = qs.map(() => 0)
      const r = m.computeResult(answers, qs)
      if (r == null) issues.push('computeResult 返回空')
    } catch (e) {
      issues.push('computeResult 抛错: ' + e.message)
    }

    if (issues.length) fail++
    report.push({
      id: m.id,
      name: m.name,
      n,
      dimensions: dimCount,
      reverse,
      optRange: minOpts + '-' + maxOpts,
      issues,
    })
  }

  console.log('==== 全量审计 ====')
  for (const r of report) {
    console.log(`\n[${r.id}] ${r.name}  题数=${r.n}  反向题=${r.reverse}  选项范围=${r.optRange}`)
    console.log('  维度分布:', JSON.stringify(r.dimensions))
    if (r.issues.length) {
      console.log('  ❌ 问题:')
      r.issues.forEach((x) => console.log('    - ' + x))
    } else {
      console.log('  ✅ 无结构性问题')
    }
  }
  console.log('\n==== 结论:', fail === 0 ? '全部通过 ✅' : `${fail} 个模块存在问题 ❌`, '====')
  process.exit(fail === 0 ? 0 : 1)
}

run()
