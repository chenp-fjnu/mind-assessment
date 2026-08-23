const { getMetaList, TYPE_LABELS } = require('../../utils/registry')
const { hexToRgba } = require('../../utils/color')
const methodsData = require('../../utils/methods-data')

function fmtTime(ts) {
  const d = new Date(ts)
  const p = (n) => (n < 10 ? '0' + n : '' + n)
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes())
}

const FEATURED_ASSESS = ['big5', 'phq9', 'pss', 'mbti', 'sds', 'gad7']
const FEATURED_METHODS = ['smart', 'grow', 'woop', 'abc', 'threegood', 'fogg']

function buildModules() {
  const all = getMetaList().map((m) => ({
    id: m.id, type: m.type, typeLabel: TYPE_LABELS[m.type] || m.type, icon: m.icon, name: m.name, shortName: m.shortName,
    desc: m.desc, duration: m.duration, questionCount: m.questionCount,
    paid: m.paid, price: m.price, color: m.color, tint: hexToRgba(m.color, 0.12),
  }))
  const byId = {}
  all.forEach((m) => (byId[m.id] = m))
  const pick = (ids, pool, n) => ids.filter((id) => byId[id]).map((id) => byId[id]).concat(pool.filter((m) => ids.indexOf(m.id) < 0)).slice(0, n)
  return { all, featuredAssess: pick(FEATURED_ASSESS, all, 4) }
}

function buildTypeChips() {
  const chips = [{ key: '', label: '全部' }]
  Object.keys(TYPE_LABELS).forEach((k) => chips.push({ key: k, label: TYPE_LABELS[k] }))
  return chips
}

function filterList(allList, keyword, activeType) {
  const kw = (keyword || '').trim().toLowerCase()
  return allList.filter((m) => {
    if (activeType && m.type !== activeType) return false
    if (!kw) return true
    const hay = [m.name, m.shortName, m.desc]
      .concat(m.tag || [])
      .join(' ')
      .toLowerCase()
    return hay.indexOf(kw) >= 0
  })
}
function buildMethods() {
  const all = methodsData.METHODS.map((m) => Object.assign({}, m, { tint: hexToRgba(m.color, 0.12) }))
  const byId = {}
  all.forEach((m) => (byId[m.id] = m))
  const featured = FEATURED_METHODS.filter((id) => byId[id]).map((id) => byId[id]).concat(all.filter((m) => FEATURED_METHODS.indexOf(m.id) < 0)).slice(0, 4)
  return { all, featuredMethods: featured }
}

Page({
  data: {
    moduleCount: 0,
    methodCount: 0,
    practiceCount: 0,
    featuredAssess: [],
    featuredMethods: [],
    resume: null,
    keyword: '',
    allList: [],
    filteredList: [],
    typeChips: [],
    activeType: '',
  },
  onLoad() {
    const mod = buildModules()
    const met = buildMethods()
    this.setData({
      moduleCount: mod.all.length,
      methodCount: met.all.length,
      practiceCount: met.all.filter((m) => m.interactive).length,
      featuredAssess: mod.featuredAssess,
      featuredMethods: met.featuredMethods,
      allList: mod.all,
      typeChips: buildTypeChips(),
    })
    this.applyFilter()
  },
  onShow() {
    this.refreshResume()
  },
  refreshResume() {
    const hist = wx.getStorageSync('ma_history') || []
    if (!hist.length) {
      if (this.data.resume) this.setData({ resume: null })
      return
    }
    const last = hist.slice().sort((a, b) => b.time - a.time)[0]
    this.setData({
      resume: { id: last.id, name: last.name, icon: last.icon, timeText: fmtTime(last.time) },
    })
  },
  onSearch(e) {
    const kw = e.detail.value
    this.setData({ keyword: kw })
    this.applyFilter()
  },
  clearSearch() {
    this.setData({ keyword: '' })
    this.applyFilter()
  },
  onSelectType(e) {
    const key = e.currentTarget.dataset.key
    this.setData({ activeType: key })
    this.applyFilter()
  },
  applyFilter() {
    const { allList, keyword, activeType } = this.data
    this.setData({ filteredList: filterList(allList, keyword, activeType) })
  },
  goAssess() { wx.switchTab({ url: '/pages/assess/assess' }) },
  goMethods() { wx.switchTab({ url: '/pages/methods/methods' }) },
  goDetail(e) { wx.navigateTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` }) },
  goMethodDetail(e) { wx.navigateTo({ url: `/pages/methods/detail?id=${e.currentTarget.dataset.id}` }) },
  goResume() {
    if (!this.data.resume) return
    wx.navigateTo({ url: `/pages/result/result?id=${this.data.resume.id}` })
  },
  goHistory() { wx.navigateTo({ url: '/pages/history/history' }) },
  goAbout() { wx.navigateTo({ url: '/pages/about/about' }) },
})
