const coursesData = require('../../utils/courses-data')
const courseProgress = require('../../utils/course-progress')
const { useTheme } = require('../../utils/theme-store')

Page({
  data: {
    courses: [],
    goal: '',
    goalLabel: '',
    empty: false,
  },
  onLoad(query) {
    useTheme(this)
    this._goal = (query && query.goal) || ''
    this.loadCourses()
  },
  onShow() {
    this.loadCourses()
  },
  loadCourses() {
    const courses = coursesData.getCourseList()
      .map((course) => {
        const state = courseProgress.getCourseState(course)
        return Object.assign({}, course, {
          completedCount: state.completedCount,
          stepCount: state.stepCount,
          completedRequiredCount: state.completedRequiredCount,
          requiredStepCount: state.requiredStepCount,
          percent: state.percent,
          started: state.started,
          complete: state.complete,
          recommended: course.goal === this._goal && this._goal !== 'browse',
        })
      })
      .sort((a, b) => Number(b.recommended) - Number(a.recommended))
    this.setData({
      courses,
      goal: this._goal,
      goalLabel: coursesData.GOAL_LABELS[this._goal] || '',
      empty: courses.length === 0,
    })
  },
  openCourse(e) {
    const id = e.currentTarget.dataset.id
    if (!coursesData.getCourse(id)) return
    wx.navigateTo({ url: '/pages/course/detail?id=' + id })
  },
  onShareAppMessage() {
    return {
      title: '找到适合自己的课程路线 - 心智探索局',
      path: '/pages/course/list',
    }
  },
  onShareTimeline() {
    return {
      title: '找到适合自己的课程路线 - 心智探索局',
    }
  },
  goBack() {
    wx.navigateBack({ delta: 1, fail: () => wx.switchTab({ url: '/pages/index/index' }) })
  },
})
