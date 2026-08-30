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
    phase: 'idle', // idle | show | answer | done
    correct: 0,
    total: 0,
    showTime: 3000, // 显示时间 3秒
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
        cur: null,
        phase: 'idle',
        correct: 0,
        total: 0,
      })
    },
    start() {
      if (this.data.phase !== 'idle' && this.data.phase !== 'done') return
      this.setData({ correct: 0, total: 0, idx: 0 })
      this.showNext()
    },
    showNext() {
      if (this.data.idx >= this.data.trials) {
        this.finish()
        return
      }
      this.setData({ cur: this.data.list[this.data.idx], phase: 'show' })
      // 显示一段时间后自动进入答题阶段
      setTimeout(() => {
        if (this.data.phase === 'show') {
          this.setData({ phase: 'answer' })
        }
      }, this.data.showTime)
    },
    onAnswer(e) {
      if (this.data.phase !== 'answer') return
      const said = e.currentTarget.dataset.ans === '1'
      const ok = said === this.data.cur.answer
      const correct = this.data.correct + (ok ? 1 : 0)
      const total = this.data.total + 1
      const next = this.data.idx + 1
      
      // 反馈
      this.setData({ phase: 'feedback', lastCorrect: ok })
      setTimeout(() => {
        if (next >= this.data.trials) {
          this.finish()
        } else {
          this.setData({ correct, total, idx: next })
          this.showNext()
        }
      }, 800)
    },
    finish() {
      const result = mod.score({ correct: this.data.correct, total: this.data.total })
      this.setData({ phase: 'done' })
      this.triggerEvent('finish', result)
    },
  },
})
