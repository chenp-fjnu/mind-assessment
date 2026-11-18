require('../games/n-back/game')
const definition = global.__lastCompDef

function createGame() {
  const game = {
    data: Object.assign({}, definition.data, { level: 1, boardWidth: 705, boardHeight: 0 }),
    setData(updates) {
      this.data = Object.assign({}, this.data, updates)
    },
    triggerEvent: jest.fn(),
  }
  Object.keys(definition.methods).forEach((name) => {
    game[name] = definition.methods[name].bind(game)
  })
  game.reset()
  return game
}

describe('N-Back 游戏流程', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('双重模式需要分别作答，且反馈会展示后再进入下一轮', () => {
    const game = createGame()
    // 入门难度默认 visual，本用例专门验证 dual 模式，需显式切换
    game.onModeChange({ currentTarget: { dataset: { mode: 'dual' } } })
    game.data.visualSeq = [4, 4].concat(Array(19).fill(2))
    game.data.auditorySeq = [3, 5].concat(Array(19).fill(1))
    game.start()
    expect(game.data.phase).toBe('show')

    jest.advanceTimersByTime(650)
    expect(game.data.phase).toBe('warmup')
    expect(game.data.total).toBe(0)
    jest.advanceTimersByTime(500)
    expect(game.data.phase).toBe('show')
    expect(game.data.stimulusIdx).toBe(1)

    jest.advanceTimersByTime(650)
    expect(game.data.phase).toBe('answer')

    game.onVisualAnswer({ currentTarget: { dataset: { match: '1' } } })
    expect(game.data.canSubmit).toBe(false)
    game.submitAnswer()
    expect(game.data.phase).toBe('answer')

    game.onAuditoryAnswer({ currentTarget: { dataset: { match: '0' } } })
    expect(game.data.canSubmit).toBe(true)
    game.submitAnswer()
    expect(game.data.phase).toBe('feedback')
    expect(game.data.correct).toBe(2)
    expect(game.data.total).toBe(2)
    expect(game.data.lastResult.visual).toBeTruthy()
    expect(game.data.lastResult.auditory).toBeTruthy()

    jest.advanceTimersByTime(499)
    expect(game.data.phase).toBe('feedback')
    jest.advanceTimersByTime(1)
    expect(game.data.phase).toBe('show')
    expect(game.data.roundIdx).toBe(1)
  })

  test('单模态只需提交对应的一项答案', () => {
    const game = createGame()
    game.onModeChange({ currentTarget: { dataset: { mode: 'visual' } } })
    game.start()
    jest.advanceTimersByTime(650)
    jest.advanceTimersByTime(500)
    jest.advanceTimersByTime(650)

    expect(game.data.phase).toBe('answer')
    game.onVisualAnswer({ currentTarget: { dataset: { match: '0' } } })
    expect(game.data.canSubmit).toBe(true)
    game.submitAnswer()

    expect(game.data.phase).toBe('feedback')
    expect(game.data.total).toBe(1)
  })

  test('再次训练保留所选模式与网格', () => {
    const game = createGame()
    game.data.mode = 'visual'
    game.data.gridSize = 'medium'
    game.data.phase = 'done'
    game.replay()

    expect(game.data.phase).toBe('idle')
    expect(game.data.mode).toBe('visual')
    expect(game.data.gridSize).toBe('medium')
    expect(game.data.roundIdx).toBe(0)
  })

  test('最后一轮反馈结束后进入结果并发送训练成绩', () => {
    const game = createGame()
    game.data.trials = 1
    game.data.visualSeq = [2, 2]
    game.data.auditorySeq = [3, 3]
    game.start()
    jest.advanceTimersByTime(650)
    jest.advanceTimersByTime(500)
    jest.advanceTimersByTime(650)
    game.onVisualAnswer({ currentTarget: { dataset: { match: '0' } } })
    game.onAuditoryAnswer({ currentTarget: { dataset: { match: '0' } } })
    game.submitAnswer()

    expect(game.data.phase).toBe('feedback')
    jest.advanceTimersByTime(500)

    expect(game.data.phase).toBe('done')
    expect(game.data.result).toBeTruthy()
    expect(game.triggerEvent).toHaveBeenCalledWith('finish', game.data.result)
  })
})
