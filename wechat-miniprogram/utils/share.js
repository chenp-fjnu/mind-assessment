// 内容卡片生成与保存相册的通用逻辑，供测评/方法/结果页复用
const { renderContentCard } = require('./canvas')

function genCard(page, opts, done) {
  const q = (page && page.createSelectorQuery ? page.createSelectorQuery() : wx.createSelectorQuery())
  q.select('#shareCanvas')
    .fields({ node: true, size: true })
    .exec((res) => {
      if (!res || !res[0]) { done(null); return }
      const canvas = res[0].node
      const ctx = canvas.getContext('2d')
      const W = res[0].width
      const H = res[0].height
      renderContentCard(canvas, ctx, W, H, opts, done)
    })
}

function saveToAlbum(path) {
  if (!path) {
    wx.showToast({ title: '生成失败', icon: 'none' })
    return
  }
  wx.saveImageToPhotosAlbum({
    filePath: path,
    success: () => wx.showToast({ title: '已保存到相册', icon: 'success' }),
    fail: (e) => {
      if (e && /auth|deny/i.test(e.errMsg || '')) {
        wx.showModal({
          title: '需要相册权限',
          content: '请在设置中允许「保存到相册」后重试',
          confirmText: '去设置',
          success: (r) => { if (r.confirm) wx.openSetting() },
        })
      } else {
        wx.showToast({ title: '保存失败', icon: 'none' })
      }
    },
  })
}

module.exports = { genCard, saveToAlbum }
