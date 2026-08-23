// 正念呼吸引导（Mindfulness）—— 纯逻辑 + 元数据（可单测）
function generate(level) {
  const phases = [
    { label: '吸气', dur: 3 },
    { label: '呼气', dur: 3 },
  ]
  const cycles = level
  const prompts = [
    '把注意力放在呼吸上',
    '感受空气流经鼻腔',
    '肩膀放松，放下杂念',
    '此刻只属于你自己',
  ]
  return { cycles, phases, prompts }
}

function score(state) {
  const cycles = state.cycles || 0
  return { cycles, score: cycles }
}

module.exports = {
  id: 'mindfulness',
  name: '正念呼吸',
  dim: 'relax',
  dimLabel: '放松正念',
  icon: '🧘',
  color: '#34d399',
  desc: '缓慢均速呼吸并跟随引导语，训练专注与放松。',
  reference: 'shuertefangge.com「正念呼吸引导」',
  levels: [
    { value: 4, label: '4 轮' },
    { value: 6, label: '6 轮' },
    { value: 8, label: '8 轮' },
  ],
  metric: { key: 'cycles', label: '完成轮数', unit: '轮', better: 'higher' },
  generate,
  score,
}
