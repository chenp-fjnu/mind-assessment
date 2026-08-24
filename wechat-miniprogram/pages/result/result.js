const { getModule } = require('../../utils/registry')
const { computeTrend } = require('../../utils/trend')
const { getResultView } = require('../../utils/result-view')
const { readableTextColor } = require('../../utils/color')
const { renderTrend, renderCard, renderFullPageCard } = require('../../utils/canvas')
const { withPrivacy } = require('../../utils/privacy')
const methodsData = require('../../utils/methods-data')
const { useTheme } = require('../../utils/theme-store')
const { pad2 } = require('../../utils/format')
const { getDpr } = require('../../utils/device')

// 与 pages/test/test.js 保持一致的数据结构版本
const SCHEMA_VERSION = 1

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
    retakeHint: '',
    showGroups: false,
    showBipolar: false,
    showDims: false,
    showSubtests: false,
  },

  onLoad(query) {
    useTheme(this)
    const app = getApp()
    let saved = app.globalData.lastResult
    const id = query.id || (saved && saved.id)
    if (!id) {
      this.setData({ invalid: true })
      return
    }
    const mod = getModule(id)
    if (!mod) {
      this.setData({ invalid: true })
      return
    }
    // 全量历史只读一次，后续复用（避免多次同步 IO）
    const allHist = wx.getStorageSync('ma_history') || []
    // 冷启动 / 直接进入兜底：从最近历史恢复答案
    // 优先取「题量一致」的最近一条，避免模块改题数后旧记录答案长度不匹配导致恢复失败
    let schemaNotice = false
    if (!saved || !saved.answers) {
      const hist = allHist
        .filter((h) => h.id === id)
        .sort((a, b) => b.time - a.time)
      const qn = mod.getQuestions().length
      const hit = hist.find((h) => h.answers && h.answers.length === qn)
      if (hit) {
        saved = { id, answers: hit.answers, totalTime: hit.totalTime || 0 }
        if (hit.schemaVersion != null && hit.schemaVersion !== SCHEMA_VERSION) {
          schemaNotice = true
        }
      }
    }
    if (!saved || !saved.answers) {
      this.setData({ invalid: true })
      return
    }

    // 测评时间 / 距上次重测间隔
    const myHist = allHist
      .filter((h) => h.id === id)
      .sort((a, b) => b.time - a.time)
    let testedTime = ''
    let retestGap = ''
    if (myHist.length) {
      const t = new Date(myHist[0].time)
      testedTime =
        t.getFullYear() + '-' + pad2(t.getMonth() + 1) + '-' + pad2(t.getDate()) +
        ' ' + pad2(t.getHours()) + ':' + pad2(t.getMinutes())
      if (myHist.length >= 2) {
        const gap = Math.round((myHist[0].time - myHist[1].time) / 86400000)
        retestGap = gap <= 0 ? '今天' : gap + ' 天前'
      }
    }
    // 距上次重测间隔（retakeHint）：与本次记录时间不同的同测评表最近一条历史比较
    let retakeHint = ''
    try {
      const selfTimeSrc = (app.globalData.lastResult && app.globalData.lastResult.time) || (myHist[0] && myHist[0].time) || Date.now()
      const selfTs = new Date(selfTimeSrc).getTime()
      if (!isNaN(selfTs)) {
        const prev = myHist
          .filter((h) => h.id === id && h.time !== selfTimeSrc)
          .sort((a, b) => b.time - a.time)
        if (prev.length) {
          const prevTs = new Date(prev[0].time).getTime()
          if (!isNaN(prevTs)) {
            const days = Math.round((selfTs - prevTs) / 86400000)
            retakeHint = days <= 0 ? '距上次测评不到 1 天' : '距上次测评 ' + days + ' 天'
          }
        } else {
          retakeHint = '首次测评'
        }
      }
    } catch (e) {
      retakeHint = ''
    }

    this.dpr = getDpr()
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
      wechsler: '本题为原创分测验图形题，按正确率换算近似测评表分，非标准化常模，仅供能力练习参考。',
    }
    const noteText = NOTE_MAP[mod.id] || ''

    const primaryValue = r[primaryField]
    const levelColor = r.levelColor || mod.color
    const descText = r.description || (r.trait && String(r.trait) !== String(primaryValue) ? r.trait : '')
    const levelText = r.level && String(r.level) !== String(primaryValue) ? r.level : '已完成'

    let view
    let viewError = false
    try {
      view = getResultView(mod, r, layout)
    } catch (e) {
      console.warn('[result] getResultView failed:', e)
      viewError = true
      view = { groups: [], dims: [], subtests: [], interpretations: [], showBipolar: false }
    }
    const groups = view.groups
    const subtests = view.subtests
    const dims = view.dims
    const showBipolar = view.showBipolar
    const interpretations = view.interpretations

    // 同一测评表的历史趋势（计算逻辑抽离至 utils/trend.js，便于单测）
    const t = computeTrend(allHist, id)
    const showTrend = t.showTrend
    const trendValues = t.trendValues
    const trendDelta = t.trendDelta
    const catList = t.catList
    const trendDates = t.trendDates
    const firstValue = t.firstValue
    const lastValue = t.lastValue
    const firstSummary = t.firstSummary
    const lastSummary = t.lastSummary
    const rangeDelta = firstValue != null && lastValue != null ? lastValue - firstValue : 0

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
      viewError,
      showTrend,
      trendValues,
      trendDelta,
      rangeDelta,
      firstValue,
      lastValue,
      catList,
      firstSummary,
      lastSummary,
      trendDates,
      testedTime,
      retestGap,
      retakeHint,
      timeText,
      noteText,
      recommend: methodsData.recommendFor(mod.type),
    }, () => {
      if (this.data.showTrend) this.drawTrend()
      this.drawCardToTemp((path) => {
        if (path) this._shareImage = path
      })
    })
    if (schemaNotice) {
      wx.showToast({ title: '量表已更新，历史结果仅供参考', icon: 'none' })
    }
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
    this.dpr = getDpr()
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

  drawFullPageCardToTemp(done) {
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
        // 计算所需高度：基础高度 + 各区块估算高度
        const baseH = 600
        const groupH = (this.data.groups && this.data.groups.length ? Math.min(this.data.groups.length, 12) * 66 : 0)
        const bipolarH = (this.data.dims && this.data.dims.length && this.data.showBipolar ? Math.min(this.data.dims.length, 8) * 90 : 0)
        const dimsH = (this.data.dims && this.data.dims.length && this.data.showDims ? Math.min(this.data.dims.length, 12) * 80 : 0)
        const subtestH = (this.data.subtests && this.data.subtests.length ? Math.min(this.data.subtests.length, 15) * 66 : 0)
        const interpH = (this.data.interpretations && this.data.interpretations.length ? Math.min(this.data.interpretations.length, 6) * 120 : 0)
        const trendH = (this.data.showTrend ? 280 : (this.data.catList && this.data.catList.length ? Math.min(this.data.catList.length, 10) * 66 : 0))
        const recommendH = (this.data.recommend && this.data.recommend.length ? Math.min(this.data.recommend.length, 5) * 80 : 0)
        const noteH = (this.data.noteText ? 80 : 0)
        const descH = (this.data.descText ? 80 : 0)
        const metaH = 100
        const disclaimerH = 100
        const brandH = 60
        const estimatedH = baseH + groupH + bipolarH + dimsH + subtestH + interpH + trendH + recommendH + noteH + descH + metaH + disclaimerH + brandH
        const H = Math.min(estimatedH, 5000)
        renderFullPageCard(canvas, ctx, W, H, {
          meta: this.data.meta,
          primaryValue: this.data.primaryValue,
          primaryLabel: this.data.primaryLabel,
          levelText: this.data.levelText,
          levelColor: this.data.levelColor,
          levelColorText: this.data.levelColorText,
          descText: this.data.descText,
          testedTime: this.data.testedTime,
          retestGap: this.data.retestGap,
          timeText: this.data.timeText,
          groups: this.data.groups,
          showGroups: this.data.showGroups,
          showBipolar: this.data.showBipolar,
          showDims: this.data.showDims,
          showSubtests: this.data.showSubtests,
          dims: this.data.dims,
          subtests: this.data.subtests,
          interpretations: this.data.interpretations,
          showTrend: this.data.showTrend,
          trendValues: this.data.trendValues,
          trendDelta: this.data.trendDelta,
          trendDates: this.data.trendDates,
          rangeDelta: this.data.rangeDelta,
          firstValue: this.data.firstValue,
          lastValue: this.data.lastValue,
          firstSummary: this.data.firstSummary,
          lastSummary: this.data.lastSummary,
          catList: this.data.catList,
          recommend: this.data.recommend,
          noteText: this.data.noteText,
          retakeHint: this.data.retakeHint,
        }, done)
      })
  },

  saveCard() {
    withPrivacy(() => {
      wx.showLoading({ title: '生成完整结果图中' })
      this.drawFullPageCardToTemp((path) => {
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
  onShareTimeline() {
    return {
      title: this.data.meta.name + '测评结果 - 心智探索局',
      imageUrl: this._shareImage || '',
    }
  },
})
