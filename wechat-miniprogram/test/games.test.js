/**
 * 训练游戏纯逻辑单测（generate / score / 注册表 / 存储）。
 * 运行：npm run test:simulate
 */
const { getMetaList, getGame } = require('../utils/game-registry')
const trainStore = require('../utils/train-store')

describe('训练游戏注册表', () => {
  test('包含 7 个游戏且维度齐全', () => {
    const list = getMetaList()
    expect(list.length).toBe(7)
    const dims = list.map((g) => g.dim)
    expect(dims).toEqual(expect.arrayContaining(['attention', 'memory', 'reaction', 'relax']))
  })

  test('每个游戏暴露统一契约字段', () => {
    getMetaList().forEach((meta) => {
      expect(meta.id).toBeTruthy()
      expect(Array.isArray(meta.levels) && meta.levels.length).toBeTruthy()
      expect(meta.metric && meta.metric.key).toBeTruthy()
      const g = getGame(meta.id)
      expect(g.generate).toBeInstanceOf(Function)
      expect(g.score).toBeInstanceOf(Function)
    })
  })
})

describe('舒尔特方格', () => {
  const g = getGame('schulte')
  test('generate 返回 size×size 的 1..N 排列', () => {
    const s = g.generate(5)
    expect(s.size).toBe(5)
    expect(s.cells.length).toBe(25)
    expect([...s.cells].sort((a, b) => a - b)).toEqual(
      Array.from({ length: 25 }, (_, i) => i + 1)
    )
  })
  test('score 用时越短得分越高', () => {
    const fast = g.score({ size: 5, time: 10, errors: 0 })
    const slow = g.score({ size: 5, time: 60, errors: 5 })
    expect(fast.score).toBeGreaterThan(slow.score)
  })
})

describe('记忆配对', () => {
  const g = getGame('memory-match')
  test('generate 返回成对牌组', () => {
    const s = g.generate(6)
    expect(s.deck.length).toBe(12)
    const counts = {}
    s.deck.forEach((v) => (counts[v] = (counts[v] || 0) + 1))
    Object.values(counts).forEach((c) => expect(c).toBe(2))
  })
  test('score 步数越少得分越高', () => {
    const good = g.score({ pairs: 6, time: 20, moves: 12 })
    const bad = g.score({ pairs: 6, time: 80, moves: 40 })
    expect(good.score).toBeGreaterThan(bad.score)
  })
})

describe('斯特鲁普', () => {
  const g = getGame('stroop')
  test('generate 返回试次与选项', () => {
    const s = g.generate(10)
    expect(s.list.length).toBe(10)
    expect(s.options.length).toBe(5)
    s.list.forEach((t) => expect(t.inkKey).toBeTruthy())
  })
  test('score 正确率越高得分越高', () => {
    const good = g.score({ total: 10, correct: 10, errors: 0, time: 15 })
    const bad = g.score({ total: 10, correct: 4, errors: 6, time: 15 })
    expect(good.score).toBeGreaterThan(bad.score)
    expect(good.accuracy).toBe(1)
  })
})

describe('箱式呼吸', () => {
  const g = getGame('box-breathing')
  test('generate 返回目标轮数与 4 阶段', () => {
    const s = g.generate(5)
    expect(s.rounds).toBe(5)
    expect(s.phases.length).toBe(4)
    expect(s.phases.reduce((a, p) => a + p.sec, 0)).toBe(16)
  })
  test('score 轮数越多得分越高', () => {
    const a = g.score({ rounds: 8, duration: 120 })
    const b = g.score({ rounds: 3, duration: 120 })
    expect(a.score).toBeGreaterThan(b.score)
  })
})

describe('反应时间', () => {
  const g = getGame('reaction-time')
  test('generate 返回试次数', () => {
    expect(g.generate(10).trials).toBe(10)
  })
  test('score 平均反应越短得分越高', () => {
    const fast = g.score({ times: [200, 210, 220], total: 3, early: 0 })
    const slow = g.score({ times: [500, 520, 540], total: 3, early: 0 })
    expect(fast.score).toBeGreaterThan(slow.score)
    expect(fast.avg).toBeLessThan(slow.avg)
  })
})

describe('N-Back', () => {
  const g = getGame('n-back')
  test('generate 返回序列长度 = trials', () => {
    const s = g.generate({ n: 2, trials: 20 })
    expect(s.seq.length).toBe(20)
    expect(s.n).toBe(2)
  })
  test('score 正确率越高得分越高', () => {
    const good = g.score({ correct: 18, total: 20, times: [600, 600] })
    const bad = g.score({ correct: 8, total: 20, times: [600, 600] })
    expect(good.score).toBeGreaterThan(bad.score)
    expect(good.accuracy).toBe(0.9)
  })
})

describe('Flanker', () => {
  const g = getGame('flanker')
  test('generate 返回试次与方向', () => {
    const s = g.generate(10)
    expect(s.list.length).toBe(10)
    s.list.forEach((t) => expect(['left', 'right']).toContain(t.dir))
  })
  test('score 正确率越高得分越高', () => {
    const good = g.score({ correct: 19, total: 20, times: [450] })
    const bad = g.score({ correct: 9, total: 20, times: [450] })
    expect(good.score).toBeGreaterThan(bad.score)
  })
})

describe('训练成绩存储', () => {
  test('空记录时 best 为 null，trend 不展示', () => {
    expect(trainStore.best('schulte', 'lower')).toBeNull()
    const t = trainStore.trend('schulte')
    expect(t.showTrend).toBe(false)
  })
  test('save 不抛错', () => {
    expect(() => trainStore.save('schulte', 12.5, { time: 12.5 })).not.toThrow()
  })
})
