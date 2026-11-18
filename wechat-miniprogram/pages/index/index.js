const { getMetaList, TYPE_LABELS } = require('../../utils/registry')
const { hexToRgba } = require('../../utils/color')
const methodsData = require('../../utils/methods-data')
const gameReg = require('../../utils/game-registry')
const trainStore = require('../../utils/train-store')
const { useTheme } = require('../../utils/theme-store')
const SK = require('../../utils/storage-keys')
const coursesData = require('../../utils/courses-data')
const courseProgress = require('../../utils/course-progress')

// 首页编辑精选：跨测评、方法与训练板块配置
const HOT_BATCH_SIZE = 4
const HOT_CONFIG = [
  // 按测评、方法、训练交错配置，避免推荐集中在单一类型
  { kind: 'assess', id: 'gses' },
  { kind: 'method', id: 'smart' },
  { kind: 'train', id: 'schulte' },
  { kind: 'assess', id: 'big5' },
  { kind: 'method', id: 'pomodoro' },
  { kind: 'train', id: 'memory-match' },
  { kind: 'assess', id: 'holland' },
  { kind: 'method', id: 'mindful' },
  { kind: 'train', id: 'whack' },
  { kind: 'assess', id: 'mbti' },
]

// 渐变映射：匹配各页面的 Hero 渐变
const GRADIENT_MAP = {
  assess: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
  method: 'linear-gradient(135deg, #0d9488 0%, #059669 100%)',
  train: 'linear-gradient(135deg, #1e293b 0%, #f59e0b 100%)',
}

function buildHotPicks() {
  const modules = getMetaList()
  const methods = methodsData.METHODS
  const games = gameReg.getMetaList()
  return HOT_CONFIG.map((cfg) => {
    const src = cfg.kind === 'assess' ? modules : cfg.kind === 'method' ? methods : games
    const item = src.find((x) => x.id === cfg.id)
    if (!item) return null
    const kindLabel = { assess: '测评', method: '方法', train: '训练' }[cfg.kind]
    const tint = hexToRgba(item.color, 0.12)
    return {
      kind: cfg.kind,
      kindLabel,
      id: item.id,
      name: item.name,
      icon: item.icon,
      color: item.color,
      tint,
      desc: item.desc,
      gradient: GRADIENT_MAP[cfg.kind],
    }
  }).filter(Boolean)
}

function getHotBatch(picks, batchIndex) {
  const batchCount = Math.max(1, Math.ceil(picks.length / HOT_BATCH_SIZE))
  const normalizedIndex = ((batchIndex % batchCount) + batchCount) % batchCount
  const start = normalizedIndex * HOT_BATCH_SIZE
  return {
    batchIndex: normalizedIndex,
    items: picks.slice(start, start + HOT_BATCH_SIZE),
  }
}

function lastTimes() {
  const map = { assess: {}, method: {}, train: {} }
  const hist = wx.getStorageSync(SK.HISTORY) || []
  hist.forEach((h) => { map.assess[h.id] = Math.max(map.assess[h.id] || 0, h.time) })
  const practices = wx.getStorageSync(SK.PRACTICES) || {}
  Object.keys(practices).forEach((mid) => {
    ;(practices[mid] || []).forEach((e) => { map.method[mid] = Math.max(map.method[mid] || 0, e.time) })
  })
  trainStore.allRecords().forEach((r) => { map.train[r.gameId] = Math.max(map.train[r.gameId] || 0, r.time) })
  return map
}

function orderByRecent(list, lastMap) {
  return list
    .map((item) => ({ item, t: lastMap[item.id] || 0 }))
    .sort((a, b) => {
      const ax = a.t ? 1 : 0
      const bx = b.t ? 1 : 0
      if (ax !== bx) return bx - ax
      if (ax) return b.t - a.t
      return 0
    })
    .map((x) => x.item)
}

function buildModules(lastMap) {
  const all = getMetaList().map((m) => ({
    id: m.id, type: m.type, typeLabel: TYPE_LABELS[m.type] || m.type, icon: m.icon, name: m.name, shortName: m.shortName,
    desc: m.desc, duration: m.duration, questionCount: m.questionCount,
    color: m.color, tint: hexToRgba(m.color, 0.12),
  }))
  return { all, featuredAssess: orderByRecent(all, lastMap.assess).slice(0, 5) }
}

function buildMethods(lastMap) {
  const all = methodsData.METHODS.map((m) => Object.assign({}, m, { tint: hexToRgba(m.color, 0.12) }))
  return { all, featuredMethods: orderByRecent(all, lastMap.method).slice(0, 5) }
}

function buildGames(lastMap) {
  const all = gameReg.getMetaList().map((g) => ({
    id: g.id, name: g.name, desc: g.desc, icon: g.icon, color: g.color, tint: hexToRgba(g.color, 0.12), dimLabel: g.dimLabel,
  }))
  return { all, featuredGames: orderByRecent(all, lastMap.train).slice(0, 5) }
}

