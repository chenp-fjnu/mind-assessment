// 听觉 CPT（aud-cpt）—— 纯逻辑 + 元数据（可单测）
// 玩法：听字母/数字混合序列，仅当「K」之后紧跟数字「0」时按空格（序列条件检测）。
const LETTERS = ['a', 'd', 'f', 'j', 'k', 'l', 's', 'x']
const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
const COUNTS = [12, 18, 24]

function randLetter() {
  return LETTERS[Math.floor(Math.random() * LETTERS.length)]
}

function randDigit(includeZero) {
  const d = DIGITS[Math.floor(Math.random() * DIGITS.length)]
  if (includeZero) return d
  return d === '0' ? DIGITS[1 + Math.floor(Math.random() * 9)] : d
}

function generate(level) {
  const lv = level >= 1 && level <= 3 ? level : 1
  const n = COUNTS[lv - 1]
  const list = []
  for (let i = 0; i < n; i++) {
    const prev = i > 0 ? list[i - 1] : null
    if (i === 0) {
      list.push({ type: 'letter', value: randLetter() })
      continue
    }
    const r = Math.random()
    if (prev === 'k' && r < 0.7) {
      // K 之后：有机会给 0（目标），也给非 0 数字（诱饵）
      list.push({ type: 'digit', value: Math.random() < 0.6 ? '0' : randDigit(false) })
    } else if (r < 0.75) {
      // 字母流（一定概率给 K 布置目标）
      list.push({ type: 'letter', value: Math.random() < 0.3 ? 'k' : randLetter() })
    } else {
      // 与 K 无关的数字（可能给 0 制造虚报陷阱）
      list.push({ type: 'digit', value: Math.random() < 0.2 ? '0' : randDigit(false) })
    }
  }
  // 保证目标数量：过少会让玩家几乎不用按压，强制在随机位置布置「k → 0」
  const need = Math.max(2, Math.round(n * 0.15))
  let guard = 0
  while (list.filter((it, i) => isTarget(list, i)).length < need && guard++ < 60) {
    const i = 2 + Math.floor(Math.random() * (n - 2))
    if (isTarget(list, i)) continue
    list[i - 1] = { type: 'letter', value: 'k' }
    list[i] = { type: 'digit', value: '0' }
  }
  const targets = list.map((it, i) => isTarget(list, i))
  return { n, list, targets }
}

// 序列规则：当前为 0 且前一项为 k（生成与计分共用）
function isTarget(list, i) {
  return i > 0 && list[i].type === 'digit' && list[i].value === '0' && list[i - 1].value === 'k'
}

// 线索素材键（assets/audio/<key>.mp3）
function cueKey(item) {
  return (item.type === 'letter' ? 'l' : 'd') + item.value
}

function score(state) {
  const total = state.total || 0
  const correct = state.correct || 0
  const accuracy = total ? correct / total : 0
  return { correct, total, accuracy, score: Math.round(accuracy * 1000) }
}

module.exports = {
  id: 'aud-cpt',
  name: '听觉 CPT',
  dim: 'attention',
  dimLabel: '注意力',
  icon: '🎧',
  color: '#14b8a6',
  desc: '听字母与数字混合序列，只有「K」之后紧跟「0」才按空格，训练持续注意与序列监控。',
  reference: '持续注意反应任务 CPT（听觉序列变式）',
  levels: [
    { value: 1, label: '12 个' },
    { value: 2, label: '18 个' },
    { value: 3, label: '24 个' },
  ],
  metric: { key: 'score', label: '得分', unit: '', better: 'higher' },
  generate,
  score,
  isTarget,
  cueKey,
}
