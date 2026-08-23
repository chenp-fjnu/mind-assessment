const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 1, observer() { this.reset() } },
  },
  data: {
    trials: 4,
    list: [],
    idx: 0,
    cur: null,
    phase: 'idle',
    correct: 0,
    total: 0,
    feedback: '',
  },
  lifetimes: {
    attached() { this.reset() },
    detached() { this.clearTimer() },
  },
  methods: {
    clearTimer() {
      if (this._t) clearTimeout(this._t)
      this._t = null
    },
    reset() {
      this.clearTimer()
      const seed = mod.generate(this.data.level)
      this.setData({ trials: seed.trials, list: seed.list, idx: 0, cur: null, phase: 'idle', correct: 0, total: 0, feedback: '' })
    },
    start() {
      if (this.data.phase !== 'idle' && this.data.phase !== 'done') return
      this.setData({ correct: 0, total: 0, idx: 0, feedback: '' })
      this.next()
    },
    next() {
      if (this.data.idx >= this.data.trials) {
        const result = mod.score({ correct: this.data.correct, total: this.data.total })
        this.setData({ phase: 'done' })
        this.triggerEvent('finish', result)
        return
      }
      const raw = this.data.list[this.data.idx]
      const expand = (c) => ({ ...c, glyphs: Array(c.count).fill(c.shape) })
      const cur = {
        target: expand(raw.target),
        rule: raw.rule,
        ans: raw.ans,
        options: raw.options.map(expand),
      }
      this.setData({ cur, phase: 'play', feedback: '' })
    },
    onPick(e) {
      if (this.data.phase !== 'play') return
      const i = parseInt(e.currentTarget.dataset.i, 10)
      const ok = i === this.data.cur.ans
      const correct = this.data.correct + (ok ? 1 : 0)
      const total = this.data.total + 1
      const idx = this.data.idx + 1
      this.setData({ correct, total, idx, feedback: ok ? '✓' : '✗', phase: 'feedback' })
      this._t = setTimeout(() => this.next(), 450)
    },
  },
})
