/**
 * 其余页面层自动化测试（基于 mock 运行时，零依赖 @miniprogram/simulate）。
 * 覆盖 history / methods / mine / about / assess 以及 result 的趋势渲染分支。
 * 运行：npm run test:simulate
 */
const { loadPage } = require('./page-helper')
const { getMetaList } = require('../utils/registry')
const { fmt } = require('../utils/format')

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
  test('goDetail 跳转方法详情', () => {
    let nav = null
    global.wx.navigateTo = (o) => {
      nav = o.url
    }
    const ctx = loadPage('pages/methods/methods.js')
    ctx.goDetail({ currentTarget: { dataset: { id: 'box' } } })
    expect(nav).toContain('/pages/methods/detail?id=box')
    global.wx.navigateTo = () => {}
  })
})

describe('我的页 mine', () => {
  test('onShow 统计测评/方法/训练记录数', () => {
    const ctx = loadPage('pages/mine/mine.js')
    expect(typeof ctx.data.assessCount).toBe('number')
    expect(typeof ctx.data.practiceCount).toBe('number')
    expect(typeof ctx.data.trainCount).toBe('number')
    expect(typeof ctx.data.recordSummary).toBe('string')
  })
  test('goHistory / goAbout 跳转', () => {
    let nav = null
    global.wx.navigateTo = (o) => {
      nav = o.url
    }
    const ctx = loadPage('pages/mine/mine.js')
    ctx.goHistory()
    expect(nav).toContain('/pages/history/history')
    ctx.goAbout()
    expect(nav).toContain('/pages/about/about')
    global.wx.navigateTo = () => {}
  })
})

describe('关于页 about', () => {
  test('onLoad 统计模块/类型/方法数', () => {
    const ctx = loadPage('pages/about/about.js')
    expect(ctx.data.moduleCount).toBe(getMetaList().length)
    expect(ctx.data.typeCount).toBeGreaterThan(0)
    expect(ctx.data.methodCount).toBeGreaterThan(0)
    expect(Array.isArray(ctx.data.sources)).toBe(true)
  })
})

