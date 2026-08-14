const { getModule } = require('../../utils/registry')

Page({
  data: {
    meta: {},
    primaryValue: '',
    primaryLabel: '',
    primaryColor: '#2563eb',
    levelText: '',
    levelColor: '',
    descText: '',
    groups: [],
    dims: [],
    subtests: [],
    interpretations: [],
    showGroups: false,
    showBipolar: false,
    showDims: false,
    showSubtests: false,
  },

  onLoad(query) {
    const app = getApp()
    const saved = app.globalData.lastResult
    const id = query.id || (saved && saved.id)
    if (!id || !saved) {
      wx.showToast({ title: '暂无结果', icon: 'none' })
      return
    }
    const mod = getModule(id)
    if (!mod) return
    const questions = mod.getQuestions()
    const r = mod.computeResult(saved.answers, questions)
    const layout = mod.resultLayout || {}

    const primaryField = layout.primaryField || 'score'
    const primaryValue = r[primaryField]
    const levelColor = r.levelColor || mod.color
    const descText = r.description || (r.trait && String(r.trait) !== String(primaryValue) ? r.trait : '')
    const levelText = r.level || '已完成'

    const hasBuildGroupList = typeof mod.buildGroupList === 'function'
    const groups = hasBuildGroupList ? safeCall(() => mod.buildGroupList(r, layout)) : []
    const subtests = typeof mod.buildSubtestList === 'function' ? safeCall(() => mod.buildSubtestList(r)) : []

    let dims = []
    let showBipolar = false
    if (typeof mod.buildDimensionList === 'function') {
      dims = safeCall(() => mod.buildDimensionList(r)) || []
      showBipolar = !!(dims && dims[0] && dims[0].leftPercent !== undefined)
    } else if (r.dimensions) {
      dims = Object.keys(r.dimensions).map((k) => {
        const d = r.dimensions[k]
        return { key: k, name: d.name || k, percent: d.percent, text: d.text, level: d.level }
      })
    }

    const interpretations =
      typeof mod.buildInterpretations === 'function'
        ? safeCall(() => mod.buildInterpretations(r, groups, dims)) || []
        : []

    const pv = primaryValue == null ? '' : String(primaryValue)
    const primarySize = pv.length <= 4 ? 'big' : pv.length <= 10 ? 'mid' : 'small'

    this.setData({
      meta: { id: mod.id, name: mod.name, icon: mod.icon, color: mod.color },
      primaryValue: pv,
      primarySize,
      primaryLabel: layout.primaryLabel || '测评结果',
      primaryColor: mod.color,
      levelText,
      levelColor,
      descText,
      groups: groups || [],
      dims: dims || [],
      subtests: subtests || [],
      interpretations: interpretations || [],
      showGroups: !!(groups && groups.length),
      showBipolar,
      showDims: !!(dims && dims.length) && !showBipolar && !hasBuildGroupList,
      showSubtests: !!(subtests && subtests.length),
    })
    wx.setNavigationBarTitle({ title: mod.name + ' · 结果' })
  },

  onReady() {
    this.dpr = (wx.getWindowInfo ? wx.getWindowInfo().pixelRatio : wx.getSystemInfoSync().pixelRatio) || 2
  },

  saveCard() {
    wx.showLoading({ title: '生成中' })
    const dpr = this.dpr || 2
    wx.createSelectorQuery()
      .in(this)
      .select('#cardCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) {
          wx.hideLoading()
          wx.showToast({ title: '生成失败', icon: 'none' })
          return
        }
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const W = res[0].width
        const H = res[0].height
        canvas.width = W * dpr
        canvas.height = H * dpr
        ctx.scale(dpr, dpr)
        ctx.fillStyle = '#1e293b'
        ctx.fillRect(0, 0, W, H)
        ctx.textAlign = 'center'
        ctx.fillStyle = '#fff'
        ctx.font = '28px sans-serif'
        ctx.fillText('心智测评中心', W / 2, 70)
        ctx.fillStyle = this.data.meta.color
        ctx.font = '34px sans-serif'
        ctx.fillText(this.data.meta.name, W / 2, 130)
        ctx.fillStyle = '#fff'
        ctx.font = '72px sans-serif'
        ctx.fillText(this.data.primaryValue, W / 2, 250)
        ctx.fillStyle = 'rgba(255,255,255,0.8)'
        ctx.font = '26px sans-serif'
        ctx.fillText(this.data.primaryLabel, W / 2, 300)
        ctx.fillStyle = this.data.levelColor
        ctx.fillRect(W / 2 - 90, 330, 180, 46)
        ctx.fillStyle = '#fff'
        ctx.font = '26px sans-serif'
        ctx.fillText(this.data.levelText, W / 2, 362)
        const d = new Date()
        const date = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate()
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = '22px sans-serif'
        ctx.fillText(date, W / 2, H - 40)
        wx.canvasToTempFilePath({
          canvas,
          success: (r) => {
            wx.hideLoading()
            wx.saveImageToPhotosAlbum({
              filePath: r.tempFilePath,
              success: () => wx.showToast({ title: '已保存到相册' }),
              fail: () => wx.showToast({ title: '保存失败', icon: 'none' }),
            })
          },
          fail: () => {
            wx.hideLoading()
            wx.showToast({ title: '生成失败', icon: 'none' })
          },
        })
      })
  },

  goHome() {
    wx.reLaunch({ url: '/pages/index/index' })
  },
  retest() {
    wx.redirectTo({ url: `/pages/test/test?id=${this.data.meta.id}` })
  },

  onShareAppMessage() {
    return {
      title: this.data.meta.name + '测评结果 - 心智测评中心',
      path: '/pages/index/index',
    }
  },
})

function safeCall(fn) {
  try {
    return fn()
  } catch (e) {
    console.warn('[result] build failed:', e)
    return []
  }
}
