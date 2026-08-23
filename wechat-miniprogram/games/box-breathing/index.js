// 箱式呼吸（Box Breathing）—— 纯逻辑 + 元数据（可单测）
const PHASES = [
  { key: 'inhale', label: '吸气', sec: 4 },
  { key: 'hold', label: '屏息', sec: 4 },
  { key: 'exhale', label: '呼气', sec: 4 },
  { key: 'hold2', label: '屏息', sec: 4 },
]

// level = 目标轮数
function generate(rounds) {
  return { rounds, phases: PHASES }
}

// state: { rounds(已完成), duration(秒) }
function score(state) {
  const rounds = state.rounds || 0
  const duration = state.duration || 0
  const score = rounds * 100 + Math.max(0, 240 - duration)
  return { rounds, duration, score }
}

module.exports = {
  id: 'box-breathing',
  family: 'breath',
  name: '箱式呼吸',
  dim: 'relax',
  dimLabel: '放松正念',
  icon: '🫁',
  color: '#10b981',
  desc: '4-4-4-4 节律引导呼吸，缓解紧张、复位专注。',
  reference: '美国海豹突击队 / 急救人员呼吸技术',
  levels: [
    { value: 3, label: '3 轮 轻松' },
    { value: 5, label: '5 轮' },
    { value: 8, label: '8 轮 沉浸' },
  ],
  metric: { key: 'rounds', label: '完成轮数', unit: '轮', better: 'higher' },
  generate,
  score,
  PHASES,
}
