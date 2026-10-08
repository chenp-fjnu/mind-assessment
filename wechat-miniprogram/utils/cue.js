// 语音线索播放：assets/audio/<name>.mp3（由 tools/gen-audio.ps1 生成），离线可用。
// 单例 InnerAudioContext 复用：听觉类游戏为串行播放，新线索直接打断上一条。
// 文件缺失/环境不支持时静默降级（游戏逻辑不依赖声音也能运行）。
let audio = null

function getAudio() {
  if (audio) return audio
  try {
    if (!wx.createInnerAudioContext) return null
    audio = wx.createInnerAudioContext()
    audio.obeyMuteSwitch = false
    audio.volume = 1
  } catch (e) {
    audio = null
  }
  return audio
}

// 播放一条语音线索（name 对应 assets/audio/<name>.mp3）
function play(name) {
  try {
    const a = getAudio()
    if (!a) return
    a.stop()
    a.src = '/assets/audio/' + name + '.mp3'
    a.play()
  } catch (e) { /* ignore */ }
}

function stop() {
  try {
    if (audio) audio.stop()
  } catch (e) { /* ignore */ }
}

function destroy() {
  try {
    if (audio) {
      audio.destroy()
      audio = null
    }
  } catch (e) { /* ignore */ }
}

module.exports = { play, stop, destroy }
