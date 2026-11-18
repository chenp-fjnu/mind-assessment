const { loadPage } = require('./page-helper')
const coursesData = require('../utils/courses-data')
const courseProgress = require('../utils/course-progress')
const { getListRecommendations } = require('../utils/list-recommendations')

describe('course data and progress', () => {
  test('all course steps resolve to registered content', () => {
    const courses = coursesData.getCourseList()
    expect(courses.map((course) => course.id)).toEqual([
      'self-intro',
      'focus',
      'emotion',
      'action-start',
      'relaxation',
      'communication-practice',
    ])
    courses.forEach((course) => {
      expect(course.steps.length).toBeGreaterThan(0)
      course.steps.forEach((step) => {
        expect(step.name).toBeTruthy()
        expect(['assess', 'method', 'train', 'reflect']).toContain(step.kind)
      })
    })
  })

  test('new goals recommend their required course content in the matching library', () => {
    const cases = [
      ['action', 'method', ['woop', 'tinyhabits', 'pomodoro']],
      ['emotion', 'method', ['abc']],
      ['relax', 'train', ['mindfulness']],
      ['communication', 'method', ['nvc', 'grow']],
    ]
    cases.forEach(([goal, kind, expectedIds]) => {
      const course = coursesData.getCourseForGoal(goal)
      const items = course.steps.filter((step) => step.kind === kind)
      const recommendations = getListRecommendations(kind, items, goal, [], [], 10)
      expect(recommendations.recommended.map((item) => item.id)).toEqual(expectedIds)
    })
  })

  test('pressure coping and relaxation routes focus on different practices', () => {
    const pressure = coursesData.getCourseForGoal('emotion')
    const relaxation = coursesData.getCourseForGoal('relax')
    expect(pressure.name).toBe('压力梳理与应对')
    expect(pressure.steps.map((step) => step.id)).toEqual([
      'pss',
      'abc',
      'eisenhower',
      'stress-action-plan',
    ])
    expect(pressure.steps.filter((step) => !step.optional).map((step) => step.id)).toEqual([
      'abc',
      'stress-action-plan',
    ])
    expect(relaxation.steps.map((step) => step.id)).toContain('mindful')
    expect(pressure.steps.map((step) => step.id)).not.toContain('mindful')
    expect(pressure.steps.some((step) => step.kind === 'train')).toBe(false)
  })

  test('optional reflection is saved locally and does not change required progress', () => {
    const storage = {}
    const originalGet = global.wx.getStorageSync
    const originalSet = global.wx.setStorageSync
    global.wx.getStorageSync = (key) => storage[key]
    global.wx.setStorageSync = (key, value) => { storage[key] = value }
    try {
      expect(() => courseProgress.saveReflection('focus', 'focus-plan', '  ')).toThrow('课程回顾内容不能为空')
      courseProgress.saveReflection('focus', 'focus-plan', '  先完成任务的第一小步  ')
      const state = courseProgress.getCourseState(coursesData.getCourse('focus'))
      const reflection = state.steps.find((step) => step.id === 'focus-plan')
      expect(reflection.completed).toBe(true)
      expect(reflection.reflection).toBe('先完成任务的第一小步')
      expect(state.completedRequiredCount).toBe(0)
      expect(courseProgress.read('focus').reflections['focus-plan']).toBe('先完成任务的第一小步')
    } finally {
      global.wx.getStorageSync = originalGet
      global.wx.setStorageSync = originalSet
    }
  })

  test('completion advances through required steps while an optional step may be skipped', () => {
    const storage = {}
    const originalGet = global.wx.getStorageSync
    const originalSet = global.wx.setStorageSync
    global.wx.getStorageSync = (key) => storage[key]
    global.wx.setStorageSync = (key, value) => { storage[key] = value }
    try {
      courseProgress.start('emotion')
      courseProgress.skipStep('emotion', 'pss')
      expect(courseProgress.read('emotion').currentStepId).toBe('abc')
      courseProgress.completeStep('emotion', 'abc')
      courseProgress.skipStep('emotion', 'eisenhower')
      expect(courseProgress.read('emotion').currentStepId).toBe('stress-action-plan')
      courseProgress.saveReflection('emotion', 'stress-action-plan', '先确认交付范围')
      const state = courseProgress.getCourseState(coursesData.getCourse('emotion'))
      expect(state.complete).toBe(true)
      expect(state.percent).toBe(100)
      expect(state.steps.find((step) => step.id === 'pss').skipped).toBe(true)
    } finally {
      global.wx.getStorageSync = originalGet
      global.wx.setStorageSync = originalSet
    }
  })

  test('starting a changed course recovers from a removed current step', () => {
    const storage = {
      ma_course_progress: {
        emotion: {
          currentStepId: 'box-breathing',
          completedStepIds: ['box-breathing', 'abc'],
        },
      },
    }
    const originalGet = global.wx.getStorageSync
    const originalSet = global.wx.setStorageSync
    global.wx.getStorageSync = (key) => storage[key]
    global.wx.setStorageSync = (key, value) => { storage[key] = value }
    try {
      courseProgress.start('emotion')
      expect(courseProgress.read('emotion').currentStepId).toBe('pss')
    } finally {
      global.wx.getStorageSync = originalGet
      global.wx.setStorageSync = originalSet
    }
  })

  test('reset clears only the selected course progress', () => {
    const storage = {
      ma_course_progress: {
        emotion: {
          currentStepId: 'abc',
          completedStepIds: ['box-breathing'],
          reflections: { 'emotion-plan': '自然呼吸' },
        },
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
      ctx.openStep({ currentTarget: { dataset: { id: 'pss' } } })
      expect(url).toBe('/pages/detail/detail?id=pss&courseId=emotion&stepId=pss')
    } finally {
      global.wx.navigateTo = originalNavigateTo
    }
  })
})

describe('content list recommendations', () => {
  test('course recommendations take priority over non-duplicate beginner picks', () => {
    const games = coursesData.getCourseList()
      .find((course) => course.id === 'focus')
      .steps.filter((step) => step.kind === 'train' && !step.optional)
      .map((step) => ({ id: step.id }))
    games.push({ id: 'memory-match' })
    const picks = getListRecommendations('train', games, 'focus', ['schulte', 'memory-match'], ['reaction-time'], 3)
    expect(picks.newcomer.map((item) => item.id)).toEqual(['memory-match'])
    expect(picks.recommended.map((item) => item.id)).toEqual(['schulte', 'n-back'])
    expect(picks.recommendationTitle).toBe('与你的目标相关')
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
      const recommended = ctx.data.recommendedModules || ctx.data.recommendedMethods || ctx.data.recommendedGames
      expect(recommended.length).toBeLessThanOrEqual(3)
      ctx[showAllMethod]()
      expect(ctx.data.showAll).toBe(true)
    })
  })

  test('assessment beginner picks exclude clinical screening and use a clearer label', () => {
    const assess = loadPage('pages/assess/assess.js')
    expect(assess.data.newcomerModules.map((item) => item.id)).toEqual(['gses', 'big5', 'holland', 'mbti'])
    expect(assess.data.recommendedModules).toEqual([])
  })

  test('optional pressure self-observation is not promoted as a goal-based assessment pick', () => {
    const originalGet = global.wx.getStorageSync
    global.wx.getStorageSync = (key) => key === 'ma_user_goal' ? 'emotion' : []
    try {
      const assess = loadPage('pages/assess/assess.js')
      expect(assess.data.recommendedModules).toEqual([])
    } finally {
      global.wx.getStorageSync = originalGet
    }
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
      expect(train.data.recommendedGames.map((item) => item.id)).toEqual(['schulte', 'n-back'])
      expect(assess.data.allModules.length).toBeGreaterThan(4)
      expect(methods.data.allMethods.length).toBeGreaterThan(4)
      expect(train.data.gameCount).toBeGreaterThan(4)
    } finally {
      global.wx.getStorageSync = originalGet
    }
  })
})
