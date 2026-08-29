const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 5, observer() { this.reset() } },
  },
  data: {
    rounds: 5,
    curRound: 0,
    phase: 'idle', // idle | inhale | hold | exhale | hold2 | done
    phaseIdx: 0,
    phaseLabel: '',
    phaseSec: 0,
    progress: 0,
    circleScale: 1,
    running: false,
    completed: 0,
  },
  lifetimes: {
    attached() { this.reset() },
    detached() { this.clearTimer() },
  },
  methods: {
    clearTimer() {
      if (this._t) { clearTimeout(this._t); this._t = null }
      if (this._progress) { clearInterval(this._progress); this._progress = null }
    },
    reset() {
      this.clearTimer()
      const seed = mod.generate(this.data.level)
      this.setData({
        rounds: seed.rounds,
        curRound: 0,
        phase: 'idle',
        phaseIdx: 0,
        phaseLabel: '',
        phaseSec: 0,
        progress: 0,
        circleScale: 1,
        running: false,
        completed: 0,
      })
    },
    start() {
      if (this.data.running) return
      this.setData({ running: true, startTime: Date.now() })
      this.nextPhase()
    },
    nextPhase() {
      const phases = mod.PHASES
      if (this.data.phaseIdx >= phases.length) {
        this.data.phaseIdx = 0
        const curRound = this.data.curRound + 1
        if (curRound > this.data.rounds) {
          this.finish()
          return
        }
        this.setData({ curRound })
      }
      const p = phases[this.data.phaseIdx]
      this.setData({ phase: p.key, phaseLabel: p.label, phaseSec: p.sec, progress: 0, circleScale: p.key === 'inhale' ? 1.2 : (p.key === 'exhale' ? 0.8 : 1) })
      this.runPhaseTimer(p.sec)
    },
    runPhaseTimer(sec) {
      let elapsed = 0
      this._progress = setInterval(() => {
        elapsed += 0.1
        const prog = Math.min(1, elapsed / sec)
        this.setData({ progress: prog })
        if (prog >= 1) {
          clearInterval(this._progress)
          this._progress = null
          this.setData({ phaseIdx: this.data.phaseIdx + 1 })
          this.nextPhase()
        }
      }, 100)
    },
    finish() {
      this.clearTimer()
      const time = (Date.now() - this.data.startTime) / 1000
      const result = mod.score({ rounds: this.data.curRound, duration: time })
      this.setData({ phase: 'done', running: false })
      this.triggerEvent('finish', result)
    },
  },
})