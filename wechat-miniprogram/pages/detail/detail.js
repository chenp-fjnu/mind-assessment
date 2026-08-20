const { getModule } = require('../../utils/registry')
const { readableTextColor } = require('../../utils/color')

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

  onShareAppMessage() {
    return {
      title: this.data.meta.name + ' - 心智探索局',
      path: '/pages/detail/detail?id=' + this.data.id,
    }
  },
})
