/**
 * 内容卡片生成与保存相册单元测试（utils/share.js）
 * 运行：npm install && npm run test:simulate
 */
jest.mock('../utils/canvas', () => ({
  renderContentCard: jest.fn((canvas, ctx, W, H, opts, done) => done('tmp://card.png')),
}))

const { genCard, saveToAlbum } = require('../utils/share')
const { renderContentCard } = require('../utils/canvas')

function overrideQuery(result) {
  const q = {
    select: jest.fn(() => q),
    fields: jest.fn(() => q),
    exec: jest.fn((cb) => cb(result)),
  }
  wx.createSelectorQuery = jest.fn(() => q)
  return q
}

describe('share.genCard', () => {
  beforeEach(() => jest.clearAllMocks())

  test('无 selector 命中时回调 null', () => {
    overrideQuery([])
    let out = 'unset'
    genCard(null, { title: 't' }, (r) => { out = r })
    expect(out).toBeNull()
    expect(renderContentCard).not.toHaveBeenCalled()
  })

  test('结果为空数组时回调 null', () => {
    overrideQuery(undefined)
    let out = 'unset'
    genCard(null, {}, (r) => { out = r })
    expect(out).toBeNull()
  })

  test('页面自带 createSelectorQuery 时渲染并回调', () => {
    overrideQuery([{ node: { getContext: () => global.__mockCtx }, width: 50, height: 50 }])
    const page = { createSelectorQuery: wx.createSelectorQuery }
    let out = null
    genCard(page, { title: 't' }, (r) => { out = r })
    expect(renderContentCard).toHaveBeenCalledTimes(1)
    expect(out).toBe('tmp://card.png')
  })

  test('无 page 时回退 wx.createSelectorQuery', () => {
    const q = overrideQuery([{ node: { getContext: () => global.__mockCtx }, width: 50, height: 50 }])
    let out = null
    genCard(null, {}, (r) => { out = r })
    expect(wx.createSelectorQuery).toHaveBeenCalled()
    expect(q.fields).toHaveBeenCalled()
    expect(out).toBe('tmp://card.png')
  })
})

describe('share.saveToAlbum', () => {
  afterEach(() => jest.restoreAllMocks())

  test('路径为空提示生成失败', () => {
    const toast = jest.spyOn(wx, 'showToast').mockImplementation(() => {})
    saveToAlbum('')
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: '生成失败' }))
  })

  test('保存成功提示已保存', () => {
    const toast = jest.spyOn(wx, 'showToast').mockImplementation(() => {})
    jest.spyOn(wx, 'saveImageToPhotosAlbum').mockImplementation((o) => o.success && o.success())
    saveToAlbum('tmp://x.png')
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: '已保存到相册' }))
  })

  test('权限错误弹设置引导，确认后打开设置', () => {
    const toast = jest.spyOn(wx, 'showToast').mockImplementation(() => {})
    let modal = null
    jest.spyOn(wx, 'showModal').mockImplementation((o) => { modal = o })
    const openSetting = jest.fn()
    wx.openSetting = openSetting
    jest.spyOn(wx, 'saveImageToPhotosAlbum').mockImplementation((o) => o.fail && o.fail({ errMsg: 'saveImageToPhotosAlbum:auth deny' }))
    saveToAlbum('tmp://x.png')
    expect(modal).toBeTruthy()
    modal.success({ confirm: true })
    expect(openSetting).toHaveBeenCalled()
    modal.success({ confirm: false })
    expect(toast).not.toHaveBeenCalled()
    delete wx.openSetting
  })

  test('其他保存失败提示保存失败', () => {
    const toast = jest.spyOn(wx, 'showToast').mockImplementation(() => {})
    jest.spyOn(wx, 'saveImageToPhotosAlbum').mockImplementation((o) => o.fail && o.fail({ errMsg: 'fail:disk full' }))
    saveToAlbum('tmp://x.png')
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: '保存失败' }))
  })
})
