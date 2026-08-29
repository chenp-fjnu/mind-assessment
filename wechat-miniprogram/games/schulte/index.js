// 舒尔特方格（Schulte Grid）—— 纯逻辑 + 元数据（可单测）
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = arr[i]
    arr[i] = arr[j]
    arr[j] = t
  }
  return arr
}

// level = 网格边长（3~9）
function generate(size) {
  const total = size * size
  const nums = []
  for (let i = 1; i <= total; i++) nums.push(i)
  shuffle(nums)
  return { size, cells: nums }
}

// state: { size, time(秒), errors }
function score(state) {
  const total = state.size * state.size
  const time = state.time || 0
  const errors = state.errors || 0
  // 基准：每格约 1 秒为优良；超出与错误均扣分
  const ideal = total
  const penalty = Math.max(0, time - ideal) * 2 + errors * 5
  const score = Math.max(0, Math.round(1000 - penalty))
  return { time, errors, score, size: state.size }
}

// 参考常模（秒）。来源：舒尔特方格公开评分标准（shuertefangge.com 等），按年龄组给出
// 优秀 / 良好 / 及格 的用时上限（越短越好）。3×3/4×4/5×5/7×7 为公开常模；
// 6×6/8×8/9×9 未在公开常模覆盖，由相邻尺寸的公开值按格数线性插值估算，仅供参考。
const AGE_GROUPS = ['3-5', '6-10', '11-17', '18+']

module.exports = {
  id: 'schulte',
  name: '舒尔特方格',
  dim: 'attention',
  dimLabel: '注意力',
  icon: '🔢',
  color: '#7c3aed',
  desc: '按 1→N 顺序尽快点选，训练视觉搜索速度与专注度。',
  reference: '按年龄组对比优秀/良好/及格常模（公开评分标准，6/8/9 为相邻尺寸估算）',
  hot: true,
  levels: [
    { value: 3, label: '3×3 入门' },
    { value: 4, label: '4×4' },
    { value: 5, label: '5×5 标准' },
    { value: 6, label: '6×6' },
    { value: 7, label: '7×7' },
    { value: 8, label: '8×8' },
    { value: 9, label: '9×9 挑战' },
  ],
  metric: { key: 'time', label: '用时', unit: 's', better: 'lower' },
  generate,
  score,
  ageGroups: AGE_GROUPS,
  ageGroupFromBirthday,
  getReference,
  compare,
}

const BAND_LABELS = { excellent: '优秀', good: '良好', pass: '及格', below: '待提升' }
// 每个尺寸：各年龄组 [优秀上限, 良好上限, 及格上限]（秒）
const REFERENCES = {
  3: {
    '3-5': [9, 12, 20], '6-10': [8, 10, 15], '11-17': [6, 9, 14], '18+': [5, 8, 12],
  },
  4: {
    '3-5': [16, 20, 30], '6-10': [14, 18, 25], '11-17': [12, 17, 20], '18+': [10, 16, 17],
  },
  5: {
    '3-5': [35, 45, 58], '6-10': [28, 34, 45], '11-17': [25, 29, 35], '18+': [20, 25, 30],
  },
  6: {
    '3-5': [69, 84, 100], '6-10': [61, 73, 89], '11-17': [54, 66, 79], '18+': [47, 59, 71],
  },
  7: {
    '3-5': [109, 130, 150], '6-10': [99, 120, 140], '11-17': [89, 110, 130], '18+': [79, 100, 120],
  },
  8: {
    '3-5': [155, 183, 208], '6-10': [143, 174, 199], '11-17': [129, 161, 189], '18+': [116, 147, 176],
  },
  9: {
    '3-5': [208, 243, 273], '6-10': [194, 235, 267], '11-17': [174, 218, 257], '18+': [158, 200, 240],
  },
}

// 由生日（YYYY-MM-DD）推算年龄组；无生日返回 null（调用方默认按 18+ 处理）
function ageGroupFromBirthday(birthday) {
  if (!birthday || !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) return null
  const y = Number(birthday.slice(0, 4))
  if (!y) return null
  const now = new Date()
  let age = now.getFullYear() - y
  const md = (now.getMonth() + 1) * 100 + now.getDate()
  const bmd = Number(birthday.slice(5, 7)) * 100 + Number(birthday.slice(8, 10))
  if (bmd > md) age -= 1
  if (age < 0) age = 0
  if (age <= 5) return '3-5'
  if (age <= 10) return '6-10'
  if (age <= 17) return '11-17'
  return '18+'
}

// 取指定尺寸与年龄组的常模区间；无该尺寸返回 null
function getReference(size, ageGroup) {
  const bands = REFERENCES[size]
  if (!bands) return null
  const ag = bands[ageGroup] ? ageGroup : '18+'
  return {
    ageGroup: ag,
    excellent: bands[ag][0],
    good: bands[ag][1],
    pass: bands[ag][2],
    estimated: size === 6 || size === 8 || size === 9,
  }
}

// 将一次成绩与常模对比，返回所处区间与解读；无可比常模或时间缺失返回 null
function compare(size, timeSec, ageGroup) {
  const ref = getReference(size, ageGroup)
  if (!ref || timeSec == null) return null
  let band = 'below'
  if (timeSec <= ref.excellent) band = 'excellent'
  else if (timeSec <= ref.good) band = 'good'
  else if (timeSec <= ref.pass) band = 'pass'
  const diff = Math.round((timeSec - ref.excellent) * 10) / 10
  const detail =
    band === 'excellent'
      ? diff >= 0 ? '已进入优秀区间，优于优秀线 ' + diff + 's' : '已进入优秀区间'
      : '距优秀线慢 ' + diff + 's'
  return { ...ref, band, bandLabel: BAND_LABELS[band], detail }
}
