const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 20, observer() { this.reset() } },
  },
  data: {
    trials: 20,
    list: [],
    idx: 0,
    arrows: [],
    phase: 'idle',
    correct: 0,
    total: 0,
    times: [],
    ansTs: 0,
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
        arrows: [],
        phase: 'idle',
        correct: 0,
        total: 0,
        times: [],
        ansTs: 0,
      })
    },
    start() {
      if (this.data.phase !== 'idle' && this.data.phase !== 'done') return
      this.showTrial()
    },
    showTrial() {
      const cur = this.data.list[this.data.idx]
      const arrows = []
      for (let i = 0; i < 5; i++) {
        let left
        if (i === 2) left = cur.dir === 'left'
        else left = cur.congruent ? cur.dir === 'left' : cur.dir === 'right'
        arrows.push({ left, glyph: left ? '←' : '→' })
      }
      this.setData({ phase: 'show', arrows, ansTs: Date.now() })
    },
    onAnswer(e) {
      if (this.data.phase !== 'show') return
      const dir = e.currentTarget.dataset.dir
      const cur = this.data.list[this.data.idx]
      const ok = dir === cur.dir
      const correct = this.data.correct + (ok ? 1 : 0)
      const total = this.data.total + 1
      const rt = Date.now() - this.data.ansTs
      const times = this.data.times.concat(rt)
      const next = this.data.idx + 1
      if (next >= this.data.trials) {
        this.clearAndFinish(correct, total, times)
      } else {
        this.setData({ correct, total, times, idx: next })
        this.showTrial()
      }
    },
    clearAndFinish(correct, total, times) {
      const result = mod.score({ correct, total, times })
      this.setData({ phase: 'done' })
      this.triggerEvent('finish', result)
    },
  },
})
