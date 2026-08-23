// 威斯康星卡片分类（WCST）—— 纯逻辑 + 元数据（可单测）
const COLORS = ['red', 'green', 'blue']
const SHAPES = ['○', '△', '□']
const COUNTS = [1, 2, 3]
const DIMS = ['color', 'shape', 'count']

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}
function other(arr, val) {
  const opts = arr.filter((v) => v !== val)
  return opts[Math.floor(Math.random() * opts.length)]
}
function cardKey(c) {
  return c.color + c.shape + c.count
}

function generate(level) {
  const trials = level * 4
  const list = []
  for (let i = 0; i < trials; i++) {
    const target = { color: pick(COLORS), shape: pick(SHAPES), count: pick(COUNTS) }
    const rule = pick(DIMS)
    const correct = { color: target.color, shape: target.shape, count: target.count }
    if (rule !== 'color') correct.color = other(COLORS, target.color)
    if (rule !== 'shape') correct.shape = other(SHAPES, target.shape)
    if (rule !== 'count') correct.count = other(COUNTS, target.count)
    const options = [correct]
    while (options.length < 4) {
      const o = {
        color: other(COLORS, target.color),
        shape: other(SHAPES, target.shape),
        count: other(COUNTS, target.count),
      }
      if (options.every((x) => cardKey(x) !== cardKey(o))) options.push(o)
    }
    // 打乱选项顺序
    for (let k = options.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1))
      const t = options[k]
      options[k] = options[j]
      options[j] = t
    }
    list.push({ target, rule, options, ans: options.indexOf(correct) })
  }
  return { trials, list, dims: DIMS }
}

function score(state) {
  const total = state.total || 0
  const correct = state.correct || 0
  const accuracy = total ? correct / total : 0
  return { correct, total, accuracy, score: Math.round(accuracy * 1000) }
}

module.exports = {
  id: 'wisconsin',
  name: '威斯康星',
  dim: 'exec',
  dimLabel: '执行功能',
  icon: '🃏',
  color: '#6366f1',
  desc: '按给定维度（颜色/形状/数量）把卡片归到匹配的那一组，训练抽象分类。',
  reference: 'shuertefangge.com「威斯康星卡片分类」',
  levels: [
    { value: 1, label: '4 题' },
    { value: 2, label: '8 题' },
    { value: 3, label: '12 题' },
  ],
  metric: { key: 'score', label: '得分', unit: '', better: 'higher' },
  generate,
  score,
}
