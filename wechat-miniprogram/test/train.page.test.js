/**
 * 训练页层自动化测试（基于 mock 运行时，无需真实小程序或 @miniprogram/simulate）。
 * 覆盖训练列表页 train（分组/过滤/跳转）与训练播放页 game（加载/选关/结算保存/返回）。
 * 运行：npm run test:simulate
 */
const { loadPage } = require('./page-helper')

describe('训练列表页 train', () => {
  test('onLoad 按 5 维度分组并构建 chips', () => {
    const ctx = loadPage('pages/train/train.js')
    expect(ctx.data.groups.length).toBe(5)
    const total = ctx.data.groups.reduce((n, g) => n + g.games.length, 0)
    expect(total).toBe(31)
    expect(ctx.data.typeChips[0].key).toBe('')
    expect(ctx.data.typeChips.length).toBe(6)
    expect(ctx.data.filteredGroups.length).toBe(5)
  })

  test('每个游戏卡片含 id/name/desc/最佳文案', () => {
    const ctx = loadPage('pages/train/train.js')
    ctx.data.groups.forEach((grp) => {
      grp.games.forEach((g) => {
        expect(g.id).toBeTruthy()
        expect(g.name).toBeTruthy()
        expect(g.desc).toBeTruthy()
        expect(typeof g.bestText).toBe('string')
      })
    })
  })

  test('onSelectDim 按维度过滤', () => {
    const ctx = loadPage('pages/train/train.js')
    ctx.onSelectDim({ currentTarget: { dataset: { key: 'memory' } } })
    expect(ctx.data.activeDim).toBe('memory')
    expect(ctx.data.filteredGroups.length).toBe(1)
    expect(ctx.data.filteredGroups[0].dim).toBe('memory')
  })

  test('onSearch 按名称过滤，clearSearch 还原', () => {
    const ctx = loadPage('pages/train/train.js')
    ctx.onSearch({ detail: { value: '舒尔特' } })
    const ids = ctx.data.filteredGroups.flatMap((g) => g.games.map((x) => x.id))
    expect(ids.length).toBeGreaterThanOrEqual(1)
    expect(ids).toContain('schulte')
    ctx.clearSearch()
    expect(ctx.data.filteredGroups.length).toBe(5)
  })

  test('goGame 跳转训练播放页', () => {
    let nav = null
    global.wx.navigateTo = (o) => {
      nav = o.url
    }
    const ctx = loadPage('pages/train/train.js')
    ctx.goGame({ currentTarget: { dataset: { id: 'schulte' } } })
    expect(nav).toContain('/pages/train/game?gameId=schulte')
  })

  test('onShow 刷新最佳成绩文案（无记录时为暂无记录）', () => {
    const ctx = loadPage('pages/train/train.js')
    expect(ctx.data.groups[0].games[0].bestText).toBe('暂无记录')
  })
})

describe('训练播放页 game', () => {
  test('onLoad 加载合法游戏构建 meta/levels/最佳', () => {
    const ctx = loadPage('pages/train/game.js', { gameId: 'schulte' })
    expect(ctx.data.meta.name).toBeTruthy()
    expect(ctx.data.meta.metric).toBeTruthy()
    expect(ctx.data.levels.length).toBeGreaterThan(0)
    expect(ctx.data.level).toBe(ctx.data.levels[0].value)
    expect(ctx.data.bestText).toBe('暂无记录')
  })

  test('非法 gameId 提示且 meta 为 null', () => {
    let toast = ''
    global.wx.showToast = (o) => {
      toast = o.title
    }
    const ctx = loadPage('pages/train/game.js', { gameId: 'nope' })
    expect(toast).toContain('游戏不存在')
    expect(ctx.data.meta).toBeNull()
  })

  test('onSelectLevel 更新当前关卡并重置结果', () => {
    const ctx = loadPage('pages/train/game.js', { gameId: 'schulte' })
    ctx.onFinish({ detail: { time: 12, errors: 0, score: 900 } })
    const last = ctx.data.levels[ctx.data.levels.length - 1]
    ctx.onSelectLevel({ currentTarget: { dataset: { value: last.value, label: last.label } } })
    expect(ctx.data.level).toBe(last.value)
    expect(ctx.data.levelLabel).toBe(last.label)
    expect(ctx.data.finished).toBe(false)
    expect(ctx.data.result).toBeNull()
  })

  test('onFinish 保存成绩到 train-store 并展示结果卡片', () => {
    const writes = []
    global.wx.setStorageSync = (k, v) => {
      writes.push({ k, v })
    }
    const ctx = loadPage('pages/train/game.js', { gameId: 'schulte' })
    ctx.onFinish({ detail: { time: 12.5, errors: 0, score: 900 } })
    expect(writes.length).toBeGreaterThan(0)
    // 成绩按「游戏 + 难度」分别写入独立键（含难度等级）
    const scoreWrite = writes.find((w) => w.k.indexOf('ma_train_schulte__') === 0)
    expect(scoreWrite).toBeTruthy()
    expect(ctx.data.finished).toBe(true)
    expect(ctx.data.result.time).toBe(12.5)
    const labels = ctx.data.resultChips.map((c) => c.label)
    expect(labels).toContain('用时')
  })

  test('replay 重置结果状态', () => {
    const ctx = loadPage('pages/train/game.js', { gameId: 'schulte' })
    ctx.onFinish({ detail: { time: 12, errors: 0, score: 900 } })
    expect(ctx.data.finished).toBe(true)
    ctx.replay()
    expect(ctx.data.finished).toBe(false)
    expect(ctx.data.result).toBeNull()
  })

  test('goBack 调用 navigateBack，失败回退训练列表', () => {
    let back = null
    let fallback = null
    global.wx.navigateBack = (o) => {
      back = o
      if (o && o.fail) o.fail()
    }
    global.wx.switchTab = (o) => {
      fallback = o.url
    }
    const ctx = loadPage('pages/train/game.js', { gameId: 'schulte' })
    ctx.goBack()
    expect(back).not.toBeNull()
    expect(fallback).toContain('/pages/train/train')
  })
})
