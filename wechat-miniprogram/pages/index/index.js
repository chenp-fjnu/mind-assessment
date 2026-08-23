const { getMetaList, TYPE_LABELS } = require('../../utils/registry')
const { hexToRgba } = require('../../utils/color')
const methodsData = require('../../utils/methods-data')
const gameReg = require('../../utils/game-registry')
const trainStore = require('../../utils/train-store')

function fmtTime(ts) {
  const d = new Date(ts)
  const p = (n) => (n < 10 ? '0' + n : '' + n)
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes())
}

const FEATURED_ASSESS = ['big5', 'phq9', 'pss', 'mbti', 'sds', 'gad7']
const FEATURED_METHODS = ['smart', 'grow', 'woop', 'abc', 'threegood', 'fogg']
const FEATURED_GAMES = ['schulte', 'n-back', 'stroop', 'hanoi', 'box-breathing']

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

function buildMethods() {
  const all = methodsData.METHODS.map((m) => Object.assign({}, m, { tint: hexToRgba(m.color, 0.12) }))
  const byId = {}
  all.forEach((m) => (byId[m.id] = m))
  const featured = FEATURED_METHODS.filter((id) => byId[id]).map((id) => byId[id]).concat(all.filter((m) => FEATURED_METHODS.indexOf(m.id) < 0)).slice(0, 4)
  return { all, featuredMethods: featured }
}

function buildGames() {
  const all = gameReg.getMetaList()
  const byId = {}
  all.forEach((g) => (byId[g.id] = g))
  const featured = FEATURED_GAMES.filter((id) => byId[id]).map((id) => {
    const g = byId[id]
    return {
      id: g.id,
      name: g.name,
      icon: g.icon,
      color: g.color,
      tint: hexToRgba(g.color, 0.12),
      dimLabel: g.dimLabel,
    }
  }).slice(0, 4)
  return { all, featuredGames: featured }
}

Page({
  data: {
    moduleCount: 0,
    methodCount: 0,
    practiceCount: 0,
    gameCount: 0,
    dimCount: 0,
    featuredAssess: [],
    featuredMethods: [],
    featuredGames: [],
    resumes: [],
  },
  onLoad() {
    const mod = buildModules()
    const met = buildMethods()
    const gam = buildGames()
    this.setData({
      moduleCount: mod.all.length,
      methodCount: met.all.length,
      practiceCount: met.all.filter((m) => m.interactive).length,
      gameCount: gam.all.length,
      dimCount: Object.keys(gameReg.DIM_LABELS).length,
      featuredAssess: mod.featuredAssess,
      featuredMethods: met.featuredMethods,
      featuredGames: gam.featuredGames,
    })
  },
  onShow() {
    this.refreshResume()
  },
  refreshResume() {
    const resumes = []
    // 测评：取最近一条测评记录
    const hist = wx.getStorageSync('ma_history') || []
    if (hist.length) {
      const last = hist.slice().sort((a, b) => b.time - a.time)[0]
      resumes.push({
        type: 'assess',
        id: last.id,
        level: '',
        icon: last.icon,
        title: '继续测评：' + last.name,
        sub: '上次测评于 ' + fmtTime(last.time),
        color: '#7c3aed',
      })
    }
    // 方法：取最近一次练习
    const stored = wx.getStorageSync('ma_practices') || {}
    let lastMethod = null
    Object.keys(stored).forEach((mid) => {
      ;(stored[mid] || []).forEach((entry) => {
        if (!lastMethod || entry.time > lastMethod.time) lastMethod = { mid, time: entry.time }
      })
    })
    if (lastMethod) {
      const m = methodsData.getMethod(lastMethod.mid)
      if (m) {
        resumes.push({
          type: 'method',
          id: m.id,
          level: '',
          icon: m.icon,
          title: '继续方法：' + m.name,
          sub: '上次练习于 ' + fmtTime(lastMethod.time),
          color: '#10b981',
        })
      }
    }
    // 训练：取最近一次（游戏 + 难度）
    const lastTrain = trainStore.getLast()
    if (lastTrain) {
      resumes.push({
        type: 'train',
        id: lastTrain.id,
        level: lastTrain.level,
        icon: lastTrain.icon,
        title: '继续训练：' + lastTrain.name,
        sub: lastTrain.levelLabel + ' · 上次训练于 ' + fmtTime(lastTrain.time),
        color: lastTrain.color || '#3b82f6',
      })
    }
    this.setData({ resumes })
  },
  goAssess() { wx.switchTab({ url: '/pages/assess/assess' }) },
  goMethods() { wx.switchTab({ url: '/pages/methods/methods' }) },
  goTrain() { wx.switchTab({ url: '/pages/train/train' }) },
  goDetail(e) { wx.navigateTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` }) },
  goMethodDetail(e) { wx.navigateTo({ url: `/pages/methods/detail?id=${e.currentTarget.dataset.id}` }) },
  goGame(e) { wx.navigateTo({ url: `/pages/train/game?gameId=${e.currentTarget.dataset.id}` }) },
  goResumeItem(e) {
    const item = e.currentTarget.dataset.item
    if (!item) return
    if (item.type === 'assess') {
      wx.navigateTo({ url: `/pages/result/result?id=${item.id}` })
    } else if (item.type === 'method') {
      wx.navigateTo({ url: `/pages/methods/detail?id=${item.id}` })
    } else if (item.type === 'train') {
      wx.navigateTo({ url: `/pages/train/game?gameId=${item.id}&level=${item.level}` })
    }
  },
  goHistory() { wx.navigateTo({ url: '/pages/history/history' }) },
  goAbout() { wx.navigateTo({ url: '/pages/about/about' }) },
})
