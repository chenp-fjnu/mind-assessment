// 颜色记忆探针（color-probe）—— 纯逻辑 + 元数据（可单测）
// 玩法：先看一组色块 → 色块消失 → 出现一个带色数字：
//   数字是 05 / 15 → 按「空格」；
//   否则判断该颜色是否在刚才的色块组里：出现过 → J，没出现 → F。
const COLORS = [
  { key: 'red', hex: '#ef4444' },
  { key: 'blue', hex: '#3b82f6' },
  { key: 'green', hex: '#22c55e' },
  { key: 'yellow', hex: '#f59e0b' },
]
const SPECIALS = ['05', '15']
const NORMALS = ['23', '47', '58', '61', '72', '89', '34', '76']
const TRIALS = [4, 6, 8]

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = a[i]
    a[i] = a[j]
    a[j] = t
  }
  return a
}

function answerOf(setKeys, colorKey, digits) {
  if (SPECIALS.indexOf(digits) >= 0) return 'space'
  return setKeys.indexOf(colorKey) >= 0 ? 'J' : 'F'
}

function makeTrial(set, color, digits, setKeys) {
  return {
    set: set.map((c) => ({ key: c.key, hex: c.hex })),
    color,
    digits,
    answer: answerOf(setKeys, color.key, digits),
  }
}

function generate(level) {
  const lv = level >= 1 && level <= 3 ? level : 1
  const n = TRIALS[lv - 1]
  const trials = []
  // 覆盖三种作答：J（出现过）、F（没出现）、空格（05/15），再随机补足
  const forced = [
    { special: false, inSet: true },
    { special: false, inSet: false },
    { special: true, inSet: false },
  ]
  for (let i = 0; i < n; i++) {
    const f = i < forced.length ? forced[i] : null
    // 需要「组外颜色」时必须留出组外颜色，故 set 固定取 3 色
    const setSize = f && !f.inSet ? 3 : Math.random() < 0.5 ? 3 : 4
    const set = shuffle(COLORS).slice(0, setSize)
    const setKeys = set.map((c) => c.key)
    let color
    let digits
    if (f) {
      if (f.inSet) color = set[Math.floor(Math.random() * set.length)]
      else {
        const outside = COLORS.filter((c) => setKeys.indexOf(c.key) < 0)
        color = outside[Math.floor(Math.random() * outside.length)]
      }
      digits = f.special ? SPECIALS[Math.floor(Math.random() * SPECIALS.length)] : NORMALS[Math.floor(Math.random() * NORMALS.length)]
    } else {
      color = COLORS[Math.floor(Math.random() * COLORS.length)]
      digits = Math.random() < 0.25
        ? SPECIALS[Math.floor(Math.random() * SPECIALS.length)]
        : NORMALS[Math.floor(Math.random() * NORMALS.length)]
    }
    trials.push(makeTrial(set, color, digits, setKeys))
  }
  // 强制布置后重排顺序（保留首题不为 05/15 亦可，这里仅打散）
  const order = shuffle(trials.map((_, i) => i))
  return { n, trials: order.map((i) => trials[i]) }
}

function score(state) {
  const total = state.total || 0
  const correct = state.correct || 0
  const accuracy = total ? correct / total : 0
  return { correct, total, accuracy, score: Math.round(accuracy * 1000) }
}

module.exports = {
  id: 'color-probe',
  name: '颜色记忆探针',
  dim: 'memory',
  dimLabel: '工作记忆',
  icon: '🎨',
  color: '#f97316',
  desc: '记住一组色块后消失，判断带色数字的颜色是否出现过（J/F），数字为 05/15 时按空格。',
  reference: '工作记忆探针任务（颜色匹配变式）',
  levels: [
    { value: 1, label: '4 组' },
    { value: 2, label: '6 组' },
    { value: 3, label: '8 组' },
  ],
  metric: { key: 'score', label: '得分', unit: '', better: 'higher' },
  generate,
  score,
  answerOf,
}
