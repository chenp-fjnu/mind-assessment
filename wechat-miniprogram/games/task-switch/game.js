const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 1, observer() { this.reset() } },
  },
  data: {
    trials: 6,
    list: [],
    idx: 0,
    cur: null,
    phase: 'idle',
    correct: 0,
    total: 0,
    startT: 0,
    time: 0,
  },
  lifetimes: {
    attached() { this.reset() },
  },
  methods: {
    reset() {
      const seed = mod.generate(this.data.level)
      this.setData({ trials: seed.trials, list: seed.list, idx: 0, cur: null, phase: 'idle', correct: 0, total: 0, time: 0 })
    },
    start() {
      if (this.data.phase !== 'idle' && this.data.phase !== 'done') return
      this.setData({ correct: 0, total: 0, idx: 0, time: 0, startT: Date.now() })
      this.next()
    },
    next() {
      if (this.data.idx >= this.data.trials) {
        const time = (Date.now() - this.data.startT) / 1000
        const result = mod.score({ correct: this.data.correct, total: this.data.total })
        result.time = time
        this.setData({ phase: 'done' })
        this.triggerEvent('finish', result)
        return
      }
      this.setData({ cur: this.data.list[this.data.idx], phase: 'play' })
    },
    onPick(e) {
      if (this.data.phase !== 'play') return
      const side = e.currentTarget.dataset.side === 'l' ? 'l' : 'r'
      let expected
      if (this.data.cur.rule === 'color') expected = this.data.cur.color === 'red' ? 'l' : 'r'
      else expected = this.data.cur.num % 2 === 1 ? 'l' : 'r'
      const ok = side === expected
      const correct = this.data.correct + (ok ? 1 : 0)
      const total = this.data.total + 1
      const idx = this.data.idx + 1
      this.setData({ correct, total, idx })
      this.next()
    },
  },
})
