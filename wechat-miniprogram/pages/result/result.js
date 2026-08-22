const { getModule } = require('../../utils/registry')
const { computeTrend } = require('../../utils/trend')
const { buildModuleView } = require('../../utils/result-view')
const { readableTextColor } = require('../../utils/color')
const { renderTrend, renderCard } = require('../../utils/canvas')
const { withPrivacy } = require('../../utils/privacy')
const methodsData = require('../../utils/methods-data')

Page({
  data: {
    meta: {},
    invalid: false,
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
    testedTime: '',
    retestGap: '',
    showGroups: false,
    showBipolar: false,
    showDims: false,
    showSubtests: false,
  },

  onLoad(query) {
    const app = getApp()
    let saved = app.globalData.lastResult
    let id = query.id || (saved && saved.id)
    if (!id) {
      this.setData({ invalid: true })
      return
    }
    const mod = getModule(id)
    if (!mod) {
      this.setData({ invalid: true })
      return
    }
    // 冷启动 / 直接进入兜底：从最近历史恢复答案
    if (!saved || !saved.answers) {
      const hist = (wx.getStorageSync('ma_history') || [])
        .filter((h) => h.id === id)
        .sort((a, b) => b.time - a.time)
      const qn = mod.getQuestions().length
      if (hist.length && hist[0].answers && hist[0].answers.length === qn) {
        saved = { id, answers: hist[0].answers, totalTime: hist[0].totalTime || 0 }
      }
    }
    if (!saved || !saved.answers) {
      this.setData({ invalid: true })
      return
    }

    // 测评时间 / 距上次重测间隔
    const p2 = (n) => (n < 10 ? '0' + n : '' + n)
    const myHist = (wx.getStorageSync('ma_history') || [])
      .filter((h) => h.id === id)
      .sort((a, b) => b.time - a.time)
    let testedTime = ''
    let retestGap = ''
    if (myHist.length) {
      const t = new Date(myHist[0].time)
      testedTime =
        t.getFullYear() + '-' + p2(t.getMonth() + 1) + '-' + p2(t.getDate()) +
        ' ' + p2(t.getHours()) + ':' + p2(t.getMinutes())
      if (myHist.length >= 2) {
        const gap = Math.round((myHist[0].time - myHist[1].time) / 86400000)
        retestGap = gap <= 0 ? '今天' : gap + ' 天前'
      }
    }

    this.dpr = (wx.getWindowInfo ? wx.getWindowInfo().pixelRatio : wx.getSystemInfoSync().pixelRatio) || 2
    const questions = mod.getQuestions()
    const layout = mod.resultLayout || {}
    const primaryField = layout.primaryField || 'score'

    let r
    try {
      r = mod.computeResult(saved.answers, questions)
    } catch (e) {
      console.warn('[result] computeResult failed:', e)
      r = {}
    }
    if (r == null || r[primaryField] === undefined) {
      r = r || {}
      r[primaryField] = '—'
      r.description = r.description || '结果解析失败，请重新测评'
    }

    let timeText = ''
    const usedTime = (saved && typeof saved.totalTime === 'number' && saved.totalTime > 0)
      ? saved.totalTime
      : (r.totalTime || 0)
    if (usedTime > 0) {
      const sec = Math.round(usedTime / 1000)
      timeText = sec >= 60 ? Math.floor(sec / 60) + ' 分 ' + (sec % 60) + ' 秒' : sec + ' 秒'
    }
    const NOTE_MAP = {
      spm: '本题为原创图形推理练习，按正确率换算近似推理水平，非标准化智力常模，仅供能力练习参考。',
      wechsler: '本题为原创分测验图形题，按正确率换算近似量表分，非标准化常模，仅供能力练习参考。',
    }
    const noteText = NOTE_MAP[mod.id] || ''

    const primaryValue = r[primaryField]
    const levelColor = r.levelColor || mod.color
    const descText = r.description || (r.trait && String(r.trait) !== String(primaryValue) ? r.trait : '')
    const levelText = r.level && String(r.level) !== String(primaryValue) ? r.level : '已完成'

    const view = buildModuleView(mod, r, layout)
    const groups = view.groups
    const subtests = view.subtests
    const dims = view.dims
    const showBipolar = view.showBipolar
    const interpretations = view.interpretations

    // 同一量表的历史趋势（计算逻辑抽离至 utils/trend.js，便于单测）
    const t = computeTrend(wx.getStorageSync('ma_history'), id)
    const showTrend = t.showTrend
    const trendValues = t.trendValues
    const trendDelta = t.trendDelta
    const catList = t.catList
    const trendDates = t.trendDates

    const pv = primaryValue == null ? '' : String(primaryValue)
    const primarySize = pv.length <= 4 ? 'big' : pv.length <= 10 ? 'mid' : 'small'

    this.setData({
      meta: {
        id: mod.id,
        name: mod.name,
        icon: mod.icon,
        color: mod.color,
        colorText: readableTextColor(mod.color),
      },
      primaryValue: pv,
      primarySize,
      primaryLabel: layout.primaryLabel || '测评结果',
      primaryColor: mod.color,
      levelText,
      levelColor,
      levelColorText: readableTextColor(levelColor),
      descText,
      groups: groups || [],
      dims: dims || [],
      subtests: subtests || [],
      interpretations: interpretations || [],
      showGroups: !!(groups && groups.length),
      showBipolar,
      showDims: !!(dims && dims.length) && !showBipolar && !(groups && groups.length),
      showSubtests: !!(subtests && subtests.length),
      showTrend,
      trendValues,
      trendDelta,
      catList,
      trendDates,
      testedTime,
      retestGap,
      timeText,
      noteText,
      recommend: methodsData.recommendFor(mod.type),
    }, () => {
      if (this.data.showTrend) this.drawTrend()
      this.drawCardToTemp((path) => {
        if (path) this._shareImage = path
      })
    })
    wx.setNavigationBarTitle({ title: mod.name + ' · 结果' })
  },

  drawTrend() {
    if (!this.data.showTrend) return
    const dpr = this.dpr || 2
    wx.createSelectorQuery()
      .in(this)
      .select('#trendCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const W = res[0].width
        const H = res[0].height
        canvas.width = W * dpr
        canvas.height = H * dpr
        ctx.scale(dpr, dpr)
        renderTrend(ctx, W, H, {
          values: this.data.trendValues,
          color: this.data.meta.color,
          dates: this.data.trendDates,
        })
      })
  },

  onReady() {
    this.dpr = (wx.getWindowInfo ? wx.getWindowInfo().pixelRatio : wx.getSystemInfoSync().pixelRatio) || 2
    if (this.data.meta && this.data.meta.name) {
      this.drawCardToTemp((path) => {
        if (path) this._shareImage = path
      })
    }
  },

  drawCardToTemp(done) {
    wx.createSelectorQuery()
      .in(this)
      .select('#cardCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) {
          done(null)
          return
        }
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const W = res[0].width
        const H = res[0].height
        renderCard(canvas, ctx, W, H, {
          meta: this.data.meta,
          primaryValue: this.data.primaryValue,
          primaryLabel: this.data.primaryLabel,
          levelText: this.data.levelText,
          levelColor: this.data.levelColor,
          levelColorText: this.data.levelColorText,
          dims: this.data.dims,
        }, done)
      })
  },

  saveCard() {
    withPrivacy(() => {
      wx.showLoading({ title: '生成中' })
      this.drawCardToTemp((path) => {
        wx.hideLoading()
        if (!path) {
          wx.showToast({ title: '生成失败', icon: 'none' })
          return
        }
        wx.saveImageToPhotosAlbum({
          filePath: path,
          success: () => wx.showToast({ title: '已保存到相册' }),
          fail: (err) => {
            if (err && /auth|deny/i.test(err.errMsg || '')) {
              wx.showModal({
                title: '需要相册权限',
                content: '请在设置中允许保存到相册',
                confirmText: '去设置',
                success: (r) => {
                  if (r.confirm) wx.openSetting()
                },
              })
            } else {
              wx.showToast({ title: '保存失败', icon: 'none' })
            }
          },
        })
      })
    })
  },

  goHome() {
    wx.reLaunch({ url: '/pages/index/index' })
  },
  goMethod(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/methods/detail?id=${id}` })
  },
  retest() {
    wx.redirectTo({ url: `/pages/test/test?id=${this.data.meta.id}` })
  },

  onShareAppMessage() {
    return {
      title: this.data.meta.name + '测评结果 - 心智探索局',
      path: '/pages/index/index',
      imageUrl: this._shareImage || '',
    }
  },
})
