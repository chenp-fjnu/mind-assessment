/**
 * Jest 单元测试（无需小程序运行时，直接校验模块评分逻辑）。
 * 运行：npm install && npm run test:simulate
 */
const { getMetaList, getModule } = require('../utils/registry')

function pickAnswer(q) {
  if (q.answer != null) return q.answer
  const n = (q.options || []).length
  if (n) return Math.floor(n / 2)
  if (q.scale && q.scale.labels) return Math.floor(q.scale.labels.length / 2)
  return 0
}

describe('量表模块评分', () => {
  getMetaList().forEach((meta) => {
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

describe('808 神经元测试（n808）', () => {
  const mod = getModule('n808')

  test('24 题三类各 8，多选题型，题面模块级缓存确定性', () => {
    const qs = mod.getQuestions()
    expect(qs.length).toBe(24)
    const kinds = {}
    qs.forEach((q) => {
      expect(q.type).toBe('multi')
      expect(Array.isArray(q.answer)).toBe(true)
      expect(q.answer.length).toBeGreaterThan(0)
      expect(q.candidates.length).toBeGreaterThanOrEqual(q.answer.length)
      expect(q.candidates.length).toBeLessThanOrEqual(18)
      kinds[q.kind] = (kinds[q.kind] || 0) + 1
    })
    expect(kinds).toEqual({ same: 8, odd: 8, analogy: 8 })
    expect(mod.getQuestions()).toBe(qs)
  })

  test('整卷限时 15 分钟', () => {
    expect(mod.totalTimeLimit).toBe(900)
  })

  test('全对 100 分，错选漏选都会失分', () => {
    const qs = mod.getQuestions()
    const full = qs.map((q) => q.answer.slice())
    const r = mod.computeResult(full, qs)
    expect(r.percent).toBe(100)
    expect(r.wrong).toBe(0)
    expect(r.level).toBe('优秀')

    // 多选题只选一项 → 漏选失分；单选题不受影响
    const partial = qs.map((q) => [q.answer[0]])
    const r2 = mod.computeResult(partial, qs)
    expect(r2.percent).toBeLessThan(100)
    expect(r2.percent).toBeGreaterThanOrEqual(0)

    // 全部错选 → 严格扣到 0
    const wrong = qs.map((q) => {
      const bad = q.candidates.map((_, i) => i).filter((i) => q.answer.indexOf(i) < 0)
      return [bad[0]]
    })
    const r3 = mod.computeResult(wrong, qs)
    expect(r3.percent).toBe(0)
    expect(r3.percent).toBeLessThan(r2.percent)
  })

  test('结果视图含三题型分组与三维剖面', () => {
    const qs = mod.getQuestions()
    const r = mod.computeResult(qs.map((q) => q.answer.slice()), qs)
    const view = mod.getResultView(r, mod.resultLayout)
    expect(Array.isArray(view.groups)).toBe(true)
    expect(view.groups.length).toBe(3)
    expect(view.dims.length).toBe(3)
    expect(view.interpretations.length).toBeGreaterThan(0)
    view.dims.forEach((d) => {
      expect(d.name).toBeTruthy()
      expect(typeof d.percent).toBe('number')
    })
    expect(r.groupStats).toBeTruthy()
  })
})
