// 记忆配对（Memory Match）—— 纯逻辑 + 元数据（可单测）
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const t = arr[i]
    arr[i] = arr[j]
    arr[j] = t
  }
  return arr
}

// level = 配对数量
function generate(pairs) {
  const deck = []
  for (let i = 0; i < pairs; i++) {
    deck.push(i)
    deck.push(i)
  }
  shuffle(deck)
  return { pairs, deck }
}

// state: { pairs, time(秒), moves }
function score(state) {
  const time = state.time || 0
  const moves = state.moves || 0
  const ideal = state.pairs * 2
  const penalty = Math.max(0, time - state.pairs * 3) * 2 + Math.max(0, moves - ideal) * 3
  const score = Math.max(0, Math.round(1000 - penalty))
  return { time, moves, score, pairs: state.pairs }
}

module.exports = {
  id: 'memory-match',
  name: '记忆配对',
  dim: 'memory',
  dimLabel: '工作记忆',
  icon: '🃏',
  color: '#0ea5e9',
  desc: '翻开卡片找出成对图案，锻炼视觉短时记忆。',
  reference: 'FreeFocusGames 记忆配对范式',
  symbols: ['🍎', '🍌', '🍇', '🍓', '🍑', '🍒', '🥝', '🍉', '🍊', '🍋', '🍐', '🫐', '🥥', '🍍', '🥭', '🍅'],
  levels: [
    { value: 6, label: '6 对 简单' },
    { value: 8, label: '8 对' },
    { value: 12, label: '12 对' },
    { value: 16, label: '16 对 困难' },
  ],
  metric: { key: 'time', label: '用时', unit: 's', better: 'lower' },
  generate,
  score,
}
