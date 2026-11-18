const SK = require('./storage-keys')
const { getCourse } = require('./courses-data')

function readAll() {
  const stored = wx.getStorageSync(SK.COURSE_PROGRESS)
  return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {}
}

function read(courseId) {
  const stored = readAll()[courseId]
  if (!stored || typeof stored !== 'object') {
    return { currentStepId: '', completedStepIds: [], skippedStepIds: [], startedAt: 0, updatedAt: 0 }
  }
  return {
    currentStepId: stored.currentStepId || '',
    completedStepIds: Array.isArray(stored.completedStepIds) ? stored.completedStepIds : [],
    skippedStepIds: Array.isArray(stored.skippedStepIds) ? stored.skippedStepIds : [],
    startedAt: Number(stored.startedAt) || 0,
    updatedAt: Number(stored.updatedAt) || 0,
  }
}

function hasStep(courseId, stepId) {
  const course = getCourse(courseId)
  return !!course && course.steps.some((step) => step.id === stepId)
}

function write(courseId, progress) {
  const all = readAll()
  all[courseId] = Object.assign({}, progress, { updatedAt: Date.now() })
  wx.setStorageSync(SK.COURSE_PROGRESS, all)
  return all[courseId]
}

function getNextStep(course, progress) {
  return course.steps.find((step) =>
    progress.completedStepIds.indexOf(step.id) < 0 &&
    progress.skippedStepIds.indexOf(step.id) < 0
  )
}

function start(courseId) {
  const course = getCourse(courseId)
  if (!course) throw new Error('课程不存在: ' + courseId)
  const progress = read(courseId)
  if (!progress.startedAt) progress.startedAt = Date.now()
  if (!progress.currentStepId) {
    const next = getNextStep(course, progress)
    progress.currentStepId = next ? next.id : ''
  }
  return write(courseId, progress)
}

function setCurrentStep(courseId, stepId) {
  const course = getCourse(courseId)
  if (!course || !course.steps.some((step) => step.id === stepId)) {
    throw new Error('课程步骤不存在: ' + courseId + '/' + stepId)
  }
  const progress = read(courseId)
  if (!progress.startedAt) progress.startedAt = Date.now()
  progress.currentStepId = stepId
  return write(courseId, progress)
}

function completeStep(courseId, stepId) {
  const course = getCourse(courseId)
  if (!course || !course.steps.some((step) => step.id === stepId)) {
    throw new Error('课程步骤不存在: ' + courseId + '/' + stepId)
  }
  const progress = read(courseId)
  if (!progress.startedAt) progress.startedAt = Date.now()
  if (progress.completedStepIds.indexOf(stepId) < 0) progress.completedStepIds.push(stepId)
  progress.skippedStepIds = progress.skippedStepIds.filter((id) => id !== stepId)
  const next = getNextStep(course, progress)
  progress.currentStepId = next ? next.id : ''
  return write(courseId, progress)
}

function skipStep(courseId, stepId) {
  const course = getCourse(courseId)
  if (!course || !course.steps.some((step) => step.id === stepId)) {
    throw new Error('课程步骤不存在: ' + courseId + '/' + stepId)
  }
  const progress = read(courseId)
  if (!progress.startedAt) progress.startedAt = Date.now()
  if (progress.completedStepIds.indexOf(stepId) < 0 && progress.skippedStepIds.indexOf(stepId) < 0) {
    progress.skippedStepIds.push(stepId)
  }
  const next = getNextStep(course, progress)
  progress.currentStepId = next ? next.id : ''
  return write(courseId, progress)
}

function reset(courseId) {
  if (!getCourse(courseId)) throw new Error('课程不存在: ' + courseId)
  const all = readAll()
  delete all[courseId]
  wx.setStorageSync(SK.COURSE_PROGRESS, all)
}

function getCourseState(course) {
  const progress = read(course.id)
  const completed = progress.completedStepIds.filter((id) => course.steps.some((step) => step.id === id))
  const requiredSteps = course.steps.filter((step) => !step.optional)
  const completedRequiredCount = requiredSteps.filter((step) => completed.indexOf(step.id) >= 0).length
  const requiredDone = requiredSteps.every((step) => completed.indexOf(step.id) >= 0)
  return {
    progress,
    completedCount: completed.length,
    stepCount: course.steps.length,
    completedRequiredCount,
    requiredStepCount: requiredSteps.length,
    percent: requiredSteps.length ? Math.round((completedRequiredCount / requiredSteps.length) * 100) : 100,
    started: !!progress.startedAt,
    complete: requiredDone,
    steps: course.steps.map((step, index) => ({
      ...step,
      completed: completed.indexOf(step.id) >= 0,
      skipped: progress.skippedStepIds.indexOf(step.id) >= 0,
      current: progress.currentStepId === step.id,
      isLast: index === course.steps.length - 1,
    })),
  }
}

module.exports = { read, hasStep, start, setCurrentStep, completeStep, skipStep, reset, getCourseState }
