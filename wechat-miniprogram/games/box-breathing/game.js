const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 5, observer() { this.reset() } },
  },
  data: {
    phases: [],
    target: 5,
    phaseLabel: '',
    phaseKey: '',
    remain: 4,
    progress: 0,
    running: false,
    completed: 0,
  },
  lifetimes: {
    attached() { this.reset() },
    detached() { this.clearTimer() },
  },
  methods: {
    reset() {
      this.clearTimer()
      const seed = mod.generate(this.data.level)
      const first = seed.phases[0]
      this.setData({
        phases: seed.phases,
        target: seed.rounds,
        phaseLabel: first.label,
        phaseKey: first.key,
        remain: first.sec,
        progress: 0,
        running: false,
        completed: 0,
        startTs: 0,
        phaseIdx: 0,
      })
    },
    clearTimer() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    start() {
      if (this.data.running) return
      this.setData({ running: true, startTs: Date.now(), completed: 0, phaseIdx: 0 })
      this.enterPhase(0)
    },
    enterPhase(idx) {
      const phase = this.data.phases[idx]
      this.phaseIdx = idx
      this.setData({ phaseKey: phase.key, phaseLabel: phase.label, remain: phase.sec, progress: 0 })
      this.clearTimer()
      this.timer = setInterval(() => {
        const remain = this.data.remain - 1
        const progress = 1 - remain / phase.sec
        if (remain <= 0) {
          this.clearTimer()
          const nextIdx = this.phaseIdx + 1
          if (nextIdx >= this.data.phases.length) {
            const completed = this.data.completed + 1
            this.setData({ completed })
            if (completed >= this.data.target) {
              this.finish()
              return
            }
            this.enterPhase(0)
          } else {
            this.enterPhase(nextIdx)
          }
        } else {
          this.setData({ remain, progress })
        }
      }, 1000)
    },
    stop() {
      if (!this.data.running) return
      this.finish()
    },
    finish() {
      this.clearTimer()
      const duration = this.data.startTs ? (Date.now() - this.data.startTs) / 1000 : 0
      const result = mod.score({ rounds: this.data.completed, duration })
      this.setData({ running: false })
      this.triggerEvent('finish', result)
    },
  },
})
