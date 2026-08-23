/**
 * 页面层自动化测试（基于 mock 运行时，无需真实小程序或 @miniprogram/simulate）。
 * 通过 test/page-helper.js 加载页面、捕获 Page() 定义并执行 onLoad，断言渲染数据。
 * 运行：npm install && npm run test:simulate
 */
const { loadPage } = require('./page-helper')
const { getMetaList } = require('../utils/registry')

const IDS = getMetaList().map((m) => m.id)

describe('详情页 detail', () => {
  test('onLoad 加载 MBTI 产出完整 meta（含参考与计分）', () => {
    const ctx = loadPage('pages/detail/detail.js', { id: 'mbti' })
    expect(ctx.data.meta.name).toBeTruthy()
    expect(ctx.data.meta.reference).toBeTruthy()
    expect(ctx.data.meta.scoring).toBeTruthy()
    expect(ctx.data.meta.colorText).toMatch(/^#/)
  })

  test('非法 id 时标记 invalid', () => {
    const ctx = loadPage('pages/detail/detail.js', { id: 'nope' })
    expect(ctx.data.invalid).toBe(true)
  })
})

describe('结果页 result', () => {
  IDS.slice(0, 6).forEach((id) => {
    test(`${id} onLoad 产出主键与标准化视图`, () => {
      const ctx = loadPage('pages/result/result.js', { id })
      expect(ctx.data.primaryValue !== undefined).toBe(true)
      expect(Array.isArray(ctx.data.groups)).toBe(true)
      expect(Array.isArray(ctx.data.dims)).toBe(true)
      expect(Array.isArray(ctx.data.interpretations)).toBe(true)
      // retakeHint 一定是字符串（首次测评 / 距上次测评 N 天 / 空）
      expect(typeof ctx.data.retakeHint).toBe('string')
    })
  })

  test('retakeHint 逻辑：无历史时为「首次测评」', () => {
    const ctx = loadPage('pages/result/result.js', { id: 'sds' })
    expect(['首次测评', ''].includes(ctx.data.retakeHint)).toBe(true)
  })
})

describe('首页 index', () => {
  test('onLoad 列出全部量表且分类 chips 完整', () => {
    const ctx = loadPage('pages/index/index.js')
    expect(ctx.data.filteredList.length).toBe(IDS.length)
    expect(ctx.data.typeChips.length).toBeGreaterThanOrEqual(2)
    expect(ctx.data.typeChips[0].key).toBe('')
  })

  test('onSearch 按名称过滤', () => {
    const ctx = loadPage('pages/index/index.js')
    ctx.onSearch({ detail: { value: 'MBTI' } })
    expect(ctx.data.keyword).toBe('MBTI')
    expect(ctx.data.filteredList.every((m) => /mbti/i.test(m.name + m.shortName + m.desc))).toBe(true)
    expect(ctx.data.filteredList.length).toBeGreaterThanOrEqual(1)
  })

  test('onSelectType 按分类过滤', () => {
    const ctx = loadPage('pages/index/index.js')
    const personality = ctx.data.typeChips.find((c) => c.label === '人格') || ctx.data.typeChips[1]
    ctx.onSelectType({ currentTarget: { dataset: { key: personality.key } } })
    expect(ctx.data.filteredList.every((m) => m.type === personality.key)).toBe(true)
  })

  test('clearSearch 清空过滤', () => {
    const ctx = loadPage('pages/index/index.js')
    ctx.onSearch({ detail: { value: 'xzqv' } })
    expect(ctx.data.filteredList.length).toBe(0)
    ctx.clearSearch()
    expect(ctx.data.filteredList.length).toBe(IDS.length)
  })
})

describe('答题页 test', () => {
  test('onLoad 加载 SPM 并渲染首题不报错', () => {
    const ctx = loadPage('pages/test/test.js', { id: 'spm' })
    expect(ctx.data.q).toBeTruthy()
    expect(ctx.data.total).toBeGreaterThan(0)
    expect(ctx.data.current).toBe(0)
  })
})
