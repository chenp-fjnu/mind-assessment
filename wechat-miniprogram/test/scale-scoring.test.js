/**
 * 通用量表评分工具单元测试（utils/scale-scoring.js）
 * 运行：npm install && npm run test:simulate
 */
const { computeScaleScores, formatLevel } = require('../utils/scale-scoring')

const DIMS = {
  a: { name: '维度A', en: 'Alpha', high: '偏高', low: '偏低' },
  b: { name: '维度B' },
}

function qs(list) {
  return list.map(([dimension, reverse]) => ({ dimension, reverse: !!reverse }))
}

describe('scale-scoring.computeScaleScores', () => {
  test('0-based 索引转分值、求和与百分比', () => {
    const r = computeScaleScores([0, 4], qs([['a'], ['a']]), DIMS)
    expect(r.a.sum).toBe(6)
    expect(r.a.avg).toBe(3)
    expect(r.a.percent).toBe(50)
    expect(r.a.level).toBe('mid')
    expect(r.a.text).toBe('处于中等水平。')
    expect(r.a.en).toBe('Alpha')
  })

  test('min=0 量表（DASS 类）按 0-based 直出', () => {
    const r = computeScaleScores([0, 3], qs([['a'], ['a']]), DIMS, { min: 0, max: 3 })
    expect(r.a.sum).toBe(3)
    expect(r.a.percent).toBe(50)
  })

  test('反向计分用 max+min-actual', () => {
    const r = computeScaleScores([4], qs([['a', true]]), DIMS)
    expect(r.a.sum).toBe(1)
    expect(r.a.percent).toBe(0)
    expect(r.a.level).toBe('low')
    expect(r.a.text).toBe('偏低')
  })

  test('未作答用 defaultVal 计入', () => {
    const r = computeScaleScores([null, undefined], qs([['a'], ['a']]), DIMS, { defaultVal: 2 })
    expect(r.a.sum).toBe(4)
    expect(r.a.avg).toBe(2)
  })

  test('异常分值百分比钳制在 0-100', () => {
    const hi = computeScaleScores([99], qs([['a']]), DIMS)
    expect(hi.a.percent).toBe(100)
    const lo = computeScaleScores([99], qs([['a', true]]), DIMS)
    expect(lo.a.sum).toBeLessThan(0)
    expect(lo.a.percent).toBe(0)
  })

  test('维度高阈值文案、缺省 en 与 desc', () => {
    const r = computeScaleScores([4, 4], qs([['b'], ['b']]), DIMS)
    expect(r.b.percent).toBe(100)
    expect(r.b.level).toBe('high')
    expect(r.b.text).toBeUndefined()
    expect(r.b.en).toBe('')
    expect(r.b.desc).toBe('')
    const a = computeScaleScores([4], qs([['a']]), DIMS)
    expect(a.a.text).toBe('偏高')
  })

  test('维度无题时 avg 回落 defaultVal', () => {
    const r = computeScaleScores([], [], DIMS, { defaultVal: 3 })
    expect(r.a.sum).toBe(0)
    expect(r.a.avg).toBe(3)
    expect(r.a.percent).toBe(50)
  })
})

describe('scale-scoring.formatLevel', () => {
  test('默认阈值三分支', () => {
    expect(formatLevel(70)).toEqual({ level: 'high', label: '偏高' })
    expect(formatLevel(30)).toEqual({ level: 'low', label: '偏低' })
    expect(formatLevel(50)).toEqual({ level: 'mid', label: '中等' })
  })

  test('自定义阈值与标签', () => {
    const t = { high: 80, low: 20, highLabel: 'H', midLabel: 'M', lowLabel: 'L' }
    expect(formatLevel(85, t)).toEqual({ level: 'high', label: 'H' })
    expect(formatLevel(15, t)).toEqual({ level: 'low', label: 'L' })
    expect(formatLevel(50, t)).toEqual({ level: 'mid', label: 'M' })
  })
})
