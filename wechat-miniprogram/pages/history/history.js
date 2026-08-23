const methodsData = require('../../utils/methods-data')
const { getGame } = require('../../utils/game-registry')
const trainStore = require('../../utils/train-store')
const { withPrivacy } = require('../../utils/privacy')

function fmt(ts) {
  const d = new Date(ts)
  const p = (n) => (n < 10 ? '0' + n : '' + n)
  return (
    d.getFullYear() +
    '-' +
    p(d.getMonth() + 1) +
    '-' +
    p(d.getDate()) +
    ' ' +
    p(d.getHours()) +
    ':' +
    p(d.getMinutes())
  )
}

function buildMethodRecords() {
  const stored = wx.getStorageSync('ma_practices') || {}
  const out = []
  Object.keys(stored).forEach((mid) => {
    const m = methodsData.getMethod(mid)
    if (!m) return
    ;(stored[mid] || []).forEach((entry) => {
      const schema = m.schema || []
      const fields = schema.map((f) => ({ label: f.label, value: (entry.data || {})[f.key] || '' }))
      out.push({
        mid,
        rid: entry.id,
        name: m.name,
        icon: m.icon,
        time: entry.time,
        timeText: fmt(entry.time),
        fields,
      })
    })
  })
  out.sort((a, b) => b.time - a.time)
  return out
}

function buildTrainRecords() {
  return trainStore.allRecords().map((r) => {
    const g = getGame(r.gameId)
    const meta = g || {}
    const levelLabel = r.levelLabel || (meta.levels || []).find((l) => String(l.value) === String(r.level)) || { label: r.level }
    const unit = (meta.metric && meta.metric.unit) || ''
    const label = (meta.metric && meta.metric.label) || '成绩'
    return {
      gameId: r.gameId,
      level: r.level,
      rid: r.rid,
      levelLabel: levelLabel.label || r.level,
      name: meta.name || r.gameId,
      icon: meta.icon || '🧠',
      color: meta.color || '#7c3aed',
      dimLabel: meta.dimLabel || '',
      metricLabel: label,
      value: r.summary + unit,
      time: r.time,
      timeText: fmt(r.time),
    }
  })
}

