const { getMetaList } = require('./registry')
const methodsData = require('./methods-data')
const gameRegistry = require('./game-registry')

const COURSES = [
  {
    id: 'self-intro',
    goal: 'self',
    name: '15 分钟认识自己',
    icon: '🧭',
    color: '#7d83d8',
    tagline: '从自我效能到成长视角，做一次轻量自我探索。',
    persona: '第一次使用，或想开始了解自己的用户',
    why: '先用较短的量表认识自己的信心与成长视角。',
    outcome: '获得两份自我探索结果，作为继续了解自己的起点。',
    totalMinutes: 15,
    cadence: '可一次完成，也可分两次进行。',
    steps: [
      { kind: 'assess', id: 'gses', title: '了解自我效能感', why: '先看看自己面对日常挑战时的信心。', minutes: 5 },
      { kind: 'assess', id: 'mind6', title: '探索成长视角', why: '再从不同层次梳理自己的思考方式。', minutes: 10 },
    ],
  },
  {
    id: 'focus',
    goal: 'focus',
    name: '专注力练习路线',
    icon: '🎯',
    color: '#0891b2',
    tagline: '用短训练和可执行的方法，尝试建立专注节奏。',
    persona: '想练习专注、容易分心或拖延的用户',
    why: '先体验注意力与工作记忆训练，再把练习接到日常行动。',
    outcome: '体验不同类型的脑力训练，并整理一套适合自己的专注做法。',
    totalMinutes: 25,
    cadence: '建议分几次完成，不要求连续打卡。',
    steps: [
      { kind: 'train', id: 'schulte', title: '注意力热身', why: '从短时视觉搜索开始。', minutes: 5 },
      { kind: 'train', id: 'n-back', title: '工作记忆练习', why: '体验在变化信息中保持注意的挑战。', minutes: 5 },
      { kind: 'method', id: 'pomodoro', title: '安排专注节奏', why: '把专注练习转成可执行的时间安排。', minutes: 5 },
      { kind: 'train', id: 'cps', title: '反应速度体验', why: '换一种短时任务，观察自己的节奏。', minutes: 5 },
      { kind: 'method', id: 'flow', title: '回顾适合自己的状态', why: '整理哪些任务条件更容易让你投入。', minutes: 5 },
    ],
  },
  {
    id: 'emotion',
    goal: 'emotion',
    name: '压力调节练习',
    icon: '🌿',
    color: '#059669',
    tagline: '从自我观察到呼吸与认知练习，按自己的节奏尝试。',
    persona: '想了解近期压力感受，或练习一般情绪调节方法的用户',
    why: '先提供自我观察，再尝试几种可自行选择的练习。',
    outcome: '认识近期感受，并收藏适合自己尝试的练习方式。',
    totalMinutes: 23,
    cadence: '建议分几次完成；任何一步都可以跳过或退出。',
    disclaimer: '测评仅用于自我观察，不是诊断或治疗。若填写令你不适，可跳过测评，直接浏览练习；持续困扰时请向专业人员寻求帮助。',
    steps: [
      { kind: 'train', id: 'box-breathing', title: '尝试箱式呼吸', why: '体验一段简短的节奏呼吸练习。', minutes: 3 },
      { kind: 'method', id: 'abc', title: '梳理事件与想法', why: '练习区分发生的事、想法与感受。', minutes: 5 },
      { kind: 'method', id: 'threegood', title: '记录三件好事', why: '留意日常中对自己有意义的积极经验。', minutes: 5 },
      { kind: 'method', id: 'mindful', title: '练习正念呼吸', why: '尝试把注意力温和地带回当下。', minutes: 5 },
      { kind: 'assess', id: 'gad7', title: '观察近期焦虑感受', why: '可选的自我观察量表，不用于诊断。', minutes: 5, optional: true },
    ],
  },
]

const GOAL_LABELS = {
  self: '想更了解自己',
  focus: '想提升专注',
  emotion: '想调节压力或情绪',
  browse: '先随便看看',
}

function findSource(kind, id) {
  if (kind === 'assess') return getMetaList().find((item) => item.id === id)
  if (kind === 'method') return methodsData.METHODS.find((item) => item.id === id)
  if (kind === 'train') return gameRegistry.getMetaList().find((item) => item.id === id)
  return null
}

function resolveCourse(course) {
  return Object.assign({}, course, {
    goalLabel: GOAL_LABELS[course.goal],
    steps: course.steps.map((step) => {
      const source = findSource(step.kind, step.id)
      if (!source) throw new Error('课程内容不存在: ' + course.id + '/' + step.kind + '/' + step.id)
      return Object.assign({}, step, {
        name: source.name,
        icon: source.icon,
        color: source.color,
      })
    }),
  })
}

function getCourseList() {
  return COURSES.map(resolveCourse)
}

function getCourse(id) {
  const course = COURSES.find((item) => item.id === id)
  return course ? resolveCourse(course) : null
}

function getCourseForGoal(goal) {
  const course = COURSES.find((item) => item.goal === goal)
  return course ? resolveCourse(course) : null
}

module.exports = { COURSES, GOAL_LABELS, getCourseList, getCourse, getCourseForGoal }
