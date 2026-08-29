// 音效工具：基于 WebAudio 合成纯音，无需任何音频资源文件，离线可用。
// - 声音直接走系统音量（跟随系统声音），不提供应用内开关
// - 对不支持 WebAudio 的环境做静默降级，调用方无需关心兼容性
// - 所有方法幂等且异常安全；游戏组件中直接调用即可
let ctx = null

// 懒创建音频上下文；仅在首次发声时创建，且对异常静默降级
function getCtx() {
  if (ctx) {
    try {
      if (ctx.state === 'suspended' && ctx.resume) ctx.resume()
    } catch (e) { /* ignore */ }
    return ctx
  }
  try {
    if (wx.createWebAudioContext) {
      ctx = wx.createWebAudioContext()
    }
  } catch (e) {
    ctx = null
  }
  return ctx
}

// 播放一个带淡入淡出包络的单音，避免爆音
function tone(freq, duration, type, volume) {
  const c = getCtx()
  if (!c) return
  try {
    const t0 = c.currentTime
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = type || 'sine'
    osc.frequency.setValueAtTime(freq, t0)
    const v = volume == null ? 0.2 : volume
    gain.gain.setValueAtTime(0.0001, t0)
    gain.gain.exponentialRampToValueAtTime(v, t0 + 0.006)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
    osc.connect(gain)
    gain.connect(c.destination)
    osc.start(t0)
    osc.stop(t0 + duration + 0.02)
  } catch (e) { /* ignore */ }
}

// 短暂上扬音（连点/正确反馈）
function tap() {
  tone(680, 0.045, 'square', 0.1)
}
// 命中（打地鼠、正确选择）
function hit() {
  tone(880, 0.08, 'triangle', 0.2)
}
// 失误/踩雷（低频下挫）
function miss() {
  tone(150, 0.2, 'sawtooth', 0.18)
}
// 完成/成功（两音上行）
function success() {
  tone(660, 0.1, 'sine', 0.2)
  setTimeout(() => tone(990, 0.16, 'sine', 0.2), 90)
}
// 失败/过早（两音下行）
function fail() {
  tone(330, 0.14, 'sawtooth', 0.16)
  setTimeout(() => tone(220, 0.24, 'sawtooth', 0.16), 120)
}
// 节奏 tick（倒计时等）
function tick() {
  tone(520, 0.04, 'square', 0.1)
}

module.exports = {
  tap,
  hit,
  miss,
  success,
  fail,
  tick,
}
