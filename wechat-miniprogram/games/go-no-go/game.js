const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 1, observer() { this.reset() } },
  },
  data: {
    trials: 8,
    list: [],
    idx: 0,
    cur: null,
    phase: 'idle',
    correct: 0,
    total: 0,
  },
  lifetimes: {
    attached() { this.reset() },
    detached() { this.clearTimers() },
  },
  methods: {
    clearTimers() {
      if (this._stim) clearTimeout(this._stim)
      if (this._adv) clearTimeout(this._adv)
      this._stim = this._adv = null
    },
    reset() {
      this.clearTimers()
      const seed = mod.generate(this.data.level)
      this.setData({ trials: seed.trials, list: seed.list, idx: 0, cur: null, phase: 'idle', correct: 0, total: 0 })
    },
    start() {
      if (this.data.phase !== 'idle' && this.data.phase !== 'done') return
      this.setData({ correct: 0, total: 0, idx: 0 })
      this.showTrial()
    },
    showTrial() {
      if (this.data.idx >= this.data.trials) {
        const result = mod.score({ correct: this.data.correct, total: this.data.total })
        this.setData({ phase: 'done' })
        this.triggerEvent('finish', result)
        return
      }
      this._evaluated = false
      this.setData({ cur: this.data.list[this.data.idx], phase: 'play' })
      this._stim = setTimeout(() => this.score(false), 900)
    },
    onTap() {
      if (this.data.phase !== 'play' || this._evaluated) return
      this._evaluated = true
      clearTimeout(this._stim)
      this.score(true)
    },
    score(tapped) {
      const ok = tapped ? this.data.cur.go : !this.data.cur.go
      const correct = this.data.correct + (ok ? 1 : 0)
      const total = this.data.total + 1
      const idx = this.data.idx + 1
      this.setData({ correct, total, idx })
      this._adv = setTimeout(() => this.showTrial(), 250)
    },
  },
})
