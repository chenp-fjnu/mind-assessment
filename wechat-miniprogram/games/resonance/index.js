// 共振呼吸（Resonance Breathing）—— 纯逻辑 + 元数据（可单测）
function generate(level) {
  const phases = [
    { label: '吸气', dur: 4 },
    { label: '呼气', dur: 6 },
  ]
  const cycles = level
  return { cycles, phases }
}

function score(state) {
  const cycles = state.cycles || 0
  return { cycles, score: cycles }
}

module.exports = {
  id: 'resonance',
  name: '共振呼吸',
  dim: 'relax',
  dimLabel: '放松正念',
  icon: '🌊',
  color: '#38bdf8',
  desc: '吸气 4 秒、呼气 6 秒（约 6 次/分），调节心率变异性、缓解焦虑。',
  reference: 'shuertefangge.com「共振呼吸」',
  levels: [
    { value: 5, label: '5 轮' },
    { value: 8, label: '8 轮' },
    { value: 10, label: '10 轮' },
  ],
  metric: { key: 'cycles', label: '完成轮数', unit: '轮', better: 'higher' },
  generate,
  score,
}
