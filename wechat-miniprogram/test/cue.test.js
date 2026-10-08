/**
 * 语音线索播放工具单元测试（utils/cue.js，808 听觉游戏依赖）
 * 运行：npm install && npm run test:simulate
 */

function freshCue() {
  jest.resetModules()
  return require('../utils/cue')
}

function mockAudio(overrides = {}) {
  return Object.assign(
    {
      src: '',
      obeyMuteSwitch: true,
      volume: 0,
      stop: jest.fn(),
      play: jest.fn(),
      destroy: jest.fn(),
    },
    overrides
  )
}

describe('cue', () => {
  afterEach(() => {
    delete wx.createInnerAudioContext
    jest.restoreAllMocks()
  })

  test('环境不支持时 play/stop/destroy 静默降级', () => {
    const cue = freshCue()
    expect(() => cue.play('d0')).not.toThrow()
    expect(() => cue.stop()).not.toThrow()
    expect(() => cue.destroy()).not.toThrow()
  })

  test('play 设置 src 并播放，单例复用', () => {
    const cue = freshCue()
    const a = mockAudio()
    const factory = jest.fn(() => a)
    wx.createInnerAudioContext = factory

    cue.play('lk')
    expect(factory).toHaveBeenCalledTimes(1)
    expect(a.src).toBe('/assets/audio/lk.mp3')
    expect(a.obeyMuteSwitch).toBe(false)
    expect(a.play).toHaveBeenCalledTimes(1)

    cue.play('d5')
    expect(factory).toHaveBeenCalledTimes(1)
    expect(a.stop).toHaveBeenCalledTimes(2)
    expect(a.src).toBe('/assets/audio/d5.mp3')
    expect(a.play).toHaveBeenCalledTimes(2)
  })

  test('创建或播放异常时静默降级', () => {
    let cue = freshCue()
    wx.createInnerAudioContext = () => { throw new Error('nope') }
    expect(() => cue.play('d0')).not.toThrow()

    cue = freshCue()
    const a = mockAudio({ stop: () => { throw new Error('stop fail') } })
    wx.createInnerAudioContext = () => a
    expect(() => cue.play('d0')).not.toThrow()
  })

  test('stop 在未创建与已创建时均安全', () => {
    const cue = freshCue()
    expect(() => cue.stop()).not.toThrow()
    const a = mockAudio()
    wx.createInnerAudioContext = () => a
    cue.play('d1')
    cue.stop()
    expect(a.stop).toHaveBeenCalled()
  })

  test('destroy 释放实例，可重建', () => {
    const cue = freshCue()
    const a1 = mockAudio()
    wx.createInnerAudioContext = () => a1
    cue.play('d2')
    cue.destroy()
    expect(a1.destroy).toHaveBeenCalled()

    const a2 = mockAudio()
    wx.createInnerAudioContext = () => a2
    cue.play('d3')
    expect(a2.src).toBe('/assets/audio/d3.mp3')
    expect(a2.play).toHaveBeenCalled()

    cue.destroy()
    cue.destroy()
    expect(a2.destroy).toHaveBeenCalledTimes(1)
  })
})
