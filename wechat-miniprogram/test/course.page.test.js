const { loadPage } = require('./page-helper')
const coursesData = require('../utils/courses-data')
const courseProgress = require('../utils/course-progress')
const { getListRecommendations } = require('../utils/list-recommendations')

describe('course data and progress', () => {
  test('all pilot course steps resolve to registered content', () => {
    const courses = coursesData.getCourseList()
    expect(courses.map((course) => course.id)).toEqual(['self-intro', 'focus', 'emotion'])
    courses.forEach((course) => {
      expect(course.steps.length).toBeGreaterThan(0)
      course.steps.forEach((step) => {
        expect(step.name).toBeTruthy()
        expect(['assess', 'method', 'train']).toContain(step.kind)
      })
    })
  })

  test('completion advances through required steps while an optional step may be skipped', () => {
    const storage = {}
    const originalGet = global.wx.getStorageSync
    const originalSet = global.wx.setStorageSync
    global.wx.getStorageSync = (key) => storage[key]
    global.wx.setStorageSync = (key, value) => { storage[key] = value }
    try {
      courseProgress.start('emotion')
      courseProgress.skipStep('emotion', 'gad7')
      expect(courseProgress.read('emotion').currentStepId).toBe('box-breathing')
      courseProgress.completeStep('emotion', 'box-breathing')
      courseProgress.completeStep('emotion', 'abc')
      courseProgress.completeStep('emotion', 'threegood')
      courseProgress.completeStep('emotion', 'mindful')
      const state = courseProgress.getCourseState(coursesData.getCourse('emotion'))
      expect(state.complete).toBe(true)
      expect(state.percent).toBe(100)
      expect(state.steps.find((step) => step.id === 'gad7').skipped).toBe(true)
    } finally {
      global.wx.getStorageSync = originalGet
      global.wx.setStorageSync = originalSet
    }
  })

  test('reset clears only the selected course progress', () => {
    const storage = {
      ma_course_progress: {
        emotion: { currentStepId: 'abc', completedStepIds: ['box-breathing'] },
        focus: { currentStepId: 'n-back', completedStepIds: ['schulte'] },
      },
    }
    const originalGet = global.wx.getStorageSync
    const originalSet = global.wx.setStorageSync
    global.wx.getStorageSync = (key) => storage[key]
    global.wx.setStorageSync = (key, value) => { storage[key] = value }
    try {
      courseProgress.reset('emotion')
      expect(storage.ma_course_progress.emotion).toBeUndefined()
      expect(storage.ma_course_progress.focus.currentStepId).toBe('n-back')
    } finally {
      global.wx.getStorageSync = originalGet
      global.wx.setStorageSync = originalSet
    }
  })
})

describe('course pages', () => {
  test('course list puts the selected goal first', () => {
    const ctx = loadPage('pages/course/list.js', { goal: 'focus' })
    expect(ctx.data.courses[0].id).toBe('focus')
    expect(ctx.data.courses[0].recommended).toBe(true)
  })

  test('course detail routes an assessment with its progress context', () => {
    let url = ''
    const originalNavigateTo = global.wx.navigateTo
    global.wx.navigateTo = (options) => { url = options.url }
    try {
      const ctx = loadPage('pages/course/detail.js', { id: 'emotion' })
      ctx.openStep({ currentTarget: { dataset: { id: 'gad7' } } })
      expect(url).toBe('/pages/detail/detail?id=gad7&courseId=emotion&stepId=gad7')
    } finally {
      global.wx.navigateTo = originalNavigateTo
    }
  })
})

describe('content list recommendations', () => {
  test('recommendations are capped, deduplicated and follow the selected course', () => {
    const games = coursesData.getCourseList()
      .find((course) => course.id === 'focus')
      .steps.filter((step) => step.kind === 'train')
      .map((step) => ({ id: step.id }))
    const picks = getListRecommendations('train', games, 'focus', ['schulte'], ['n-back'], 3)
    expect(picks.newcomer.map((item) => item.id)).toEqual(['schulte'])
    expect(picks.recommended.map((item) => item.id)).toEqual(['n-back', 'cps'])
    expect(picks.recommended).toHaveLength(2)
  })

  test('all three libraries start with a short curated view and expose the full list on request', () => {
    const pages = [
      ['pages/assess/assess.js', 'showAllModules'],
      ['pages/methods/methods.js', 'showAllMethods'],
      ['pages/train/train.js', 'showAllGames'],
    ]
    pages.forEach(([path, showAllMethod]) => {
      const ctx = loadPage(path)
      expect(ctx.data.showAll).toBe(false)
      expect(ctx.data.newcomerModules || ctx.data.newcomerMethods || ctx.data.newcomerGames).toHaveLength(4)
      expect(ctx.data.recommendedModules || ctx.data.recommendedMethods || ctx.data.recommendedGames).toHaveLength(3)
      ctx[showAllMethod]()
      expect(ctx.data.showAll).toBe(true)
    })
  })

  test('selected goal changes library recommendations without hiding the full catalog', () => {
    const originalGet = global.wx.getStorageSync
    global.wx.getStorageSync = (key) => key === 'ma_user_goal' ? 'focus' : []
    try {
      const assess = loadPage('pages/assess/assess.js')
      const methods = loadPage('pages/methods/methods.js')
      const train = loadPage('pages/train/train.js')
      expect(assess.data.recommendedModules).toHaveLength(0)
      expect(methods.data.recommendedMethods.map((item) => item.id)).toContain('flow')
      expect(train.data.recommendedGames.map((item) => item.id)).toEqual(['n-back', 'cps'])
      expect(assess.data.allModules.length).toBeGreaterThan(4)
      expect(methods.data.allMethods.length).toBeGreaterThan(4)
      expect(train.data.gameCount).toBeGreaterThan(4)
    } finally {
      global.wx.getStorageSync = originalGet
    }
  })
})
