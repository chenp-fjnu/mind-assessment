const { getMetaList } = require('./registry')
const methodsData = require('./methods-data')
const gameRegistry = require('./game-registry')
const { hexToRgba } = require('./color')

const COURSES = [
  {
    id: 'self-intro',
    goal: 'self',
    name: '20 分钟认识自己',
    icon: '🧭',
    color: '#7d83d8',
    tagline: '从自我效能到成长视角，做一次轻量自我探索。',
    persona: '第一次使用，或想开始了解自己的用户',
    why: '先用较短的量表认识自己的信心与成长视角。',
    objective: '用两份自我观察量表形成初步认识，不把分数当作固定标签。',
    outcome: '带走一个基于近期真实经历的小行动，作为继续探索的起点。',
    totalMinutes: 20,
    cadence: '可一次完成，也可分两次进行。',
    steps: [
      { kind: 'assess', id: 'gses', title: '了解自我效能感', why: '先看看自己面对日常挑战时的信心。', task: '按近期的真实感受作答，不必选择“理想中的自己”会选的答案。', minutes: 5 },
      { kind: 'assess', id: 'mind6', title: '探索成长视角', why: '再从不同层次梳理自己的思考方式。', task: '把结果当作观察线索，想想它和近期经历是否吻合；它不是对你的定型。', minutes: 10 },
      {
        kind: 'reflect',
        id: 'self-action',
        title: '整理一个成长行动',
        why: '把观察转成一个小而具体、可以尝试的行动。',
        prompt: '哪些观察让你有共鸣？接下来一周，你愿意尝试哪一件小事？',
        placeholder: '例如：我发现自己在准备充分时更有信心；这周遇到难题时，我先拆出一个能完成的小步骤。',
        minutes: 5,
        optional: true,
      },
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
    objective: '观察自己在不同任务中的专注体验，设计一个能在日常任务中尝试的专注安排。',
    outcome: '带走一份包含具体任务、开始动作和干扰应对方式的专注计划。',
    totalMinutes: 30,
    cadence: '建议分几次完成，不要求连续打卡。',
    steps: [
      { kind: 'train', id: 'schulte', title: '注意力热身', why: '从短时视觉搜索开始。', task: '留意自己如何寻找目标、何时容易被干扰，不必把成绩当作能力结论。', minutes: 5 },
      { kind: 'train', id: 'n-back', title: '工作记忆练习', why: '体验在变化信息中保持注意的挑战。', task: '关注任务难度变化时的体验；感到吃力是练习的一部分，不代表“专注力差”。', minutes: 5 },
      { kind: 'method', id: 'pomodoro', title: '安排专注节奏', why: '把练习转成可执行的时间安排。', task: '选一个真实的小任务，写下开始动作、专注时长和休息方式；时长可以短于标准番茄钟。', minutes: 5 },
      { kind: 'train', id: 'cps', title: '持续注意体验', why: '换一种短时任务，观察自己维持注意的体验。', task: '只把它当作一次任务体验，不用单次反应表现判断日常专注能力。', minutes: 5, optional: true },
      { kind: 'method', id: 'flow', title: '回顾适合自己的状态', why: '整理哪些任务条件更容易让你投入。', task: '想一个最近比较投入的时刻：任务目标是否清楚？难度是否合适？干扰是否较少？', minutes: 5 },
      {
        kind: 'reflect',
        id: 'focus-plan',
        title: '制定一次专注尝试',
        why: '用一个具体计划，把路线中的体验带回日常。',
        prompt: '写下一个近期要做的任务、最小开始动作、准备尝试的专注时长，以及遇到干扰时怎么处理。',
        placeholder: '任务：整理课程资料；开始动作：打开文件并列出三个标题；先专注 15 分钟；想到其他事先记在纸上。',
        minutes: 5,
        optional: true,
      },
    ],
  },
  {
    id: 'emotion',
    goal: 'emotion',
    name: '压力调节练习',
    icon: '🌿',
    color: '#059669',
    tagline: '从简短呼吸练习到认知与正念体验，按自己的节奏尝试。',
    persona: '想了解近期压力感受，或练习一般情绪调节方法的用户',
    why: '先从低强度练习开始，再按自己的感受选择其他练习；自我观察量表始终可选。',
    objective: '了解自己对练习的感受，并找到一种愿意尝试、也知道何时停止的调节方式。',
    outcome: '带走一个适合自己的练习选择和使用边界，而不是追求立刻消除情绪。',
    totalMinutes: 28,
    cadence: '建议分几次完成；任何一步都可以跳过或退出。',
    disclaimer: '测评仅用于自我观察，不是诊断或治疗。若填写令你不适，可跳过测评，直接浏览练习；持续困扰时请向专业人员寻求帮助。',
    steps: [
      { kind: 'train', id: 'box-breathing', title: '尝试箱式呼吸', why: '体验一段简短的节奏呼吸练习。', task: '保持舒适即可，不要勉强屏息；若头晕或不适，立即停止并恢复自然呼吸。', minutes: 3 },
      { kind: 'method', id: 'abc', title: '梳理事件与想法', why: '练习区分发生的事、想法与感受。', task: '只记录你愿意回看的内容；练习不是否定感受，也不要求马上找到“积极想法”。', minutes: 5 },
      { kind: 'method', id: 'threegood', title: '留意积极经验（选做）', why: '留意日常中对自己有意义的积极经验。', task: '如果这个练习不适合当前状态，可以跳过；无需强迫自己觉得积极。', minutes: 5, optional: true },
      { kind: 'method', id: 'mindful', title: '练习正念呼吸', why: '尝试把注意力温和地带回当下。', task: '走神很正常；发现走神并温和地回来，就是练习的一部分。', minutes: 5 },
      { kind: 'assess', id: 'gad7', title: '观察近期焦虑感受', why: '可选的自我观察量表，不用于诊断。', minutes: 5, optional: true },
      {
        kind: 'reflect',
        id: 'emotion-plan',
        title: '选一个适合自己的练习',
        why: '总结哪种练习让你感到相对合适，并为自己设定边界。',
        prompt: '你愿意在什么情境下尝试哪种练习？出现什么感受时会停下来或换一种方式？',
        placeholder: '例如：工作间隙可以试 1 分钟自然呼吸；如果感到不舒服就停止，改为睁眼观察周围。',
        minutes: 5,
        optional: true,
      },
    ],
  },
  {
    id: 'action-start',
    goal: 'action',
    name: '从拖延到开始行动',
    icon: '🚀',
    color: '#d97706',
    tagline: '把一件想做的事拆成今天就能开始的小行动。',
    persona: '有想做的事，却常卡在开始或推进上的用户',
    why: '先看清愿望与障碍，再降低启动难度，为行动留出可执行的时间。',
    objective: '选一件近期在拖延的事，写出更小的开始动作和一个障碍应对方案。',
    outcome: '带走一份包含开始动作、触发时机和干扰应对方式的行动计划。',
    totalMinutes: 22,
    cadence: '可以一次完成，也可以先尝试其中一个小步骤。',
    steps: [
      { kind: 'method', id: 'woop', title: '看清愿望与障碍', why: '把想要的结果和最可能遇到的阻碍放在一起考虑。', task: '选择一件近期在拖延的事；如果目标太大，先缩小到一个可控部分。', minutes: 6 },
      { kind: 'method', id: 'tinyhabits', title: '缩小到第一步', why: '把行动缩到容易开始的程度，并找一个稳定的提示。', task: '把“开始做”改成一个几分钟内能完成的动作，避免把没开始归咎于意志力。', minutes: 6 },
      { kind: 'method', id: 'pomodoro', title: '为行动留出时间', why: '用一段明确的时间保护第一次尝试。', task: '安排一次短时行动，时长可以少于 25 分钟；计时不适合你时，保留明确的开始时间即可。', minutes: 5 },
      {
        kind: 'reflect',
        id: 'action-plan',
        title: '写下启动计划',
        why: '把路线中的想法整合成一次具体尝试。',
        prompt: '你准备在什么时候、从哪个最小动作开始？最可能遇到什么障碍，出现时准备怎么应对？',
        placeholder: '例如：明天早餐后打开文档，先写三个标题；如果忍不住看消息，就把手机放到另一个房间。',
        minutes: 5,
        optional: true,
      },
    ],
  },
  {
    id: 'relaxation',
    goal: 'relax',
    name: '练习放松与休息',
    icon: '🌙',
    color: '#0f766e',
    tagline: '尝试短时呼吸与正念练习，找到适合自己的放松方式。',
    persona: '想在日常间隙尝试放松练习的用户',
    why: '从舒适、可暂停的体验开始，不要求立刻改变情绪或睡眠。',
    objective: '体验不同的轻量练习，选择一种自己愿意在日常尝试的方式。',
    outcome: '带走一个放松练习选择，以及感到不适时暂停或改用自然呼吸的边界。',
    totalMinutes: 18,
    cadence: '按自己的节奏体验；练习时可以睁眼，也可以随时停止。',
    disclaimer: '这是一般放松练习，不是睡眠治疗或心理治疗。任何时候感到不适，都可以停止并恢复自然呼吸。',
    steps: [
      { kind: 'train', id: 'mindfulness', title: '体验正念呼吸', why: '用舒适的节奏把注意力轻轻带回呼吸。', task: '不必追求特定感受；若跟随节奏让你不舒服，立即停止并恢复自然呼吸。', minutes: 4 },
      { kind: 'method', id: 'mindful', title: '了解正念练习', why: '看看如何把温和的觉察带进日常间隙。', task: '走神很正常；可以睁眼留意周围，也可以随时结束练习。', minutes: 5 },
      { kind: 'train', id: 'resonance', title: '尝试缓慢呼吸（选做）', why: '在愿意的情况下体验另一种平缓节奏。', task: '只在感觉舒适时尝试；不必刻意深呼吸，出现不适就停止并恢复自然呼吸。', minutes: 4, optional: true },
      {
        kind: 'reflect',
        id: 'relaxation-choice',
        title: '选择适合自己的练习',
        why: '记录你愿意尝试的方式和暂停边界。',
        prompt: '哪种练习让你感觉相对自在？你愿意在什么情境下尝试，出现什么情况会暂停？',
        placeholder: '例如：午休时睁眼做 1 分钟自然呼吸；如果注意呼吸让我不舒服，就停止并观察周围。',
        minutes: 5,
        optional: true,
      },
    ],
  },
  {
    id: 'communication-practice',
    goal: 'communication',
    name: '练习一次清晰沟通',
    icon: '💬',
    color: '#be5673',
    tagline: '练习表达自己的需要，也为理解对方留出空间。',
    persona: '想更清楚地表达、倾听或梳理沟通议题的用户',
    why: '先整理自己想表达的内容，再选择一个合适、低风险的沟通场景。',
    objective: '为一次具体对话准备清晰表达，并考虑如何倾听对方的观点。',
    outcome: '带走一段包含事实、感受、需要和具体请求的表达草稿。',
    totalMinutes: 24,
    cadence: '可以先独立练习；选择合适时机再决定是否沟通。',
    disclaimer: '这是一项一般沟通练习，不保证对方会接受或回应。若沟通情境让你感到不安全，可以先暂停并寻求可信支持。',
    steps: [
      { kind: 'method', id: 'nvc', title: '整理表达内容', why: '把观察、感受、需要和请求分开，减少指责式表达。', task: '选择一个低风险话题，描述具体事实，避免给自己或对方贴标签。', minutes: 8 },
      { kind: 'method', id: 'grow', title: '梳理对话方向', why: '明确希望达成什么、目前情况如何，以及有哪些可行选项。', task: '如果对方暂时不愿沟通，可以先暂停；沟通不必强求一次解决。', minutes: 6 },
      { kind: 'method', id: 'johari', title: '考虑反馈与边界（选做）', why: '思考哪些内容愿意分享，以及是否适合邀请反馈。', task: '只在彼此信任且自愿的情况下分享或邀请反馈，不需要透露不愿公开的内容。', minutes: 5, optional: true },
      {
        kind: 'reflect',
        id: 'communication-draft',
        title: '准备一段表达',
        why: '把想法整理成一段尊重自己、也留有倾听空间的话。',
        prompt: '你想描述什么事实、表达什么感受和需要，并提出怎样的具体请求？你还想了解对方什么？',
        placeholder: '例如：这周两次临时改时间（事实），我有些着急（感受），需要提前安排（需要）；下次能否尽量提前告诉我？',
        minutes: 5,
        optional: true,
      },
    ],
  },
]

const GOAL_LABELS = {
  self: '想更了解自己',
  focus: '想提升专注',
  emotion: '想调节压力或情绪',
  action: '想减少拖延',
  relax: '想练习放松',
  communication: '想提升沟通',
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
    tint: hexToRgba(course.color, 0.12),
    steps: course.steps.map((step) => {
      if (step.kind === 'reflect') {
        return Object.assign({}, step, {
          name: '路线回顾',
          icon: '📝',
          color: course.color,
          isReflection: true,
        })
      }
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
