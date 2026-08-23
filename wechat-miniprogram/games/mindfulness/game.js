const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 4, observer() { this.reset() } },
  },
  data: {
    cycles: 4,
    phases: [],
    prompts: [],
    phaseIdx: 0,
    cycle: 0,
    secLeft: 0,
    phaseLabel: '',
    prompt: '',
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
        prompts: seed.prompts,
        phaseIdx: 0,
        cycle: 0,
        secLeft: seed.phases[0] ? seed.phases[0].dur : 0,
        phaseLabel: seed.phases[0] ? seed.phases[0].label : '',
        prompt: seed.prompts[0] || '',
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
      const prompt = this.data.prompts[this.data.cycle % this.data.prompts.length]
      this.setData({ phaseLabel: ph.label, secLeft: ph.dur, prompt })
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
