const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 20, observer() { this.reset() } },
  },
  data: {
    trials: [],
    options: [],
    index: 0,
    current: null,
    correct: 0,
    errors: 0,
    running: false,
    done: false,
  },
  lifetimes: {
    attached() { this.reset() },
  },
  methods: {
    reset() {
      const seed = mod.generate(this.data.level)
      this.setData({
        trials: seed.list,
        options: seed.options,
        index: 0,
        current: seed.list[0] || null,
        correct: 0,
        errors: 0,
        running: false,
        done: false,
      })
    },
    start() {
      this.setData({ running: true, startTime: Date.now() })
    },
    onPick(e) {
      if (this.data.done || !this.data.current) return
      if (!this.data.running) this.start()
      const chosen = e.currentTarget.dataset.key
      const cur = this.data.current
      const correct = this.data.correct + (chosen === cur.inkKey ? 1 : 0)
      const errors = this.data.errors + (chosen === cur.inkKey ? 0 : 1)
      const nextIdx = this.data.index + 1
      if (nextIdx >= this.data.trials.length) {
        const time = (Date.now() - this.data.startTime) / 1000
        const result = mod.score({
          total: this.data.trials.length,
          correct,
          errors,
          time,
        })
        this.setData({ done: true, running: false, correct, errors })
        this.triggerEvent('finish', result)
      } else {
        this.setData({ index: nextIdx, current: this.data.trials[nextIdx], correct, errors })
      }
    },
  },
})
