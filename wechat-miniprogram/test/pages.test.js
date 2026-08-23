/**
 * 其余页面层自动化测试（基于 mock 运行时，零依赖 @miniprogram/simulate）。
 * 覆盖 history / methods / mine / about / assess 以及 result 的趋势渲染分支。
 * 运行：npm run test:simulate
 */
const { loadPage } = require('./page-helper')
const { getMetaList } = require('../utils/registry')

describe('方法页 methods', () => {
  test('onLoad 列出全部方法并按分类分组', () => {
    const ctx = loadPage('pages/methods/methods.js')
    expect(ctx.data.allMethods.length).toBeGreaterThan(0)
    expect(ctx.data.groups.length).toBeGreaterThan(0)
    expect(ctx.data.count).toBe(ctx.data.allMethods.length)
    expect(ctx.data.interactiveCount).toBeGreaterThanOrEqual(0)
  })
  test('applyFilter 按关键词过滤', () => {
    const ctx = loadPage('pages/methods/methods.js')
    ctx.onSearch({ detail: { value: 'woop' } })
    const total = ctx.data.allMethods.length
    const filtered = ctx.data.groups.reduce((n, g) => n + g.list.length, 0)
    expect(filtered).toBeLessThanOrEqual(total)
    expect(filtered).toBeGreaterThanOrEqual(1)
  })
})

describe('我的页 mine', () => {
  test('onShow 统计记录数与方法数', () => {
    const ctx = loadPage('pages/mine/mine.js')
    expect(ctx.data.methodCount).toBeGreaterThan(0)
    expect(typeof ctx.data.recordCount).toBe('number')
  })
})

describe('关于页 about', () => {
  test('onLoad 统计模块/类型/方法数', () => {
    const ctx = loadPage('pages/about/about.js')
    expect(ctx.data.moduleCount).toBe(22)
    expect(ctx.data.typeCount).toBeGreaterThan(0)
    expect(ctx.data.methodCount).toBeGreaterThan(0)
    expect(Array.isArray(ctx.data.sources)).toBe(true)
  })
})

describe('测评 tab 页 assess', () => {
  test('onLoad 列出全部量表并分类', () => {
    const ctx = loadPage('pages/assess/assess.js')
    expect(ctx.data.moduleCount).toBe(22)
    expect(ctx.data.groups.length).toBeGreaterThan(0)
  })
  test('关键词查询参数过滤', () => {
    const ctx = loadPage('pages/assess/assess.js', { keyword: 'mbti' })
    const filtered = ctx.data.groups.reduce((n, g) => n + g.list.length, 0)
    expect(filtered).toBeGreaterThanOrEqual(1)
    expect(filtered).toBeLessThanOrEqual(22)
  })
})

describe('历史页 history', () => {
  const sample = [
    { id: 'sds', rid: 'r1', name: '抑郁自评', icon: '🌧', summary: '55', level: '轻度', time: 1000, answers: [0, 1] },
    { id: 'mbti', rid: 'r2', name: 'MBTI', icon: '🧭', summary: 'INTJ', level: '', time: 2000, answers: [1] },
  ]
  test('无历史时列表为空且 filters 含「全部」', () => {
    const ctx = loadPage('pages/history/history.js')
    expect(Array.isArray(ctx.data.list)).toBe(true)
    expect(ctx.data.list.length).toBe(0)
    expect(ctx.data.filters[0].id).toBe('')
  })
  test('有历史时按 id 过滤', () => {
    global.wx.getStorageSync = (k) => (k === 'ma_history' ? sample : undefined)
    const ctx = loadPage('pages/history/history.js')
    expect(ctx.data.list.length).toBe(2)
    expect(ctx.data.filters.some((f) => f.id === 'sds')).toBe(true)
    ctx.onFilter({ currentTarget: { dataset: { id: 'sds' } } })
    expect(ctx.data.list.every((h) => h.id === 'sds')).toBe(true)
  })
})

describe('结果页 result（趋势分支）', () => {
  const hist = (id, summaries, times) =>
    summaries.map((s, i) => ({ id, summary: String(s), time: times[i], answers: new Array(20).fill(0) }))
  test('同量表数值历史 => showTrend 与 trendValues', () => {
    global.wx.getStorageSync = (k) => (k === 'ma_history' ? hist('sds', ['50', '65'], [1000, 2000]) : undefined)
    const ctx = loadPage('pages/result/result.js', { id: 'sds' })
    expect(ctx.data.showTrend).toBe(true)
    expect(ctx.data.trendValues).toEqual([50, 65])
    expect(ctx.data.retakeHint).toMatch(/距上次测评/)
  })
  test('无同量表历史且无可恢复答案 => 标记 invalid', () => {
    global.wx.getStorageSync = () => []
    const ctx = loadPage('pages/result/result.js', { id: 'sds' })
    expect(ctx.data.invalid).toBe(true)
  })
  afterEach(() => {
    // 还原 storage mock，避免影响其它测试
    global.wx.getStorageSync = () => []
  })
})

describe('测评页 test（canvas memo 防重复重绘）', () => {
  let execCount
  beforeEach(() => {
    execCount = 0
    const q = {
      select: () => q,
      fields: () => q,
      exec: (cb) => {
        execCount++
        cb([{ node: { getContext: () => global.__mockCtx, width: 200, height: 200 }, width: 200, height: 200 }])
      },
    }
    global.wx.createSelectorQuery = () => q
  })
  afterEach(() => {
    global.wx.createSelectorQuery = undefined
  })
  test('同题未改选中时 drawFigures 命中 memo，不再重画画布', () => {
    const ctx = loadPage('pages/test/test.js', { id: 'spm' })
    const first = execCount
    expect(first).toBeGreaterThan(0) // 矩阵题已执行过 ensureCanvas 绘制
    ctx.drawFigures() // 题号/选中均未变化
    expect(execCount).toBe(first)
  })
  test('选中项变化时仅变化项重绘（矩阵整图不重画）', () => {
    const ctx = loadPage('pages/test/test.js', { id: 'spm' })
    const before = execCount
    // 模拟选中第一个选项：改变 answers[current] 后再次绘制
    const cur = ctx.data.current
    ctx.data.answers[cur] = 0
    ctx.drawFigures()
    // 矩阵画布签名未变 => 不会再次 ensureCanvas；仅 opt/figopt 选中态相关画布重绘
    // 至少保证整体调用数不随“整张矩阵每选一次都重画”那样线性增长
    expect(execCount).toBeLessThanOrEqual(before + ctx.data.q.options.length)
  })
})