function buildSearchIndex(modules, methods, games) {
  const moduleItems = modules.map((item) => ({
    id: item.id,
    key: 'assess:' + item.id,
    kind: 'assess',
    kindLabel: '测评',
    name: item.name,
    icon: item.icon,
    tint: item.tint,
    desc: item.desc,
    searchText: [item.name, item.shortName, item.typeLabel, item.desc].join(' ').toLowerCase(),
  }))
  const methodItems = methods.map((item) => ({
    id: item.id,
    key: 'method:' + item.id,
    kind: 'method',
    kindLabel: '方法',
    name: item.name,
    icon: item.icon,
    tint: item.tint,
    desc: item.summary,
    searchText: [
      item.name,
      item.summary,
      item.category,
      (item.content || []).map((section) => section.title + ' ' + section.text).join(' '),
      (item.steps || []).join(' '),
      (item.tips || []).join(' '),
      item.example || '',
    ].join(' ').toLowerCase(),
  }))
  const gameItems = games.map((item) => ({
    id: item.id,
    key: 'train:' + item.id,
    kind: 'train',
    kindLabel: '训练',
    name: item.name,
    icon: item.icon,
    tint: item.tint,
    desc: item.desc,
    searchText: [item.name, item.desc, item.dimLabel].join(' ').toLowerCase(),
  }))
  return moduleItems.concat(methodItems, gameItems)
}

