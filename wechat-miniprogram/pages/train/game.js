const { getGame } = require('../../utils/game-registry')
const { hexToRgba } = require('../../utils/color')
const trainStore = require('../../utils/train-store')

Page({
  data: {
    gameId: '',
    meta: null,
    levels: [],
    level: 0,
    levelLabel: '',
    tint: '',
    bestText: '暂无记录',
    finished: false,
    result: null,
    resultChips: [],
    trendText: '',
  },
  onLoad(query) {
    const id = query.gameId
    const g = getGame(id)
    if (!g) {
      wx.showToast({ title: '游戏不存在', icon: 'none' })
      return
    }
    const levels = g.levels
    const best = trainStore.best(id, g.metric.better)
    this.setData({
      gameId: id,
      meta: {
        name: g.name,
        desc: g.desc,
        icon: g.icon,
        color: g.color,
        dimLabel: g.dimLabel,
        metric: g.metric,
        reference: g.reference,
      },
      levels,
      level: levels[0].value,
      levelLabel: levels[0].label,
      tint: hexToRgba(g.color, 0.12),
      bestText: best == null ? '暂无记录' : '最佳 ' + best + (g.metric.unit || ''),
    })
    this.refreshTrend(id, g)
  },
  refreshTrend(id, g) {
    const t = trainStore.trend(id)
    let text = ''
    if (t && t.showTrend && t.trendValues.length >= 2) {
      text =
        '近期 ' + t.trendValues[0] + ' → ' + t.trendValues[t.trendValues.length - 1] + (g.metric.unit || '')
    }
    this.setData({ trendText: text })
  },
  onSelectLevel(e) {
    const value = e.currentTarget.dataset.value
    const label = e.currentTarget.dataset.label
    this.setData({ level: value, levelLabel: label, result: null, finished: false })
  },
  onFinish(e) {
    const g = getGame(this.data.gameId)
    const r = e.detail
    const metricVal = r[g.metric.key]
    trainStore.save(this.data.gameId, metricVal, {
      time: r.time,
      errors: r.errors,
      score: r.score,
      correct: r.correct,
      total: r.total,
      rounds: r.rounds,
      moves: r.moves,
      duration: r.duration,
    })
    const best = trainStore.best(this.data.gameId, g.metric.better)
    this.setData({
      finished: true,
      result: r,
      bestText: '最佳 ' + best + (g.metric.unit || ''),
      resultChips: this.buildChips(r, g),
    })
    this.refreshTrend(this.data.gameId, g)
  },
  buildChips(r, g) {
    const chips = []
    const m = g.metric
    chips.push({ label: m.label, value: r[m.key] + (m.unit || '') })
    if (r.time != null) chips.push({ label: '用时', value: Math.round(r.time * 10) / 10 + 's' })
    if (r.duration != null) chips.push({ label: '时长', value: Math.round(r.duration * 10) / 10 + 's' })
    if (r.errors != null) chips.push({ label: '错误', value: r.errors })
    if (r.moves != null) chips.push({ label: '步数', value: r.moves })
    if (r.correct != null) chips.push({ label: '正确', value: r.correct + '/' + (r.total || '') })
    if (r.rounds != null) chips.push({ label: '轮数', value: r.rounds })
    if (r.score != null) chips.push({ label: '得分', value: r.score })
    return chips
  },
  replay() {
    this.setData({ result: null, finished: false })
  },
  goBack() {
    wx.navigateBack()
  },
})
