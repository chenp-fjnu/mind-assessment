/**
 * 隐私接口合规封装单元测试（utils/privacy.js）
 * 运行：npm install && npm run test:simulate
 */

describe('privacy', () => {
  afterEach(() => {
    delete wx.onNeedPrivacyAuthorization
    delete wx.requirePrivacyAuthorize
    delete wx.openPrivacyContract
    jest.restoreAllMocks()
  })

  test('registerPrivacyModal 不支持时直接返回', () => {
    const { registerPrivacyModal } = require('../utils/privacy')
    expect(() => registerPrivacyModal()).not.toThrow()
    expect(wx.onNeedPrivacyAuthorization).toBeUndefined()
  })

  test('registerPrivacyModal 注册后按弹窗结果 agree/disagree 解析', () => {
    const { registerPrivacyModal } = require('../utils/privacy')
    let handler = null
    wx.onNeedPrivacyAuthorization = (fn) => { handler = fn }
    let modal = null
    wx.showModal = (o) => { modal = o }
    registerPrivacyModal()
    expect(typeof handler).toBe('function')

    const events = []
    handler((r) => events.push(r.event))
    expect(modal.title).toBe('隐私授权提示')
    modal.success({ confirm: true })
    modal.success({ confirm: false })
    expect(events).toEqual(['agree', 'disagree'])
  })

  test('registerPrivacyModal resolve 为空或弹窗失败时安全降级', () => {
    const { registerPrivacyModal } = require('../utils/privacy')
    let handler = null
    wx.onNeedPrivacyAuthorization = (fn) => { handler = fn }
    let modal = null
    wx.showModal = (o) => { modal = o }
    registerPrivacyModal()

    expect(() => handler(null)).not.toThrow()
    handler(() => {})
    modal.success({ confirm: true })
    modal.fail()
    expect(() => modal.success({})).not.toThrow()
  })

  test('withPrivacy 不支持隐私接口时直接执行 action', () => {
    const { withPrivacy } = require('../utils/privacy')
    const calls = []
    withPrivacy(() => calls.push('a'))
    expect(calls).toEqual(['a'])
    expect(() => withPrivacy(null)).not.toThrow()
  })

  test('withPrivacy 授权成功执行 action，失败回调 onRefuse', () => {
    const { withPrivacy } = require('../utils/privacy')
    let req = null
    wx.requirePrivacyAuthorize = (o) => { req = o }
    const calls = []
    withPrivacy(() => calls.push('a'), () => calls.push('r'))
    req.success()
    req.fail()
    expect(calls).toEqual(['a', 'r'])
  })

  test('withPrivacy 失败且无 onRefuse 时提示', () => {
    const { withPrivacy } = require('../utils/privacy')
    let req = null
    wx.requirePrivacyAuthorize = (o) => { req = o }
    const toast = jest.spyOn(wx, 'showToast').mockImplementation(() => {})
    let actionRan = false
    withPrivacy(() => { actionRan = true })
    req.fail()
    expect(actionRan).toBe(false)
    expect(toast).toHaveBeenCalled()
  })

  test('openPrivacyContract 支持与不支持两条路径', () => {
    const { openPrivacyContract } = require('../utils/privacy')
    const toast = jest.spyOn(wx, 'showToast').mockImplementation(() => {})

    let opt = null
    wx.openPrivacyContract = (o) => { opt = o }
    openPrivacyContract()
    opt.fail()
    expect(toast).toHaveBeenCalledTimes(1)

    delete wx.openPrivacyContract
    openPrivacyContract()
    expect(toast).toHaveBeenCalledTimes(2)
  })
})
