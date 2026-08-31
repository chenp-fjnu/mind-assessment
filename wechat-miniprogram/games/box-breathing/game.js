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
    color: '#10b981',
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
      let initialScale = 1
      let color = '#10b981'
      if (p.key === 'inhale') {
        initialScale = 0.8 // start small for inhalation
        color = '#3b82f6'
      } else if (p.key === 'exhale') {
        initialScale = 1.2 // start big for exhalation
        color = '#ef4444'
      }
      // For hold phases, preserve current circleScale instead of resetting
      const scaleToSet = p.key === 'hold' || p.key === 'hold2' ? this.data.circleScale : initialScale
      this.setData({ phase: p.key, phaseLabel: p.label, phaseSec: p.sec, progress: 0, circleScale: scaleToSet, color })
      this.runPhaseTimer(p.sec)
    },
    runPhaseTimer(sec) {
      let elapsed = 0
      this._progress = setInterval(() => {
        elapsed += 0.1
        const prog = Math.min(1, elapsed / sec)
        this.setData({ progress: prog })
        // Animate circleScale based on phase and progress
        const phase = this.data.phase
        let newScale = this.data.circleScale
        if (phase === 'inhale') {
          // Grow from small to big: 0.8 -> 1.2
          newScale = 0.8 + prog * 0.4
        } else if (phase === 'exhale') {
          // Shrink from big to small: 1.2 -> 0.8
          newScale = 1.2 - prog * 0.4
        } else {
          // Hold phases: stay still
          newScale = this.data.circleScale
        }
        this.setData({ circleScale: newScale })
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