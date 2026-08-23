const { getMetaList, TYPE_LABELS } = require('../../utils/registry')
const { hexToRgba } = require('../../utils/color')

function buildModuleList() {
  return getMetaList().map((m) => ({
    id: m.id,
    type: m.type,
    icon: m.icon,
    name: m.name,
    shortName: m.shortName,
    desc: m.desc,
    duration: m.duration,
    questionCount: m.questionCount,
    color: m.color,
    tint: hexToRgba(m.color, 0.12),
    keywords: (m.name + ' ' + m.desc + ' ' + (m.tag || []).join(' ') + ' ' + (TYPE_LABELS[m.type] || '')).toLowerCase(),
  }))
}

function buildGroups(list) {
  const map = {}
  list.forEach((m) => {
    if (!map[m.type]) map[m.type] = []
    map[m.type].push(m)
  })
  return Object.keys(map).map((type) => ({
    type,
    label: TYPE_LABELS[type] || type,
    list: map[type],
  }))
}

Page({
  data: {
    groups: [],
    types: [],
    allModules: [],
    keyword: '',
    activeType: '',
    moduleCount: 0,
  },
  onLoad(query) {
    const allModules = buildModuleList()
    const types = Object.keys(TYPE_LABELS)
      .filter((t) => allModules.some((m) => m.type === t))
      .map((t) => ({ type: t, label: TYPE_LABELS[t] }))
    const kw = (query && query.keyword) || ''
    this.setData({
      allModules,
      types,
      groups: buildGroups(allModules),
      moduleCount: allModules.length,
      keyword: kw,
    }, () => { if (kw) this.applyFilter() })
  },
  applyFilter() {
    const { allModules, keyword, activeType } = this.data
    const kw = (keyword || '').trim().toLowerCase()
    const list = allModules.filter((m) => {
      if (activeType && m.type !== activeType) return false
      if (kw && m.keywords.indexOf(kw) === -1) return false
      return true
    })
    this.setData({ groups: buildGroups(list) })
  },
  onSearch(e) {
    this.setData({ keyword: e.detail.value }, () => this.applyFilter())
  },
  clearSearch() {
    this.setData({ keyword: '' }, () => this.applyFilter())
  },
  onType(e) {
    this.setData({ activeType: e.currentTarget.dataset.type }, () => this.applyFilter())
  },
  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },
})
