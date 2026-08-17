/**
 * Jest 单元测试（无需小程序运行时，直接校验模块评分逻辑）。
 * 运行：npm install && npm run test:simulate
 */
const { MODULES, getModule } = require('../utils/registry')

function pickAnswer(q) {
  if (q.answer != null) return q.answer
  const n = (q.options || []).length
  if (n) return Math.floor(n / 2)
  if (q.scale && q.scale.labels) return Math.floor(q.scale.labels.length / 2)
  return 0
}

describe('量表模块评分', () => {
  MODULES.forEach((meta) => {
    test(`${meta.id} 评分链路不报错且返回结果字段`, () => {
      const mod = getModule(meta.id)
      const questions = mod.getQuestions()
      expect(questions.length).toBeGreaterThan(0)
      const r = mod.computeResult(
        questions.map(pickAnswer),
        questions
      )
      expect(r).toBeTruthy()
      const keys = ['iq', 'score', 'index', 'trait', 'type', 'level', 'percent', 'summary']
      expect(keys.some((k) => r[k] !== undefined)).toBe(true)
    })
  })

  test('韦氏积木题候选图形与目标一致', () => {
    const w = getModule('wechsler')
    const q = w.getQuestions()
    for (let i = 15; i < 20; i++) {
      const it = q[i]
      expect(it.candidates).toHaveLength(4)
      expect(JSON.stringify(it.candidates[it.answer])).toBe(
        JSON.stringify(it.matrix || it.candidates[it.answer])
      )
    }
  })

  test('SPM 每题 6 个选项', () => {
    const spm = getModule('spm')
    const q = spm.getQuestions()
    q.forEach((it) => expect((it.options || []).length).toBe(6))
  })
})
