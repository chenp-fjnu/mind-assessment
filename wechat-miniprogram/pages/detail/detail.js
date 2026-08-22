const { getModule, TYPE_LABELS } = require('../../utils/registry')
const { readableTextColor } = require('../../utils/color')
const { genCard, saveToAlbum } = require('../../utils/share')

Page({
  data: {
    id: '',
    meta: {},
    invalid: false,
    resume: null,
    history: { count: 0 },
  },
  onLoad(query) {
    const mod = getModule(query.id)
    if (!mod) {
      this.setData({ invalid: true })
      return
    }
    this.setData({
      id: mod.id,
      meta: {
        icon: mod.icon,
        name: mod.name,
        shortName: mod.shortName,
        desc: mod.desc,
        duration: mod.duration,
        questionCount: mod.questionCount,
        color: mod.color,
        colorText: readableTextColor(mod.color),
        paid: mod.paid,
        price: mod.price,
        tags: mod.tag || [],
        type: mod.type,
      },
    })
    wx.setNavigationBarTitle({ title: mod.name })
    this.loadResume(mod)
    this.loadHistory(mod)
  },
  loadResume(mod) {
    const prog = wx.getStorageSync('ma_progress_' + mod.id)
    if (prog && prog.answers && prog.answers.some((a) => a !== null)) {
      const answered = prog.answers.filter((a) => a !== null).length
      this.setData({
        resume: {
          percent: Math.round((answered / mod.questionCount) * 100),
          answered,
          total: mod.questionCount,
        },
      })
    }
  },
  loadHistory(mod) {
    const all = wx.getStorageSync('ma_history') || []
    const mine = all.filter((h) => h.id === mod.id)
    if (!mine.length) return
    const info = { count: mine.length, last: { summary: mine[0].summary, level: mine[0].level } }
    const nums = mine.map((h) => parseFloat(h.summary)).filter((n) => !isNaN(n))
    if (nums.length >= 2) info.best = { summary: String(Math.max.apply(null, nums)) }
    this.setData({ history: info })
  },
  start() {
    wx.navigateTo({ url: `/pages/test/test?id=${this.data.id}` })
  },
  resumeTest() {
    wx.navigateTo({ url: `/pages/test/test?id=${this.data.id}` })
  },
  goHome() {
    wx.reLaunch({ url: '/pages/index/index' })
  },
  onReady() {
    const m = this.data.meta
    if (!m || !m.name) return
    genCard(this, {
      color: m.color,
      icon: m.icon,
      title: m.name,
      subtitle: m.desc,
      lines: [
        { label: '题数', value: m.questionCount + ' 题' },
        { label: '时长', value: '约 ' + m.duration + ' 分钟' },
        { label: '维度', value: TYPE_LABELS[m.type] || '' },
      ],
      footer: '心智探索局 · 测评卡片',
    }, (p) => { this._shareImage = p })
  },
  onShareAppMessage() {
    return {
      title: this.data.meta.name + ' - 心智探索局',
      path: '/pages/detail/detail?id=' + this.data.id,
      imageUrl: this._shareImage || '',
    }
  },
  saveCard() {
    const m = this.data.meta
    if (!m || !m.name) return
    wx.showLoading({ title: '生成中' })
    genCard(this, {
      color: m.color,
      icon: m.icon,
      title: m.name,
      subtitle: m.desc,
      lines: [
        { label: '题数', value: m.questionCount + ' 题' },
        { label: '时长', value: '约 ' + m.duration + ' 分钟' },
        { label: '维度', value: TYPE_LABELS[m.type] || '' },
      ],
      footer: '心智探索局 · 测评卡片',
    }, (p) => {
      wx.hideLoading()
      saveToAlbum(p)
    })
  },
})
