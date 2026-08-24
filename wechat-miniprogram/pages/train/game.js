const { getGame } = require('../../utils/game-registry')
const { hexToRgba } = require('../../utils/color')
const trainStore = require('../../utils/train-store')
const { useTheme } = require('../../utils/theme-store')

function fmtBest(value, unit) {
  if (value == null) return '暂无记录'
  return '最佳 ' + value + (unit || '')
}

Page({
  data: {
    gameId: '',
    family: '',
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
    fullscreen: false,
    // 棋盘可用宽度（rpx）；全屏时取满屏宽度，方格类游戏据此放大格子
    boardWidth: 705,
  },
  onLoad(query) {
    useTheme(this)
    const id = query.gameId
    const g = getGame(id)
    if (!g) {
      wx.showToast({ title: '游戏不存在', icon: 'none' })
      return
    }
    const levels = g.levels
    // 支持通过 query 预选难度（首页「继续训练」跳转）
    let level = levels[0].value
    let levelLabel = levels[0].label
    if (query.level != null) {
      const hit = levels.find((l) => String(l.value) === String(query.level))
      if (hit) {
        level = hit.value
        levelLabel = hit.label
      }
    }
    // 每个难度附带各自的最佳成绩，确保最佳按等级分开统计
    const levelsWithBest = levels.map((l) => ({
      ...l,
      bestText: fmtBest(trainStore.best(id, l.value, g.metric.better), g.metric.unit),
    }))
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
      levels: levelsWithBest,
      level,
      levelLabel,
      tint: hexToRgba(g.color, 0.12),
      bestText: fmtBest(trainStore.best(this.data.gameId, level, g.metric.better), g.metric.unit),
      family: g.family || (g.dim === 'relax' ? 'breath' : ''),
    })
    this.refreshTrend(id, g, level)
  },
  refreshTrend(id, g, level) {
    const t = trainStore.trend(id, level)
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
    const g = getGame(this.data.gameId)
    this.setData({
      level: value,
      levelLabel: label,
      result: null,
      finished: false,
      bestText: fmtBest(trainStore.best(this.data.gameId, value, g.metric.better), g.metric.unit),
    })
    this.refreshTrend(this.data.gameId, g, value)
  },
  onFinish(e) {
    const g = getGame(this.data.gameId)
    const r = e.detail
    const metricVal = r[g.metric.key]
    const level = this.data.level
    trainStore.save(this.data.gameId, level, metricVal, {
      levelLabel: this.data.levelLabel,
      time: r.time,
      errors: r.errors,
      score: r.score,
      correct: r.correct,
      total: r.total,
      rounds: r.rounds,
      moves: r.moves,
      duration: r.duration,
    })
    trainStore.setLast(this.data.gameId, level, {
      levelLabel: this.data.levelLabel,
      name: g.name,
      icon: g.icon,
      color: g.color,
      dimLabel: g.dimLabel,
    })
    const best = trainStore.best(this.data.gameId, level, g.metric.better)
    // 同步刷新当前难度芯片上的最佳文案
    const levels = this.data.levels.map((l) =>
      l.value === level ? { ...l, bestText: fmtBest(best, g.metric.unit) } : l
    )
    this.setData({
      finished: true,
      result: r,
      levels,
      bestText: fmtBest(best, g.metric.unit),
      resultChips: this.buildChips(r, g),
    })
    this.refreshTrend(this.data.gameId, g, level)
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
  toggleFullscreen() {
    const fs = !this.data.fullscreen
    // rpx 以 750 为屏幕宽度基准；全屏时棋盘占满整屏宽度，方格类游戏据此放大格子
    this.setData({ fullscreen: fs, boardWidth: fs ? 750 : 705 })
  },
  goBack() {
    wx.navigateBack({
      fail: () => wx.switchTab({ url: '/pages/train/train' })
    })
  },
  onShareAppMessage() {
    const { meta } = this.data
    if (!meta) return {}
    return {
      title: '来挑战『' + meta.name + '』，锻炼' + (meta.dimLabel || '脑力') + '！',
      path: '/pages/train/game?gameId=' + this.data.gameId,
    }
  },
  onShareTimeline() {
    const { meta } = this.data
    if (!meta) return {}
    return {
      title: '来挑战『' + meta.name + '』，锻炼' + (meta.dimLabel || '脑力') + '！',
    }
  },
})
