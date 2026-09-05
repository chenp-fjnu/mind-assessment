const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 8, observer() { this.reset() } },
  },
  data: {
    cycles: 8,
    curCycle: 0,
    phase: 'idle', // idle | inhale | exhale | done
    phaseIdx: 0,
    phaseLabel: '',
    phaseSec: 0,
    progress: 0,
    circleScale: 1,
    running: false,
    color: '#38bdf8',
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
        cycles: seed.cycles,
        _phases: seed.phases,
        curCycle: 1,
        phase: 'idle',
        phaseIdx: 0,
        phaseLabel: '',
        phaseSec: 0,
        progress: 0,
        circleScale: 1,
        running: false,
        timerText: '0s',
      })
    },
    start() {
      if (this.data.running) return
      this.setData({ running: true, startTime: Date.now() })
      this.nextPhase()
    },
    nextPhase() {
      const phases = this.data._phases
      if (this.data.phaseIdx >= phases.length) {
        this.data.phaseIdx = 0
        const curCycle = this.data.curCycle + 1
        if (curCycle > this.data.cycles) {
          this.finish()
          return
        }
        this.setData({ curCycle })
      }
      const p = phases[this.data.phaseIdx]
      let initialScale = 1
      let color = '#38bdf8'
      if (p.label === '吸气') {
        initialScale = 0.8 // start small for inhalation
        color = '#3b82f6'
      } else if (p.label === '呼气') {
        initialScale = 1.2 // start big for exhalation
        color = '#ef4444'
      }
      // For hold phase, preserve current circleScale instead of resetting
      const scaleToSet = p.label === '屏息' ? this.data.circleScale : initialScale
      const remaining = Math.ceil(p.dur * (1 - 0))
      this.setData({ 
        phase: p.label, 
        phaseLabel: p.label, 
        phaseSec: p.dur, 
        progress: 0, 
        circleScale: scaleToSet,
        color,
        timerText: remaining + 's'
      })
      this.runPhaseTimer(p.dur)
    },
    runPhaseTimer(sec) {
      let elapsed = 0
      this._progress = setInterval(() => {
        elapsed += 0.1
        const prog = Math.min(1, elapsed / sec)
        const remaining = Math.ceil(sec * (1 - prog))
        // Animate circleScale based on phase and progress
        const phase = this.data.phase
        let newScale = this.data.circleScale
        if (phase === '吸气') {
          // Grow from small to big: 0.8 -> 1.2
          newScale = 0.8 + prog * 0.4
        } else if (phase === '呼气') {
          // Shrink from big to small: 1.2 -> 0.8
          newScale = 1.2 - prog * 0.4
        }
        this.setData({ progress: prog, circleScale: newScale, timerText: remaining + 's' })
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
      const result = mod.score({ cycles: this.data.curCycle })
      this.setData({ phase: 'done', running: false })
      this.triggerEvent('finish', result)
    },
  },
})