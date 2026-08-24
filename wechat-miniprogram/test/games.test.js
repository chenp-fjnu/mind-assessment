/**
 * 训练游戏纯逻辑单测（generate / score / 注册表 / 存储）。
 * 运行：npm run test:simulate
 */
const { getMetaList, getGame } = require('../utils/game-registry')
const trainStore = require('../utils/train-store')

describe('训练游戏注册表', () => {
  test('包含 31 个游戏且维度齐全', () => {
    const list = getMetaList()
    expect(list.length).toBe(31)
    const dims = list.map((g) => g.dim)
    expect(dims).toEqual(expect.arrayContaining(['attention', 'memory', 'reaction', 'relax', 'exec']))
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
  test('generate 返回视觉和听觉序列', () => {
    const s = g.generate({ n: 2, trials: 20, mode: 'dual', gridSize: 'small' })
    expect(s.visualSeq.length).toBe(20)
    expect(s.auditorySeq.length).toBe(20)
    expect(s.n).toBe(2)
    expect(s.mode).toBe('dual')
    expect(s.gridSize).toBe('small')
  })
  test('generate visual only 模式', () => {
    const s = g.generate({ n: 2, trials: 15, mode: 'visual', gridSize: 'medium' })
    expect(s.visualSeq.length).toBe(15)
    expect(s.auditorySeq.length).toBe(15)
    expect(s.mode).toBe('visual')
    expect(s.gridSize).toBe('medium')
  })
  test('score 正确率越高得分越高', () => {
    const good = g.score({ correct: 18, total: 20, times: [600, 600], visualCorrect: 18, visualTotal: 20, auditoryCorrect: 18, auditoryTotal: 20 })
    const bad = g.score({ correct: 8, total: 20, times: [600, 600], visualCorrect: 8, visualTotal: 20, auditoryCorrect: 8, auditoryTotal: 20 })
    expect(good.score).toBeGreaterThan(bad.score)
    expect(good.accuracy).toBe(0.9)
    expect(good.visualAccuracy).toBe(0.9)
    expect(good.auditoryAccuracy).toBe(0.9)
  })
  test('isMatch 正确判断 N 步匹配', () => {
    const seq = [1, 2, 3, 1, 2, 3]
    expect(g.isMatch(seq, 3, 3)).toBe(true)  // seq[3] === seq[0]
    expect(g.isMatch(seq, 4, 3)).toBe(true)  // seq[4] === seq[1]
    expect(g.isMatch(seq, 2, 3)).toBe(false) // idx < n
    expect(g.isMatch(seq, 5, 3)).toBe(true)  // seq[5] === seq[2]
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

describe('数字划消', () => {
  const g = getGame('cancellation')
  test('generate 返回含目标数字的矩阵 (8×8)', () => {
    const s = g.generate(0)
    expect(s.target).toBe('0')
    expect(s.rows).toBe(8)
    expect(s.cols).toBe(8)
    expect(s.size).toBe(8)
    expect(s.targetCount).toBeGreaterThan(0)
    expect(s.cells.filter((c) => c === '0').length).toBe(s.targetCount)
  })
  test('generate level 7 返回 9×9 矩阵', () => {
    const s = g.generate(7)
    expect(s.rows).toBe(9)
    expect(s.cols).toBe(9)
    expect(s.size).toBe(9)
    expect(s.target).toBe('7')
  })
  test('score 用时越短得分越高', () => {
    const fast = g.score({ targetCount: 10, found: 10, errors: 0, time: 8 })
    const slow = g.score({ targetCount: 10, found: 8, errors: 3, time: 40 })
    expect(fast.score).toBeGreaterThan(slow.score)
  })
})

describe('视觉搜索', () => {
  const g = getGame('visual-search')
  test('generate 返回多轮次数据', () => {
    const s = g.generate({ level: 2, trials: 5 })
    expect(s.trials).toBe(5)
    expect(s.trialsData.length).toBe(5)
    expect(s.trialsData[0].size).toBeGreaterThanOrEqual(3)
    expect(s.trialsData[0].oddIdx).toBeGreaterThanOrEqual(0)
  })
  test('generate 不同等级网格大小递增', () => {
    const s1 = g.generate({ level: 1, trials: 1 })
    const s5 = g.generate({ level: 5, trials: 1 })
    expect(s5.trialsData[0].size).toBeGreaterThanOrEqual(s1.trialsData[0].size)
  })
  test('score 用时越短得分越高', () => {
    const fast = g.score({ errors: 0, time: 2, trials: 8 })
    const slow = g.score({ errors: 4, time: 12, trials: 8 })
    expect(fast.score).toBeGreaterThan(slow.score)
  })
})

describe('按要求找方格', () => {
  const g = getGame('find-rule')
  test('generate 含目标方格', () => {
    const s = g.generate(2)
    expect(s.targetCount).toBeGreaterThan(0)
    expect(s.cells.filter((c) => c.target).length).toBe(s.targetCount)
  })
})

describe('图形追踪', () => {
  const g = getGame('figure-tracking')
  test('generate 返回 1..N 排列', () => {
    const s = g.generate(4)
    expect(s.cells.length).toBe(16)
    expect([...s.cells].sort((a, b) => a - b)).toEqual(
      Array.from({ length: 16 }, (_, i) => i + 1)
    )
  })
})

describe('数字迷宫', () => {
  const g = getGame('number-maze')
  test('generate 返回迷宫与出口', () => {
    const s = g.generate(5)
    expect(s.size).toBe(5)
    expect(s.exit).toBe(24)
    expect(s.walls.length).toBe(5)
  })
  test('score 步数越少得分越高', () => {
    const good = g.score({ steps: 24, time: 10, optimal: 24 })
    const bad = g.score({ steps: 60, time: 40, optimal: 24 })
    expect(good.score).toBeGreaterThan(bad.score)
  })
})

describe('镜像沙漏', () => {
  const g = getGame('mirror')
  test('generate 返回试次与答案', () => {
    const s = g.generate(2)
    expect(s.list.length).toBe(10)
    s.list.forEach((t) => expect(typeof t.answer).toBe('boolean'))
  })
})

describe('数字密码', () => {
  const g = getGame('number-code')
  test('generate 返回序列长度 = level', () => {
    expect(g.generate(6).seq.length).toBe(6)
  })
  test('score 正确率越高得分越高', () => {
    const good = g.score({ correct: 6, total: 6 })
    const bad = g.score({ correct: 3, total: 6 })
    expect(good.score).toBeGreaterThan(bad.score)
  })
})

describe('工作记忆游戏', () => {
  test('pattern-memory 返回高亮方块', () => {
    const g = getGame('pattern-memory')
    const s = g.generate(6)
    expect(s.cells.filter((v) => v).length).toBe(6)
  })
  test('simon 返回长度为 level 的序列', () => {
    expect(getGame('simon').generate(7).seq.length).toBe(7)
  })
  test('digit-span 返回长度为 level 的序列', () => {
    expect(getGame('digit-span').generate(8).seq.length).toBe(8)
  })
  test('corsi 返回长度为 level 的序列', () => {
    expect(getGame('corsi').generate(5).seq.length).toBe(5)
  })
})

describe('反应速度游戏', () => {
  test('whack 返回地鼠数', () => {
    expect(getGame('whack').generate(4).trials).toBe(20)
  })
  test('go-no-go 返回试次', () => {
    const s = getGame('go-no-go').generate(3)
    expect(s.list.length).toBe(24)
  })
  test('bigger-number 返回不等数字对', () => {
    const s = getGame('bigger-number').generate(2)
    s.list.forEach((t) => expect(t.a).not.toBe(t.b))
  })
  test('cps 返回时长', () => {
    expect(getGame('cps').generate(2).duration).toBe(10)
  })
  test('color-match 返回调色板', () => {
    expect(getGame('color-match').generate(2).palette.length).toBe(4)
  })
  test('double-decision 返回试次', () => {
    expect(getGame('double-decision').generate(2).list.length).toBe(12)
  })
})

describe('放松正念游戏', () => {
  test('breath-478 返回 4-7-8 节律', () => {
    const s = getGame('breath-478').generate(3)
    expect(s.phases.map((p) => p.dur)).toEqual([4, 7, 8])
    expect(s.cycles).toBe(3)
  })
  test('resonance 返回吸气4呼气6', () => {
    expect(getGame('resonance').generate(5).phases.map((p) => p.dur)).toEqual([4, 6])
  })
  test('mindfulness 返回引导语', () => {
    expect(getGame('mindfulness').generate(4).prompts.length).toBeGreaterThan(0)
  })
})

describe('执行功能游戏', () => {
  test('hanoi 返回最优步数 = 2^n-1', () => {
    expect(getGame('hanoi').generate(3).optimal).toBe(7)
  })
  test('task-switch 返回试次', () => {
    expect(getGame('task-switch').generate(2).list.length).toBe(12)
  })
  test('wisconsin 每题有唯一正确项', () => {
    const s = getGame('wisconsin').generate(2)
    s.list.forEach((t) => {
      const match = t.options.filter((o, i) => i === t.ans).length
      expect(match).toBe(1)
    })
  })
  test('tower-london 返回起止配置', () => {
    const s = getGame('tower-london').generate(4)
    expect(s.start.length).toBe(3)
    expect(s.goal.length).toBe(3)
  })
})

describe('训练游戏计分单调性（覆盖全部 31 个游戏）', () => {
  const cases = {
    'bigger-number': [{ total: 10, correct: 10 }, { total: 10, correct: 4 }],
    'color-match': [{ total: 20, correct: 20 }, { total: 20, correct: 10 }],
    'corsi': [{ total: 9, correct: 9 }, { total: 9, correct: 3 }],
    'digit-span': [{ total: 9, correct: 9 }, { total: 9, correct: 2 }],
    'double-decision': [{ total: 12, correct: 12 }, { total: 12, correct: 6 }],
    'go-no-go': [{ total: 24, correct: 24 }, { total: 24, correct: 12 }],
    'mirror': [{ total: 10, correct: 10 }, { total: 10, correct: 5 }],
    'simon': [{ total: 8, correct: 8 }, { total: 8, correct: 3 }],
    'task-switch': [{ total: 12, correct: 12 }, { total: 12, correct: 5 }],
    'wisconsin': [{ total: 10, correct: 10 }, { total: 10, correct: 4 }],
    'pattern-memory': [{ total: 9, correct: 9 }, { total: 9, correct: 3 }],
    'breath-478': [{ cycles: 6 }, { cycles: 2 }],
    'resonance': [{ cycles: 8 }, { cycles: 2 }],
    'mindfulness': [{ cycles: 5 }, { cycles: 1 }],
    'cps': [{ clicks: 60 }, { clicks: 20 }],
    'whack': [{ hits: 18, misses: 2 }, { hits: 5, misses: 10 }],
    'hanoi': [{ moves: 7, optimal: 7 }, { moves: 27, optimal: 7 }],
    'tower-london': [{ moves: 3 }, { moves: 30 }],
    'figure-tracking': [{ size: 5, time: 25, errors: 0 }, { size: 5, time: 120, errors: 10 }],
    'find-rule': [
      { targetCount: 8, found: 8, errors: 0, time: 8 },
      { targetCount: 8, found: 4, errors: 5, time: 40 },
    ],
    'visual-search': [{ time: 2, errors: 0 }, { time: 20, errors: 10 }],
  }
  Object.keys(cases).forEach((id) => {
    test(`${id} 好成绩得分高于差成绩`, () => {
      const g = getGame(id)
      const [good, bad] = cases[id]
      expect(g.score(good).score).toBeGreaterThan(g.score(bad).score)
    })
  })
  test('n-back 好成绩得分高于差成绩', () => {
    const g = getGame('n-back')
    expect(g.score({ correct: 18, total: 20, times: [600, 600] }).score).toBeGreaterThan(
      g.score({ correct: 8, total: 20, times: [600, 600] }).score
    )
  })
  test('schulte 用时短得分高', () => {
    const g = getGame('schulte')
    expect(g.score({ size: 5, time: 10, errors: 0 }).score).toBeGreaterThan(
      g.score({ size: 5, time: 60, errors: 5 }).score
    )
  })
})

describe('训练成绩存储', () => {
  test('空记录时 best 为 null，trend 不展示', () => {
    expect(trainStore.best('schulte', 3, 'lower')).toBeNull()
    const t = trainStore.trend('schulte', 3)
    expect(t.showTrend).toBe(false)
  })
  test('save 不抛错', () => {
    expect(() => trainStore.save('schulte', 3, 12.5, { time: 12.5 })).not.toThrow()
  })
})
