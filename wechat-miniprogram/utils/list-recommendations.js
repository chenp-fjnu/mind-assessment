const coursesData = require('./courses-data')

function selectByIds(items, ids, excluded, limit) {
  const found = []
  const used = Object.assign({}, excluded || {})
  ;(ids || []).forEach((id) => {
    if (used[id] || found.length >= limit) return
    const item = items.find((entry) => entry.id === id)
    if (!item) return
    used[id] = true
    found.push(item)
  })
  return found
}

function getListRecommendations(kind, items, goal, newcomerIds, fallbackIds, limit) {
  const course = coursesData.getCourseForGoal(goal)
  const courseIds = course
    ? course.steps.filter((step) => step.kind === kind && !step.optional).map((step) => step.id)
    : []
  const recommendationIds = course ? courseIds : fallbackIds
  const recommended = selectByIds(items, recommendationIds, null, limit || 3)
  const recommendedIds = {}
  recommended.forEach((item) => { recommendedIds[item.id] = true })
  const newcomer = selectByIds(items, newcomerIds, recommendedIds, 4)
  return {
    newcomer,
    recommended,
    recommendationTitle: course ? '与你的目标相关' : '精选内容',
  }
}

module.exports = { getListRecommendations }
