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
  const newcomer = selectByIds(items, newcomerIds, null, 4)
  const excluded = {}
  newcomer.forEach((item) => { excluded[item.id] = true })
  const course = coursesData.getCourseForGoal(goal)
  const courseIds = course
    ? course.steps.filter((step) => step.kind === kind).map((step) => step.id)
    : fallbackIds
  const recommended = selectByIds(items, courseIds, excluded, limit || 3)
  return { newcomer, recommended }
}

module.exports = { getListRecommendations }
