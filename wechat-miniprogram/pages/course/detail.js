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
    if (!step) return
    courseProgress.start(course.id)
    courseProgress.setCurrentStep(course.id, step.id)
    const context = '&courseId=' + course.id + '&stepId=' + step.id
    let url = ''
    if (step.kind === 'assess') url = '/pages/detail/detail?id=' + step.id + context
    else if (step.kind === 'method') url = '/pages/methods/detail?id=' + step.id + context
    else if (step.kind === 'train') url = '/pages/train/game?gameId=' + step.id + context
    if (url) wx.navigateTo({ url })
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
      content: '只会清除这条路线的完成状态，不会删除测评、练习或训练记录。',
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
})