Page({
  data: {
    tab: 'assess',
    all: [],
    list: [],
    mList: [],
    tList: [],
    filters: [],
    active: '',
    kw: '',
  },
  onLoad(query) {
    if (query && ['assess', 'method', 'train'].indexOf(query.tab) >= 0) {
      this.setData({ tab: query.tab })
    }
  },
  onShow() {
    this.load()
  },
  load() {
    const hist = wx.getStorageSync('ma_history') || []
    const all = hist.map((h) => ({
      id: h.id,
      rid: h.rid,
      name: h.name,
      icon: h.icon,
      summary: h.summary || '',
      level: h.level || '',
      time: h.time,
      timeText: fmt(h.time),
      answers: h.answers,
    }))
    const map = {}
    all.forEach((h) => {
      if (!map[h.id]) map[h.id] = { id: h.id, name: h.name, icon: h.icon }
    })
    const filters = [{ id: '', name: '全部', icon: '🗂' }].concat(Object.keys(map).map((k) => map[k]))
    const mList = buildMethodRecords()
    const tList = buildTrainRecords()
    this._all = all
    this._mAll = mList
    this._tAll = tList
    this.setData({ all, filters, mList, tList })
    this.applyFilter()
  },
  applyFilter() {
    const kw = (this.data.kw || '').trim().toLowerCase()
    const active = this.data.active
    let list = active ? (this._all || []).filter((h) => h.id === active) : (this._all || []).slice()
    if (kw) list = list.filter((h) => (h.name || '').toLowerCase().indexOf(kw) !== -1)
    let mList = (this._mAll || []).slice()
    if (kw) mList = mList.filter((p) => (p.name || '').toLowerCase().indexOf(kw) !== -1)
    let tList = (this._tAll || []).slice()
    if (kw) tList = tList.filter((t) => (t.name || '').toLowerCase().indexOf(kw) !== -1)
    this.setData({ list, mList, tList })
  },
  onTab(e) {
    this.setData({ tab: e.currentTarget.dataset.tab })
  },
  onFilter(e) {
    const id = e.currentTarget.dataset.id
    this.setData({ active: id }, () => this.applyFilter())
  },
  onSearch(e) {
    this.setData({ kw: e.detail.value }, () => this.applyFilter())
  },
  clearSearch() {
    this.setData({ kw: '' }, () => this.applyFilter())
  },
  open(e) {
    const idx = e.currentTarget.dataset.idx
    const item = this.data.list[idx]
    if (!item) return
    getApp().globalData.lastResult = { id: item.id, answers: item.answers }
    wx.navigateTo({ url: '/pages/result/result?id=' + item.id })
  },
  openMethod(e) {
    const idx = e.currentTarget.dataset.idx
    const item = this.data.mList[idx]
    if (!item) return
    wx.navigateTo({ url: '/pages/methods/detail?id=' + item.mid })
  },
  openTrain(e) {
    const idx = e.currentTarget.dataset.idx
    const item = this.data.tList[idx]
    if (!item) return
    wx.navigateTo({ url: '/pages/train/game?gameId=' + item.gameId + '&level=' + item.level })
  },
  deleteOne(e) {
    const idx = e.currentTarget.dataset.idx
    const item = this.data.list[idx]
    if (!item) return
    wx.showModal({
      title: '删除记录',
      content: '确定删除「' + item.name + '」的该条记录吗？',
      success: (r) => {
        if (!r.confirm) return
        const hist = wx.getStorageSync('ma_history') || []
        const next = hist.filter((h) => {
          if (item.rid) return h.rid !== item.rid
          return h.time !== item.time // 兼容无 rid 的旧数据
        })
        wx.setStorageSync('ma_history', next)
        this.setData({ active: '' })
        this.load()
      },
    })
  },
  deleteMethodOne(e) {
    const idx = e.currentTarget.dataset.idx
    const item = this.data.mList[idx]
    if (!item) return
    wx.showModal({
      title: '删除记录',
      content: '确定删除「' + item.name + '」的这条练习吗？',
      success: (r) => {
        if (!r.confirm) return
        const stored = wx.getStorageSync('ma_practices') || {}
        const list = (stored[item.mid] || []).filter((x) => x.id !== item.rid)
        if (list.length) stored[item.mid] = list
        else delete stored[item.mid]
        wx.setStorageSync('ma_practices', stored)
        this.load()
      },
    })
  },
  deleteTrainOne(e) {
    const idx = e.currentTarget.dataset.idx
    const item = this.data.tList[idx]
    if (!item) return
    wx.showModal({
      title: '删除记录',
      content: '确定删除「' + item.name + ' · ' + item.levelLabel + '」的这条训练吗？',
      success: (r) => {
        if (!r.confirm) return
        trainStore.deleteRecord(item.gameId, item.level, item.rid)
        this.load()
      },
    })
  },
  clearAll() {
    const tab = this.data.tab
    const list = tab === 'method' ? this.data.mList : tab === 'train' ? this.data.tList : this.data.list
    if (!list.length) return
    wx.showModal({
      title: '清空全部记录',
      content:
        tab === 'method'
          ? '确定清空所有方法练习记录吗？此操作不可恢复。'
          : tab === 'train'
          ? '确定清空所有训练记录吗？各难度的成绩将分别清空，此操作不可恢复。'
          : '确定清空所有测评记录吗？此操作不可恢复。',
      success: (r) => {
        if (r.confirm) {
          if (tab === 'method') wx.removeStorageSync('ma_practices')
          else if (tab === 'train') {
            const info = (wx.getStorageInfoSync && wx.getStorageInfoSync()) || { keys: [] }
            ;(info.keys || [])
              .filter((k) => k.indexOf('ma_train_') === 0 && k !== 'ma_train_last')
              .forEach((k) => wx.removeStorageSync(k))
            wx.removeStorageSync('ma_train_last')
          } else wx.removeStorageSync('ma_history')
          this.load()
        }
      },
    })
  },
  exportAll() {
    const tab = this.data.tab
    let data
    if (tab === 'method') data = wx.getStorageSync('ma_practices') || {}
    else if (tab === 'train') {
      const info = (wx.getStorageInfoSync && wx.getStorageInfoSync()) || { keys: [] }
      data = {}
      ;(info.keys || [])
        .filter((k) => k.indexOf('ma_train_') === 0 && k !== 'ma_train_last')
        .forEach((k) => {
          data[k] = wx.getStorageSync(k) || []
        })
    } else data = wx.getStorageSync('ma_history') || []
    const empty = tab === 'assess' ? !data.length : !Object.keys(data).length && !data.length
    if (tab === 'train' && !Object.keys(data).length) {
      wx.showToast({ title: '暂无记录', icon: 'none' })
      return
    }
    if (tab !== 'train' && empty) {
      wx.showToast({ title: '暂无记录', icon: 'none' })
      return
    }
    withPrivacy(() => {
      wx.setClipboardData({
        data: JSON.stringify(data, null, 2),
        success: () => wx.showToast({ title: '已复制到剪贴板', icon: 'none' }),
      })
    })
  },
})
