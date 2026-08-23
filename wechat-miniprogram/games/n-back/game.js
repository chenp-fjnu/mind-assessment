const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 1, observer() { this.reset() } },
  },
  data: {
    n: 1,
    trials: 20,
    seq: [],
    roundIdx: 0,
    shownPos: -1,
    phase: 'idle', // idle | show | answer | done
    correct: 0,
    total: 0,
    times: [],
    answerTs: 0,
  },
  lifetimes: {
    attached() { this.reset() },
    detached() { this.clearTimer() },
  },
  methods: {
    clearTimer() {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
    },
    reset() {
      this.clearTimer()
      const seed = mod.generate({ n: this.data.level, trials: 20 })
      this.setData({
        n: seed.n,
        trials: seed.trials,
        seq: seed.seq,
        roundIdx: 0,
        shownPos: -1,
        phase: 'idle',
        correct: 0,
        total: 0,
        times: [],
        answerTs: 0,
      })
    },
    start() {
      if (this.data.phase !== 'idle' && this.data.phase !== 'done') return
      this.showRound()
    },
    showRound() {
      const pos = this.data.seq[this.data.roundIdx]
      this.setData({ phase: 'show', shownPos: pos })
      this.timer = setTimeout(() => {
        this.setData({ phase: 'answer', shownPos: -1, answerTs: Date.now() })
      }, 700)
    },
    onAnswer(e) {
      if (this.data.phase !== 'answer') return
      const saidMatch = e.currentTarget.dataset.match === '1'
      const i = this.data.roundIdx
      const expected = i >= this.data.n && this.data.seq[i] === this.data.seq[i - this.data.n]
      const ok = saidMatch === expected
      const correct = this.data.correct + (ok ? 1 : 0)
      const total = this.data.total + 1
      const rt = Date.now() - this.data.answerTs
      const times = this.data.times.concat(rt)
      const next = i + 1
      if (next >= this.data.trials) {
        this.finish(correct, total, times)
      } else {
        this.setData({ correct, total, times, roundIdx: next, phase: 'show' })
        this.showRound()
      }
    },
    finish(correct, total, times) {
      this.clearTimer()
      const result = mod.score({ correct, total, times })
      this.setData({ phase: 'done' })
      this.triggerEvent('finish', result)
    },
  },
})
