// 4-7-8 呼吸法（Box Breathing 变体）—— 纯逻辑 + 元数据（可单测）
function generate(level) {
  const phases = [
    { label: '吸气', dur: 4 },
    { label: '屏息', dur: 7 },
    { label: '呼气', dur: 8 },
  ]
  const cycles = level
  return { cycles, phases }
}

function score(state) {
  const cycles = state.cycles || 0
  return { cycles, score: cycles }
}

module.exports = {
  id: 'breath-478',
  family: 'breath',
  name: '4-7-8 呼吸',
  dim: 'relax',
  dimLabel: '放松正念',
  icon: '🌬️',
  color: '#14b8a6',
  desc: '吸气 4 秒、屏息 7 秒、呼气 8 秒，帮助快速放松助眠。',
  reference: 'shuertefangge.com「4-7-8 呼吸法」',
  levels: [
    { value: 3, label: '3 轮' },
    { value: 5, label: '5 轮' },
    { value: 8, label: '8 轮' },
  ],
  metric: { key: 'cycles', label: '完成轮数', unit: '轮', better: 'higher' },
  generate,
  score,
}
