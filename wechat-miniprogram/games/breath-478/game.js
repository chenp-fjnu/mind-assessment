const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 3, observer() { this.reset() } },
  },
  data: {
    cycles: 3,
    phases: [],
    phaseIdx: 0,
    cycle: 0,
    secLeft: 0,
    phaseLabel: '',
    running: false,
  },
  lifetimes: {
    attached() { this.reset() },
    detached() { this.clearTimer() },
  },
  methods: {
    clearTimer() {
      if (this._iv) clearInterval(this._iv)
      this._iv = null
    },
    reset() {
      this.clearTimer()
      const seed = mod.generate(this.data.level)
      this.setData({
        cycles: seed.cycles,
        phases: seed.phases,
        phaseIdx: 0,
        cycle: 0,
        secLeft: seed.phases[0] ? seed.phases[0].dur : 0,
        phaseLabel: seed.phases[0] ? seed.phases[0].label : '',
        running: false,
      })
    },
    start() {
      if (this.data.running) return
      this.setData({ running: true, cycle: 0, phaseIdx: 0 })
      this.tickPhase()
    },
    tickPhase() {
      const ph = this.data.phases[this.data.phaseIdx]
      this.setData({ phaseLabel: ph.label, secLeft: ph.dur })
      this._iv = setInterval(() => {
        const left = this.data.secLeft - 1
        if (left > 0) {
          this.setData({ secLeft: left })
          return
        }
        clearInterval(this._iv)
        this._iv = null
        let phaseIdx = this.data.phaseIdx + 1
        let cycle = this.data.cycle
        if (phaseIdx >= this.data.phases.length) {
          phaseIdx = 0
          cycle += 1
        }
        if (cycle >= this.data.cycles) {
          const result = mod.score({ cycles: this.data.cycles })
          this.setData({ running: false })
          this.triggerEvent('finish', result)
          return
        }
        this.setData({ phaseIdx, cycle })
        this.tickPhase()
      }, 1000)
    },
  },
})
