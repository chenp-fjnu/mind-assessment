const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 2, observer() { this.reset() } },
  },
  data: {
    duration: 10,
    clicks: 0,
    left: 0,
    phase: 'idle',
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
      this.setData({ duration: seed.duration, clicks: 0, left: seed.duration, phase: 'idle' })
    },
    start() {
      if (this.data.phase !== 'idle' && this.data.phase !== 'done') return
      this.setData({ clicks: 0, left: this.data.duration, phase: 'play' })
      const end = Date.now() + this.data.duration * 1000
      this._iv = setInterval(() => {
        const left = Math.max(0, Math.round((end - Date.now()) / 1000))
        this.setData({ left })
      }, 200)
      this._t = setTimeout(() => this.finish(), this.data.duration * 1000)
    },
    onTap() {
      if (this.data.phase !== 'play') return
      this.setData({ clicks: this.data.clicks + 1 })
    },
    finish() {
      this.clearTimers()
      const result = mod.score({ clicks: this.data.clicks })
      this.setData({ phase: 'done' })
      this.triggerEvent('finish', result)
    },
  },
})