// 跨板块「最近探索」：取最近有过记录的项（去重后按时间倒序），避免与底部 Tab 功能重叠
function buildRecent(lastMap) {
  const modules = getMetaList()
  const methods = methodsData.METHODS
  const games = gameReg.getMetaList()
  const picks = []
  const seen = {}
  const push = (kind, src, id, time) => {
    if (!time || seen[id]) return
    const item = src.find((x) => x.id === id)
    if (!item) return
    seen[id] = true
    picks.push({
      kind,
      kindLabel: { assess: '测评', method: '方法', train: '训练' }[kind],
      id: item.id,
      name: item.name,
      icon: item.icon,
      color: item.color,
      tint: hexToRgba(item.color, 0.12),
      desc: item.desc,
      gradient: GRADIENT_MAP[kind],
      time,
    })
  }
  Object.keys(lastMap.assess).forEach((id) => push('assess', modules, id, lastMap.assess[id]))
  Object.keys(lastMap.method).forEach((id) => push('method', methods, id, lastMap.method[id]))
  Object.keys(lastMap.train).forEach((id) => push('train', games, id, lastMap.train[id]))
  picks.sort((a, b) => b.time - a.time)
  return picks.slice(0, 6)
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
    hotPicks: [],
    recentItems: [],
    homeKeyword: '',
    homeSearchActive: false,
    homeSearchResults: [],
    hotBatchIndex: 0,
    visibleHotPicks: [],
    selectedGoal: '',
    goalLabel: '',
    courseId: '',
    courseName: '',
    courseMessage: '',
    courseActionLabel: '',
    courseStarted: false,
    goalFormVisible: false,
    welcomeBack: false,
  },
  onLoad() {
    useTheme(this)
    this.loadFeatured()
  },
  onShow() {
    this.loadFeatured()
  },
  loadFeatured() {
    const lastMap = lastTimes()
    const mod = buildModules(lastMap)
    const met = buildMethods(lastMap)
    const gam = buildGames(lastMap)
    this._homeSearchIndex = buildSearchIndex(mod.all, met.all, gam.all)
    const hotPicks = buildHotPicks()
    const hotBatch = getHotBatch(hotPicks, this.data.hotBatchIndex)
    this.setData({
      moduleCount: mod.all.length,
      methodCount: met.all.length,
      practiceCount: met.all.filter((m) => m.interactive).length,
      gameCount: gam.all.length,
      dimCount: Object.keys(gameReg.DIM_LABELS).length,
      featuredAssess: mod.featuredAssess,
      featuredMethods: met.featuredMethods,
      featuredGames: gam.featuredGames,
      hotPicks,
      recentItems: buildRecent(lastMap),
      hotBatchIndex: hotBatch.batchIndex,
      visibleHotPicks: hotBatch.items,
    }, () => this.loadHomeState())
  },
  loadHomeState() {
    const storedGoal = wx.getStorageSync(SK.USER_GOAL)
    const goal = typeof storedGoal === 'string' ? storedGoal : ''
    const onboardingDone = wx.getStorageSync(SK.ONBOARDING) === true
    const welcomeBack = !goal && !onboardingDone && this.data.recentItems.length > 0
    const course = coursesData.getCourseForGoal(goal)
    const state = course ? courseProgress.getCourseState(course) : null
    const nextStep = state && state.steps.find((step) => !step.completed && !step.skipped)
    let courseMessage = ''
    let courseActionLabel = ''
    if (course) {
      if (state.complete) {
        courseMessage = '已完成必做步骤，可以回顾路线或浏览其他内容。'
        courseActionLabel = '查看课程'
      } else if (state.started && nextStep) {
        const index = course.steps.findIndex((step) => step.id === nextStep.id) + 1
        courseMessage = '第 ' + index + '/' + course.steps.length + ' 步 · ' + nextStep.title + ' · 约 ' + nextStep.minutes + ' 分钟'
        courseActionLabel = '继续课程'
      } else {
        courseMessage = course.tagline
        courseActionLabel = '看看课程'
      }
    } else if (goal === 'browse') {
      courseMessage = '先按自己的兴趣浏览测评、方法和训练。'
      courseActionLabel = '查看课程路线'
    }
    this.setData({
      selectedGoal: goal,
      goalLabel: coursesData.GOAL_LABELS[goal] || '',
      courseId: course ? course.id : '',
      courseName: course ? course.name : '',
      courseMessage,
      courseActionLabel,
      courseStarted: !!(state && state.started),
      goalFormVisible: !goal && !onboardingDone && !welcomeBack,
      welcomeBack,
    })
  },
  goAssess() { wx.switchTab({ url: '/pages/assess/assess' }) },
  goMethods() { wx.switchTab({ url: '/pages/methods/methods' }) },
  goTrain() { wx.switchTab({ url: '/pages/train/train' }) },
  goDetail(e) { wx.navigateTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` }) },
  goMethodDetail(e) { wx.navigateTo({ url: `/pages/methods/detail?id=${e.currentTarget.dataset.id}` }) },
  goGame(e) { wx.navigateTo({ url: `/pages/train/game?gameId=${e.currentTarget.dataset.id}` }) },
  goHistory() { wx.navigateTo({ url: '/pages/history/history' }) },
  goAbout() { wx.navigateTo({ url: '/pages/about/about' }) },
  goCourseList() {
    const goal = this.data.selectedGoal || 'browse'
    wx.navigateTo({ url: '/pages/course/list?goal=' + goal })
  },
  goCourse() {
    if (!this.data.courseId) {
      this.goCourseList()
      return
    }
    wx.navigateTo({ url: '/pages/course/detail?id=' + this.data.courseId })
  },
  chooseGoal(e) {
    const goal = e.currentTarget.dataset.goal
    if (!coursesData.GOAL_LABELS[goal]) return
    const course = goal === 'browse' ? null : coursesData.getCourseForGoal(goal)
    if (goal !== 'browse' && !course) {
      console.error('[index] 目标没有对应课程:', goal)
      wx.showToast({ title: '暂时没有对应路线', icon: 'none' })
      return
    }
    wx.setStorageSync(SK.USER_GOAL, goal)
    wx.setStorageSync(SK.ONBOARDING, true)
    this.setData({ selectedGoal: goal, goalFormVisible: false }, () => {
      this.loadHomeState()
      if (course) wx.navigateTo({ url: '/pages/course/detail?id=' + course.id })
    })
  },
  toggleGoalForm() {
    this.setData({ goalFormVisible: !this.data.goalFormVisible })
  },
  clearGoal() {
    wx.removeStorageSync(SK.USER_GOAL)
    wx.removeStorageSync(SK.ONBOARDING)
    this.setData({ selectedGoal: '', goalLabel: '', courseId: '', goalFormVisible: true })
  },
  rotateHot() {
    const picks = this.data.hotPicks
    if (picks.length <= HOT_BATCH_SIZE) return
    const batch = getHotBatch(picks, this.data.hotBatchIndex + 1)
    this.setData({ hotBatchIndex: batch.batchIndex, visibleHotPicks: batch.items })
  },
  onHomeSearchInput(e) {
    this.updateHomeSearch(e.detail.value)
  },
  onHomeSearch(e) {
    const value = e && e.detail ? e.detail.value : this.data.homeKeyword
    this.updateHomeSearch(value)
  },
  updateHomeSearch(value) {
    const keyword = typeof value === 'string' ? value : ''
    const query = keyword.trim().toLowerCase()
    const results = query
      ? this._homeSearchIndex.filter((item) => item.searchText.includes(query))
      : []
    this.setData({
      homeKeyword: keyword,
      homeSearchActive: !!query,
      homeSearchResults: results,
    })
  },
  goHot(e) {
    const item = e.currentTarget.dataset.item
    this.openContent(item)
  },
  goSearchResult(e) {
    const item = e.currentTarget.dataset.item
    this.openContent(item)
  },
  openContent(item) {
    if (!item) return
    if (item.kind === 'assess') {
      wx.navigateTo({ url: `/pages/detail/detail?id=${item.id}` })
    } else if (item.kind === 'method') {
      wx.navigateTo({ url: `/pages/methods/detail?id=${item.id}` })
    } else if (item.kind === 'train') {
      wx.navigateTo({ url: `/pages/train/game?gameId=${item.id}` })
    }
  },
  onShareAppMessage() {
    return {
      title: '心智探索局｜测评、方法与训练，一起开始自我探索',
      path: '/pages/index/index',
    }
  },
  onShareTimeline() {
    return {
      title: '心智探索局｜测评、方法与训练，一起开始自我探索',
    }
  },
})