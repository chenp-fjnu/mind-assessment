/**
 * 元信息一致性校验：确保 modules-meta.js 与 registry/getModule 实际模块实现一致。
 *   - 每个模块都必须实现 getResultView（统一视图契约）
 *   - modules-meta 的 id 都能取到对应模块
 *   - meta.questionCount 与实际 getQuestions().length 一致
 * 运行：node scripts/check-meta.js（已被 npm run test:all 在测试前执行，作为 CI 闸门）
 */
const { getModule } = require('../utils/registry')
const metaList = require('../utils/modules-meta')

let errors = 0

metaList.forEach((m) => {
  const mod = getModule(m.id)
  if (!mod) {
    console.error('✗ 模块缺失：', m.id)
    errors++
    return
  }
  if (typeof mod.getResultView !== 'function') {
    console.error('✗ getResultView 缺失：', m.id)
    errors++
  }
  if (typeof mod.getQuestions === 'function') {
    const qn = mod.getQuestions().length
    if (m.questionCount && qn && m.questionCount !== qn) {
      console.error(`✗ 题目数不一致 ${m.id}：meta=${m.questionCount} 实际=${qn}`)
      errors++
    }
  }
})

if (errors) {
  console.error(`\n校验失败：${errors} 处不一致`)
  process.exit(1)
}
console.log(`✓ meta 校验通过：${metaList.length} 个模块，getResultView / 题目数均一致`)
