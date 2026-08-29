const mod = require('./index')
const sound = require('../../utils/sound')

Component({
  properties: {
    level: { type: Number, value: 2, observer() { this.reset() } },
  },
  data: {
    duration: 10,
    clicks: 0,
    left: 0,
    leftText: '',
    cps: 0,
    cpsText: '0.00',
    phase: 'idle', // idle | play | done
    flash: false,
  },
  lifetimes: {
    attached() { this.reset() },
    detached() { this.clearTimers() },
  },
  methods: {
    clearTimers() {
      if (this._t) clearTimeout(this._t)
      if (this._iv) clearInterval(this._iv)
      this._t = this._iv = null
    },
    reset() {
      this.clearTimers()
      const seed = mod.generate(this.data.level)
      this.setData({
        duration: seed.duration,
        clicks: 0,
        left: seed.duration,
        leftText: String(seed.duration),
        cps: 0,
        cpsText: '0.00',
        phase: 'idle',
        flash: false,
      })
    },
    start() {
      if (this.data.phase !== 'idle' && this.data.phase !== 'done') return
      const duration = this.data.duration
      this.setData({
        clicks: 0,
        left: duration,
        leftText: duration.toFixed(1),
        cps: 0,
        cpsText: '0.00',
        phase: 'play',
        flash: false,
      })
      const end = Date.now() + duration * 1000
      this._iv = setInterval(() => {
        const left = Math.max(0, (end - Date.now()) / 1000)
        const elapsed = duration - left
        const cps = elapsed > 0 ? this.data.clicks / elapsed : 0
        this.setData({ left, leftText: left.toFixed(1), cps, cpsText: cps.toFixed(2) })
      }, 100)
      this._t = setTimeout(() => this.finish(), duration * 1000)
    },
    onTap() {
      if (this.data.phase === 'idle' || this.data.phase === 'done') {
        this.start()
        return
      }
      if (this.data.phase !== 'play') return
      this.setData({ clicks: this.data.clicks + 1 })
      this.flashTap()
      sound.tap()
      try { wx.vibrateShort({ type: 'light' }) } catch (e) { /* 不支持时忽略 */ }
    },
    flashTap() {
      if (this._flash) return
      this.setData({ flash: true })
      this._flash = setTimeout(() => { this._flash = null; this.setData({ flash: false }) }, 70)
    },
    finish() {
      this.clearTimers()
      const result = mod.score({ clicks: this.data.clicks, duration: this.data.duration })
      sound.success()
      this.setData({ phase: 'done' })
      this.triggerEvent('finish', result)
    },
  },
})
