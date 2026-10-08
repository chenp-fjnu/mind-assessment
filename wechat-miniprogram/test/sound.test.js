/**
 * WebAudio 合成音效单元测试（utils/sound.js，dual-square 等游戏依赖）
 * 运行：npm install && npm run test:simulate
 */

function freshSound() {
  jest.resetModules()
  return require('../utils/sound')
}

function mockWebAudio(overrides = {}) {
  const osc = {
    type: '',
    frequency: { setValueAtTime: jest.fn() },
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
  }
  const gain = {
    gain: { setValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() },
    connect: jest.fn(),
  }
  const c = Object.assign(
    {
      currentTime: 0,
      state: 'running',
      resume: jest.fn(),
      destination: {},
      createOscillator: jest.fn(() => osc),
      createGain: jest.fn(() => gain),
    },
    overrides
  )
  return { ctx: c, osc, gain }
}

describe('sound', () => {
  afterEach(() => {
    delete wx.createWebAudioContext
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  test('环境不支持 WebAudio 时全部方法静默降级', () => {
    const s = freshSound()
    expect(() => {
      s.tone(440, 0.1)
      s.tap(); s.hit(); s.miss(); s.tick()
      s.success(); s.fail()
    }).not.toThrow()
  })

  test('创建上下文抛异常时静默降级', () => {
    const s = freshSound()
    wx.createWebAudioContext = () => { throw new Error('unsupported') }
    expect(() => s.tone(440, 0.1)).not.toThrow()
  })

  test('tone 完整调度振荡器与包络，默认类型与音量', () => {
    const s = freshSound()
    const { ctx, osc, gain } = mockWebAudio()
    wx.createWebAudioContext = () => ctx

    s.tone(440, 0.2)
    expect(osc.frequency.setValueAtTime).toHaveBeenCalledWith(440, 0)
    expect(osc.type).toBe('sine')
    expect(gain.gain.setValueAtTime).toHaveBeenCalledWith(0.0001, 0)
    expect(gain.gain.exponentialRampToValueAtTime).toHaveBeenNthCalledWith(1, 0.2, 0.006)
    expect(gain.gain.exponentialRampToValueAtTime).toHaveBeenNthCalledWith(2, 0.0001, 0.2)
    expect(osc.connect).toHaveBeenCalledWith(gain)
    expect(gain.connect).toHaveBeenCalledWith(ctx.destination)
    expect(osc.start).toHaveBeenCalledWith(0)
    expect(osc.stop).toHaveBeenCalledWith(0.22)

    s.tone(880, 0.1, 'square', 0.5)
    expect(osc.type).toBe('square')
    expect(gain.gain.exponentialRampToValueAtTime).toHaveBeenNthCalledWith(3, 0.5, 0.006)
    expect(gain.gain.exponentialRampToValueAtTime).toHaveBeenNthCalledWith(4, 0.0001, 0.1)
  })

  test('上下文 suspended 时复用并 resume', () => {
    const s = freshSound()
    const { ctx } = mockWebAudio({ state: 'suspended' })
    const factory = jest.fn(() => ctx)
    wx.createWebAudioContext = factory
    s.tone(440, 0.1)
    s.tone(880, 0.1)
    expect(ctx.resume).toHaveBeenCalledTimes(1)
    expect(factory).toHaveBeenCalledTimes(1)
  })

  test('发声链路异常时被吞掉', () => {
    const s = freshSound()
    const { ctx } = mockWebAudio({ createGain: () => { throw new Error('gain fail') } })
    wx.createWebAudioContext = () => ctx
    expect(() => s.tone(440, 0.1)).not.toThrow()
  })

  test('反馈音全部可调用且 success/fail 播第二音', () => {
    jest.useFakeTimers()
    const s = freshSound()
    const { ctx, osc } = mockWebAudio()
    wx.createWebAudioContext = () => ctx

    expect(() => {
      s.tap(); s.hit(); s.miss(); s.tick()
    }).not.toThrow()
    expect(osc.start).toHaveBeenCalledTimes(4)

    s.success()
    expect(osc.start).toHaveBeenCalledTimes(5)
    jest.advanceTimersByTime(100)
    expect(osc.start).toHaveBeenCalledTimes(6)

    s.fail()
    expect(osc.start).toHaveBeenCalledTimes(7)
    jest.advanceTimersByTime(150)
    expect(osc.start).toHaveBeenCalledTimes(8)
  })
})
