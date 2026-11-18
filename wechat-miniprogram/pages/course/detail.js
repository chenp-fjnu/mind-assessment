const coursesData = require('../../utils/courses-data')
const courseProgress = require('../../utils/course-progress')
const { useTheme } = require('../../utils/theme-store')

Page({
  data: {
    course: null,
    steps: [],
    started: false,
    complete: false,
    completedCount: 0,
    stepCount: 0,
    completedRequiredCount: 0,
    requiredStepCount: 0,
    percent: 0,
    invalid: false,
  },
  onLoad(query) {
    useTheme(this)
    this._courseId = (query && query.id) || ''
    this.loadCourse()
  },
  onShow() {
    this.loadCourse()
  },
  loadCourse() {
    const course = coursesData.getCourse(this._courseId)
    if (!course) {
      this.setData({ course: null, invalid: true })
      return
    }
    const state = courseProgress.getCourseState(course)
    this.setData({
      course,
      steps: state.steps,
      started: state.started,
      complete: state.complete,
      completedCount: state.completedCount,
      stepCount: state.stepCount,
      completedRequiredCount: state.completedRequiredCount,
      requiredStepCount: state.requiredStepCount,
      percent: state.percent,
      invalid: false,
    })
  },
  openStep(e) {
    const stepId = e.currentTarget.dataset.id
    const course = this.data.course
    const step = course && course.steps.find((item) => item.id === stepId)
    if (!step || step.kind === 'reflect') return
    courseProgress.start(course.id)
    courseProgress.setCurrentStep(course.id, step.id)
    const context = '&courseId=' + course.id + '&stepId=' + step.id
    let url = ''
    if (step.kind === 'assess') url = '/pages/detail/detail?id=' + step.id + context
    else if (step.kind === 'method') url = '/pages/methods/detail?id=' + step.id + context
    else if (step.kind === 'train') url = '/pages/train/game?gameId=' + step.id + context
    if (url) wx.navigateTo({ url })
  },
  updateReflection(e) {
    const stepId = e.currentTarget.dataset.id
    const value = e.detail.value
    this.setData({
      steps: this.data.steps.map((step) => step.id === stepId ? Object.assign({}, step, { reflection: value }) : step),
    })
  },
  saveReflection(e) {
    const course = this.data.course
    const stepId = e.currentTarget.dataset.id
    const step = this.data.steps.find((item) => item.id === stepId && item.isReflection)
    if (!course || !step) return
    if (!step.reflection || !step.reflection.trim()) {
      wx.showToast({ title: '先写下一条记录', icon: 'none' })
      return
    }
    try {
      courseProgress.saveReflection(course.id, stepId, step.reflection)
      this.loadCourse()
      wx.showToast({ title: '已保存在本机', icon: 'success' })
    } catch (error) {
      console.error('[course] 保存回顾失败:', error)
      wx.showToast({ title: '保存失败，请重试', icon: 'none' })
    }
  },
  skipStep(e) {
    const course = this.data.course
    const stepId = e.currentTarget.dataset.id
    if (!course || !stepId) return
    courseProgress.skipStep(course.id, stepId)
    this.loadCourse()
  },
  resetProgress() {
    wx.showModal({
      title: '清除课程进度',
      content: '会清除这条路线的进度和课程回顾，不会删除测评、练习或训练记录。',
      confirmText: '清除进度',
      success: (result) => {
        if (!result.confirm) return
        try {
          courseProgress.reset(this._courseId)
          this.loadCourse()
          wx.showToast({ title: '课程进度已清除', icon: 'success' })
        } catch (error) {
          wx.showToast({ title: '无法清除课程进度', icon: 'none' })
        }
      },
    })
  },
  goList() {
    wx.navigateBack({ delta: 1, fail: () => wx.redirectTo({ url: '/pages/course/list?goal=browse' }) })
  },
  goHome() {
    wx.switchTab({ url: '/pages/index/index' })
  },
  onShareAppMessage() {
    const course = this.data.course
    if (!course) {
      return { title: '浏览课程路线 - 心智探索局', path: '/pages/course/list' }
    }
    return {
      title: '试试「' + course.name + '」路线 - 心智探索局',
      path: '/pages/course/detail?id=' + encodeURIComponent(course.id),
    }
  },
  onShareTimeline() {
    const course = this.data.course
    if (!course) return { title: '浏览课程路线 - 心智探索局' }
    return {
      title: '试试「' + course.name + '」路线 - 心智探索局',
      query: 'id=' + encodeURIComponent(course.id),
    }
  },
})
