// 数字 N-Back 变式（digit-n2）—— 纯逻辑 + 元数据（可单测）
// 玩法：听数字流，当前数字与 2 步前相同则按「空格」（2-back 目标检测）。
const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
const COUNTS = [10, 20, 30]
const HIT_RATE = 0.35

function randDigit(exclude) {
  let d = DIGITS[Math.floor(Math.random() * DIGITS.length)]
  if (exclude != null) {
    let guard = 0
    while (d === exclude && guard++ < 10) d = DIGITS[Math.floor(Math.random() * DIGITS.length)]
  }
  return d
}

function generate(level) {
  const lv = level >= 1 && level <= 3 ? level : 1
  const n = COUNTS[lv - 1]
  const list = []
  for (let i = 0; i < n; i++) {
    if (i >= 2 && Math.random() < HIT_RATE) list.push(list[i - 2])
    else list.push(randDigit(i >= 2 ? list[i - 2] : null))
  }
  // 标记目标位（便于单测/复盘；游戏运行时按同样规则判定）
  const targets = list.map((d, i) => i >= 2 && d === list[i - 2])
  return { n, list, targets }
}

// 是否为 2-back 目标（生成与计分共用同一规则）
function isTarget(list, i) {
  return i >= 2 && list[i] === list[i - 2]
}

function score(state) {
  const total = state.total || 0
  const correct = state.correct || 0
  const accuracy = total ? correct / total : 0
  return { correct, total, accuracy, score: Math.round(accuracy * 1000) }
}

module.exports = {
  id: 'digit-n2',
  name: '数字 N-Back',
  dim: 'memory',
  dimLabel: '工作记忆',
  icon: '🔢',
  color: '#8b5cf6',
  desc: '听数字流，与 2 步前相同的数字按空格，训练工作记忆更新与监控。',
  reference: '听觉 2-Back（N-Back 范式）',
  levels: [
    { value: 1, label: '10 个' },
    { value: 2, label: '20 个' },
    { value: 3, label: '30 个' },
  ],
  metric: { key: 'score', label: '得分', unit: '', better: 'higher' },
  generate,
  score,
  isTarget,
}