describe('测评 tab 页 assess', () => {
  test('onLoad 列出全部量表并分类', () => {
    const ctx = loadPage('pages/assess/assess.js')
    expect(ctx.data.moduleCount).toBe(getMetaList().length)
    expect(ctx.data.groups.length).toBeGreaterThan(0)
  })
  test('关键词查询参数过滤', () => {
    const ctx = loadPage('pages/assess/assess.js', { keyword: 'mbti' })
    const filtered = ctx.data.groups.reduce((n, g) => n + g.list.length, 0)
    expect(filtered).toBeGreaterThanOrEqual(1)
    expect(filtered).toBeLessThanOrEqual(23)
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

describe('历史页 history（交互 handler）', () => {
  const sample = [{ id: 'sds', rid: 'r1', name: '抑郁自评', icon: '🌧', summary: '55', level: '轻度', time: 1000, answers: [] }]
  let store
  beforeEach(() => {
    store = { ma_history: sample.slice(), ma_practices: {} }
    global.wx.getStorageSync = (k) => (k in store ? store[k] : undefined)
    global.wx.setStorageSync = (k, v) => {
      store[k] = v
    }
    global.wx.removeStorageSync = (k) => {
      delete store[k]
    }
    global.wx.showModal = (o) => o && o.success && o.success({ confirm: true })
  })
  afterEach(() => {
    // 还原为与 setup.js 一致的默认实现，避免污染后续 describe
    global.wx.getStorageSync = () => []
    global.wx.showModal = () => {}
    global.wx.setStorageSync = () => {}
    global.wx.removeStorageSync = () => {}
  })

  test('deleteOne 确认 => 从 ma_history 移除该 rid', () => {
    const ctx = loadPage('pages/history/history.js')
    expect(ctx.data.list.length).toBe(1)
    ctx.deleteOne({ currentTarget: { dataset: { idx: 0 } } })
    expect(store.ma_history).toEqual([])
  })
  test('deleteOne 取消 => 不改动记录', () => {
    global.wx.showModal = (o) => o.success({ confirm: false })
    const ctx = loadPage('pages/history/history.js')
    ctx.deleteOne({ currentTarget: { dataset: { idx: 0 } } })
    expect(store.ma_history.length).toBe(1)
  })
  test('clearAll 确认 => 清空 ma_history', () => {
    let removed = null
    global.wx.removeStorageSync = (k) => {
      removed = k
    }
    const ctx = loadPage('pages/history/history.js')
    ctx.clearAll()
    expect(removed).toBe('ma_history')
  })
  test('exportAll 有记录 => 复制 JSON 到剪贴板', () => {
    let clip = null
    global.wx.setClipboardData = (o) => {
      clip = o.data
    }
    const ctx = loadPage('pages/history/history.js')
    ctx.exportAll()
    expect(typeof clip).toBe('string')
    expect(clip).toContain('sds')
  })
  test('exportAll 无记录 => 提示暂无', () => {
    global.wx.getStorageSync = () => []
    let toast = ''
    global.wx.showToast = (o) => {
      toast = o.title
    }
    const ctx = loadPage('pages/history/history.js')
    ctx.exportAll()
    expect(toast).toMatch(/暂无记录/)
  })
  test('onTab / onFilter / open 基本行为', () => {
    let nav = null
    global.wx.navigateTo = (o) => {
      nav = o.url
    }
    const ctx = loadPage('pages/history/history.js')
    ctx.onTab({ currentTarget: { dataset: { tab: 'method' } } })
    expect(ctx.data.tab).toBe('method')
    ctx.onFilter({ currentTarget: { dataset: { id: 'sds' } } })
    expect(ctx.data.active).toBe('sds')
    ctx.open({ currentTarget: { dataset: { idx: 0 } } })
    expect(nav).toContain('/pages/result/result?id=sds')
  })
  test('onSearch 按名称过滤，clearSearch 还原', () => {
    const ctx = loadPage('pages/history/history.js')
    ctx.onSearch({ detail: { value: '不存在的关键词' } })
    expect(ctx.data.list.length).toBe(0)
    ctx.clearSearch()
    expect(ctx.data.list.length).toBe(1)
  })
})

describe('测评页 test（提交分支 doSubmit）', () => {
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
    global.wx.getStorageSync = (k) => (k === 'ma_history' ? [] : undefined)
    global.wx.showModal = (o) => o && o.success && o.success({ confirm: true })
  })
  afterEach(() => {
    // 还原为与 setup.js 一致的默认实现，避免污染后续 describe
    global.wx.createSelectorQuery = undefined
    global.wx.getStorageSync = () => []
    global.wx.showModal = () => {}
    global.wx.setStorageSync = () => {}
    global.wx.removeStorageSync = () => {}
    global.wx.reLaunch = () => {}
  })

  function spy() {
    const relaunch = []
    const writes = []
    global.wx.reLaunch = (o) => relaunch.push(o)
    global.wx.setStorageSync = (k, v) => {
      if (k === 'ma_history') writes.push(v)
    }
    return { relaunch, writes }
  }

  test('全部已答 => submit 写入历史并 reLaunch', () => {
    const { relaunch, writes } = spy()
    const ctx = loadPage('pages/test/test.js', { id: 'spm' })
    ctx.data.answers = ctx.data.questions.map(() => 0)
    ctx.submit()
    expect(relaunch.length).toBe(1)
    expect(writes.length).toBe(1)
    expect(writes[0].length).toBe(1) // 新建 1 条记录
  })
  test('用户取消 => 不提交、不 reLaunch', () => {
    global.wx.showModal = (o) => o.success({ confirm: false })
    const { relaunch } = spy()
    const ctx = loadPage('pages/test/test.js', { id: 'spm' })
    ctx.data.answers = ctx.data.questions.map(() => 0)
    ctx.submit()
    expect(relaunch.length).toBe(0)
  })
  test('存在未答 => 走“未完成”弹窗后仍能提交', () => {
    const { relaunch } = spy()
    const ctx = loadPage('pages/test/test.js', { id: 'spm' })
    ctx.data.answers = ctx.data.questions.map(() => 0)
    ctx.data.answers[0] = null // 制造未答
    ctx.submit()
    expect(relaunch.length).toBe(1)
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

describe('结果页 result（交互分支 + 兜底可见）', () => {
  const hist = [{ id: 'sds', rid: 'r1', summary: '55', time: 1000, answers: new Array(20).fill(0) }]
  const q = {
    in: () => q,
    select: () => q,
    fields: () => q,
    exec: (cb) =>
      cb([{ node: { getContext: () => global.__mockCtx, width: 200, height: 200 }, width: 200, height: 200 }]),
  }
  beforeEach(() => {
    global.wx.createSelectorQuery = () => q
    global.wx.getStorageSync = (k) => (k === 'ma_history' ? hist : undefined)
    global.wx.showModal = (o) => o && o.success && o.success({ confirm: true })
    global.wx.saveImageToPhotosAlbum = (o) => o && o.success && o.success({})
  })
  afterEach(() => {
    global.wx.createSelectorQuery = undefined
    global.wx.getStorageSync = () => []
    global.wx.showModal = () => {}
    global.wx.saveImageToPhotosAlbum = () => {}
    global.wx.canvasToTempFilePath = (o) => o && o.success && o.success({ tempFilePath: 'x' })
    global.wx.navigateTo = () => {}
    global.wx.redirectTo = () => {}
    global.wx.reLaunch = () => {}
  })

  test('drawTrend 不抛错', () => {
    const ctx = loadPage('pages/result/result.js', { id: 'sds' })
    expect(() => ctx.drawTrend()).not.toThrow()
  })
  test('saveCard 成功后提示已保存', () => {
    let toast = ''
    global.wx.showToast = (o) => {
      toast = o.title
    }
    const ctx = loadPage('pages/result/result.js', { id: 'sds' })
    ctx.saveCard()
    expect(toast).toBe('已保存到相册')
  })
  test('goMethod 跳转方法详情', () => {
    let nav = null
    global.wx.navigateTo = (o) => {
      nav = o.url
    }
    const ctx = loadPage('pages/result/result.js', { id: 'sds' })
    ctx.goMethod({ currentTarget: { dataset: { id: 'box' } } })
    expect(nav).toContain('/pages/methods/detail?id=box')
  })
  test('retest 重定向到测评页', () => {
    let nav = null
    global.wx.redirectTo = (o) => {
      nav = o.url
    }
    const ctx = loadPage('pages/result/result.js', { id: 'sds' })
    ctx.retest()
    expect(nav).toContain('/pages/test/test?id=sds')
  })
  test('goHome reLaunch 首页', () => {
    let nav = null
    global.wx.reLaunch = (o) => {
      nav = o.url
    }
    const ctx = loadPage('pages/result/result.js', { id: 'sds' })
    ctx.goHome()
    expect(nav).toContain('/pages/index/index')
  })
  test('getResultView 抛错 => viewError 标记且不白屏', () => {
    const { getModule } = require('../utils/registry')
    const mod = getModule('sds')
    const orig = mod.getResultView
    mod.getResultView = () => {
      throw new Error('boom')
    }
    const ctx = loadPage('pages/result/result.js', { id: 'sds' })
    mod.getResultView = orig
    expect(ctx.data.viewError).toBe(true)
  })
})

describe('历史页 history（进行中测评时间回归 N3）', () => {
  let store
  beforeEach(() => {
    const now = Date.now()
    store = {
      ma_history: [],
      ma_practices: {},
      // 新格式进度：答题页写入 updatedAt
      ma_progress_sds: { answers: [0, 1, null, null, null], current: 2, startedAt: now - 3600000, updatedAt: now - 120000 },
      // 旧格式进度：既无 updatedAt 也无 startedAt，只有题号 current
      ma_progress_gad7: { answers: [1, null, null], current: 1 },
    }
    global.wx.getStorageSync = (k) => (k in store ? store[k] : undefined)
    global.wx.getStorageInfoSync = () => ({ keys: Object.keys(store) })
  })
  afterEach(() => {
    global.wx.getStorageSync = () => []
    global.wx.getStorageInfoSync = undefined
  })

  test('进行中使用 updatedAt 而非题号 current；旧数据无时间戳显示「进行中」而不是 1970', () => {
    const ctx = loadPage('pages/history/history.js')
    const list = ctx.data.inProgressAssess
    expect(list.length).toBe(2)
    const sds = list.find((x) => x.id === 'sds')
    // 时间戳取 updatedAt（不是题号 current=2 这种秒级小值）
    expect(sds.updated).toBe(store.ma_progress_sds.updatedAt)
    expect(sds.updatedText).not.toContain('1970')
    const gad7 = list.find((x) => x.id === 'gad7')
    // 旧数据无 updatedAt/startedAt => 显示「进行中」，而不是 1970 年
    expect(gad7.updatedText).toBe('进行中')
    expect(gad7.updated).toBe(0)
    // 排序按 updated 降序：有时间戳的在前
    expect(list[0].id).toBe('sds')
  })
})

describe('结果页 result（选中旧记录时间回归 N4）', () => {
  const OLD_T = 1600000000000 // 2020-09-13
  const NEW_T = OLD_T + 361 * 86400000 // 361 天后
  const hist = [
    { id: 'sds', rid: 'r1', summary: '50', time: OLD_T, answers: new Array(20).fill(0) },
    { id: 'sds', rid: 'r2', summary: '55', time: NEW_T, answers: new Array(20).fill(0) },
  ]
  let fakeApp
  beforeEach(() => {
    fakeApp = { globalData: {} }
    global.getApp = () => fakeApp
    global.wx.getStorageSync = (k) => (k === 'ma_history' ? hist : undefined)
  })
  afterEach(() => {
    global.getApp = () => ({ globalData: { lastResult: null, history: [] } })
    global.wx.getStorageSync = () => []
  })

  test('最新记录：测评时间/重测间隔取最新一条（原行为不变）', () => {
    fakeApp.globalData.lastResult = { id: 'sds', answers: hist[1].answers, time: NEW_T, rid: 'r2' }
    const ctx = loadPage('pages/result/result.js', { id: 'sds' })
    expect(ctx.data.testedTime).toBe(fmt(NEW_T))
    expect(ctx.data.retestGap).toBe('361 天前')
    expect(ctx.data.retakeHint).toBe('距上次测评 361 天')
  })

  test('从历史打开旧记录：按所选记录的时间计算，而不是最新一条', () => {
    fakeApp.globalData.lastResult = { id: 'sds', answers: hist[0].answers, time: OLD_T, rid: 'r1' }
    const ctx = loadPage('pages/result/result.js', { id: 'sds' })
    expect(ctx.data.testedTime).toBe(fmt(OLD_T))
    expect(ctx.data.testedTime).not.toBe(fmt(NEW_T))
    // 所选记录是最早一条：无更早记录 => 无重测间隔、提示首次测评
    expect(ctx.data.retestGap).toBe('')
    expect(ctx.data.retakeHint).toBe('首次测评')
  })

  test('_computeTestTimes 选中最早记录 => 首次测评；不传 selectedTime => 回退最新一条', () => {
    const ctx = loadPage('pages/result/result.js', { id: 'sds' })
    const first = ctx._computeTestTimes(hist, 'sds', OLD_T)
    expect(first.testedTime).toBe(fmt(OLD_T))
    expect(first.retakeHint).toBe('首次测评')
    const latest = ctx._computeTestTimes(hist, 'sds')
    expect(latest.testedTime).toBe(fmt(NEW_T))
  })
})

describe('测评页 test（doSubmit 稳健性回归 N2/N8）', () => {
  const q = {
    select: () => q,
    fields: () => q,
    exec: (cb) => {
      cb([{ node: { getContext: () => global.__mockCtx, width: 200, height: 200 }, width: 200, height: 200 }])
    },
  }
  beforeEach(() => {
    global.wx.createSelectorQuery = () => q
    global.wx.getStorageSync = (k) => (k === 'ma_history' ? [] : undefined)
    global.wx.showModal = (o) => o && o.success && o.success({ confirm: true })
  })
  afterEach(() => {
    global.wx.createSelectorQuery = undefined
    global.wx.getStorageSync = () => []
    global.wx.showModal = () => {}
    global.wx.setStorageSync = () => {}
    global.wx.removeStorageSync = () => {}
    global.wx.reLaunch = () => {}
  })

  test('N8 评分异常 => 不删答题进度、不 reLaunch，提示交卷失败且可重试', () => {
    const removed = []
    const relaunched = []
    let failModal = 0
    const progressWrites = []
    global.wx.removeStorageSync = (k) => removed.push(k)
    global.wx.reLaunch = (o) => relaunched.push(o)
    global.wx.setStorageSync = (k, v) => {
      if (k === 'ma_progress_sds') progressWrites.push(v)
    }
    global.wx.showModal = (o) => {
      if (o && o.title === '交卷失败') failModal++
    }
    const ctx = loadPage('pages/test/test.js', { id: 'sds' })
    ctx.data.answers = ctx.data.questions.map(() => 0)
    const removedBefore = removed.length // onLoad 恢复流程本身可能已删进度，只关注 doSubmit 是否新增删除
    const orig = ctx.mod.computeResult
    ctx.mod.computeResult = () => {
      throw new Error('boom')
    }
    ctx.doSubmit()
    ctx.mod.computeResult = orig
    expect(failModal).toBe(1)
    expect(relaunched.length).toBe(0) // 未跳转结果页
    // 评分异常时不得删除答题进度（修复前：先删进度后算分，异常后进度丢失、无法恢复）
    expect(removed.length).toBe(removedBefore)
    // 进度仍可写回（_finished 未置位，onHide 兜底保存依然有效）
    ctx.saveProgressForce()
    expect(progressWrites.length).toBeGreaterThan(0)
    expect(progressWrites[0].answers.length).toBe(ctx.data.questions.length)
    // 评分恢复后可重新交卷
    ctx.doSubmit()
    expect(relaunched.length).toBe(1)
    expect(removed).toContain('ma_progress_sds')
  })

  test('N2 存储配额不足 => 逐级丢弃最旧记录直至写入成功，当前记录不丢失', () => {
    const old = []
    for (let i = 0; i < 30; i++) old.push({ rid: 'old_' + i, id: 'sds', time: i, answers: [] })
    global.wx.getStorageSync = (k) => (k === 'ma_history' ? old : undefined)
    const writes = []
    let attempts = 0
    global.wx.setStorageSync = (k, v) => {
      if (k !== 'ma_history') return
      attempts++
      if (attempts === 1) throw new Error('quota exceeded') // 首次写入模拟超配额
      writes.push(v)
    }
    const relaunched = []
    global.wx.reLaunch = (o) => relaunched.push(o)
    let toast = ''
    global.wx.showToast = (o) => {
      toast = o.title
    }
    const ctx = loadPage('pages/test/test.js', { id: 'sds' })
    ctx.data.answers = ctx.data.questions.map(() => 0)
    // 修复前：`const trimmed` 重新赋值直接抛 TypeError，交卷中断
    expect(() => ctx.doSubmit()).not.toThrow()
    // 首次超配额失败后，丢弃最旧记录重试成功（记录数组最新在前，最旧在尾部）
    expect(attempts).toBe(2)
    expect(writes.length).toBe(1)
    expect(writes[0].length).toBe(29) // 30 旧 + 1 新，先截到 30；首次写入失败再丢 1 条 => 29
    expect(writes[0][0].id).toBe('sds') // 当前新记录保留在最前
    const rids = writes[0].map((r) => r.rid)
    expect(rids).toContain('old_0') // 较新的旧记录仍在
    expect(rids).not.toContain('old_28') // 最旧两条（LIMIT 截断 + 配额兜底）被丢弃
    expect(rids).not.toContain('old_29')
    expect(toast).toContain('仅保留最近 30 条记录')
    expect(relaunched.length).toBe(1)
  })
})

describe("个人资料页 profile", () => {
  test("onLoad 不抛错且初始化数据完整", () => {
    const ctx = loadPage("pages/profile/profile.js")
    expect(ctx.data.genderOptions.length).toBe(3)
    expect(typeof ctx.data.avatarUrl).toBe("string")
    expect(typeof ctx.data.nickname).toBe("string")
  })
  test("onChooseAvatar 将临时头像持久化到本地", () => {
    global.wx.env = { USER_DATA_PATH: "/user" }
    global.wx.getFileSystemManager = () => ({
      saveFileSync: () => {},
    })
    const ctx = loadPage("pages/profile/profile.js")
    // 测试环境的系统版本 mock 不满足 2.21.2，这里直接放开能力开关
    ctx.data.canUseChooseAvatar = true
    ctx.onChooseAvatar({ detail: { avatarUrl: "/tmp/a.png" } })
    expect(ctx.data.avatarUrl).toMatch(/^\/user\/avatar_\d+\.png$/)
  })
})

