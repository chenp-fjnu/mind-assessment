const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 2, observer() { this.reset() } },
  },
  data: {
    trials: 10,
    list: [],
    idx: 0,
    cur: null,
    phase: 'idle',
    correct: 0,
    total: 0,
  },
  lifetimes: {
    attached() { this.reset() },
  },
  methods: {
    reset() {
      const seed = mod.generate(this.data.level)
      this.setData({
        trials: seed.trials,
        list: seed.list,
        idx: 0,
        cur: seed.list[0] || null,
        phase: 'idle',
        correct: 0,
        total: 0,
      })
    },
    start() {
      if (this.data.phase !== 'idle' && this.data.phase !== 'done') return
      this.setData({ phase: 'show', cur: this.data.list[0] })
    },
    onAnswer(e) {
      if (this.data.phase !== 'show') return
      const said = e.currentTarget.dataset.ans === '1'
      const ok = said === this.data.cur.answer
      const correct = this.data.correct + (ok ? 1 : 0)
      const total = this.data.total + 1
      const next = this.data.idx + 1
      if (next >= this.data.trials) {
        const result = mod.score({ correct, total })
        this.setData({ phase: 'done' })
        this.triggerEvent('finish', result)
      } else {
        this.setData({ correct, total, idx: next, cur: this.data.list[next] })
      }
    },
  },
})
