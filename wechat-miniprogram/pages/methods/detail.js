const methodsData = require('../../utils/methods-data')
const { genCard, saveToAlbum } = require('../../utils/share')
const { useTheme } = require('../../utils/theme-store')

Page({
  data: {
    method: null,
    isInteractive: false,
    content: [],
    steps: [],
  },
  onLoad(query) {
    useTheme(this)
    const id = query.id
    const method = methodsData.getMethod(id)
    if (!method) {
      this.setData({ method: null })
      return
    }
    wx.setNavigationBarTitle({ title: method.name })
    this._id = id
    const steps = (method.steps || []).map((s) => ({
      text: s,
      showNo: !/^[a-zA-Z]/.test(s),
    }))
    this.setData({
      method,
      isInteractive: !!method.interactive,
      content: method.content || [],
      steps,
    })
  },
  goPractice() {
    wx.navigateTo({ url: '/pages/methods/practice?id=' + this._id })
  },
  goBack() {
    wx.navigateBack({ delta: 1 })
  },
  onReady() {
    const m = this.data.method
    if (!m) return
    genCard(this, {
      color: m.color,
      icon: m.icon,
      title: m.name,
      subtitle: m.summary,
      lines: (m.content || []).slice(0, 3).map((c, i) => ({ label: (i + 1) + '. ' + (c.text || '').slice(0, 14), value: '' })),
      footer: '心智探索局 · 方法卡片',
    }, (p) => { this._shareImage = p })
  },
  onShareAppMessage() {
    const m = this.data.method
    if (!m) return {}
    return {
      title: '推荐一个方法：' + m.name,
      path: '/pages/methods/detail?id=' + this._id,
      imageUrl: this._shareImage || '',
    }
  },
  saveCard() {
    const m = this.data.method
    if (!m) return
    wx.showLoading({ title: '生成中' })
    genCard(this, {
      color: m.color,
      icon: m.icon,
      title: m.name,
      subtitle: m.summary,
      lines: (m.content || []).slice(0, 3).map((c, i) => ({ label: (i + 1) + '. ' + (c.text || '').slice(0, 14), value: '' })),
      footer: '心智探索局 · 方法卡片',
    }, (p) => {
      wx.hideLoading()
      saveToAlbum(p)
    })
  },
})
