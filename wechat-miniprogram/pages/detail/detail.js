const { getModule, TYPE_LABELS, getMetaList } = require('../../utils/registry')
const { readableTextColor } = require('../../utils/color')
const { genCard, saveToAlbum } = require('../../utils/share')
const { useTheme } = require('../../utils/theme-store')
const relations = require('../../utils/relations')
const assessIntro = require('../../utils/assess-intro')

// 渐变映射
const GRADIENT_MAP = {
  assess: 'linear-gradient(135deg, #9f67f7 0%, #b87aff 100%)',
  method: 'linear-gradient(135deg, #7c7aff 0%, #a5b4fc 100%)',
  train: 'linear-gradient(135deg, #2dd4bf 0%, #5eead4 100%)',
}

Page({
  data: {
    id: '',
    meta: {},
    invalid: false,
    history: { count: 0 },
    about: [],
    relatedMethods: [],
    relatedGames: [],
  },
  onLoad(query) {
    useTheme(this)
    const mod = getModule(query.id)
    if (!mod) {
      this.setData({ invalid: true })
      return
    }
    const metaRef = getMetaList().find((m) => m.id === mod.id)
    const kind = mod.type
    const gradient = GRADIENT_MAP[kind] || GRADIENT_MAP.assess
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
        tags: mod.tag || [],
        type: mod.type,
        kind,
        gradient,
        reference: (metaRef && metaRef.reference) || '',
        scoring: (metaRef && metaRef.scoring) || '',
      },
    })
    wx.setNavigationBarTitle({ title: mod.name })
    this.loadHistory(mod)
    const links = relations.buildLinks(mod.id)
    this.setData({
      about: assessIntro[mod.id] || [],
      relatedMethods: links.methods,
      relatedGames: links.games,
    })
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
  goMethod(e) {
    wx.navigateTo({ url: `/pages/methods/detail?id=${e.currentTarget.dataset.id}` })
  },
  goGame(e) {
    wx.navigateTo({ url: `/pages/train/game?gameId=${e.currentTarget.dataset.id}` })
  },
  goHome() {
    wx.reLaunch({ url: '/pages/index/index' })
  },
  onReady() {
    const m = this.data.meta
    if (!m || !m.name) return
    genCard(this, {
      color: m.color,
      gradient: m.gradient,
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
  onShareTimeline() {
    return {
      title: this.data.meta.name + ' - 心智探索局',
      imageUrl: this._shareImage || '',
    }
  },
  saveCard() {
    const m = this.data.meta
    if (!m || !m.name) return
    wx.showLoading({ title: '生成中' })
    genCard(this, {
      color: m.color,
      gradient: m.gradient,
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
