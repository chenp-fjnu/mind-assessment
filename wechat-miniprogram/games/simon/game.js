const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 3, observer() { this.reset() } },
  },
  data: {
    pads: 4,
    seq: [],
    phase: 'idle', // idle | show | input | done
    flash: -1,
    inputIdx: 0,
    correct: 0,
  },
  lifetimes: {
    attached() { this.reset() },
    detached() { this.clearTimers() },
  },
  methods: {
    clearTimers() {
      if (this.timers) { this.timers.forEach((t) => clearTimeout(t)); this.timers = [] }
    },
    reset() {
      this.clearTimers()
      this.timers = []
      const seed = mod.generate(this.data.level)
      this.setData({ pads: seed.pads, seq: seed.seq, phase: 'idle', flash: -1, inputIdx: 0, correct: 0 })
    },
    start() {
      if (this.data.phase !== 'idle' && this.data.phase !== 'done') return
      this.playSeq()
    },
    playSeq() {
      this.setData({ phase: 'show', flash: -1, inputIdx: 0 })
      const seq = this.data.seq
      const step = 600
      seq.forEach((pad, i) => {
        const t1 = setTimeout(() => this.setData({ flash: pad }), i * step + 200)
        const t2 = setTimeout(() => this.setData({ flash: -1 }), i * step + 200 + step * 0.6)
        this.timers.push(t1, t2)
      })
      const end = setTimeout(() => this.setData({ phase: 'input' }), seq.length * step + 300)
      this.timers.push(end)
    },
    onPad(e) {
      if (this.data.phase !== 'input') return
      const d = parseInt(e.currentTarget.dataset.d, 10)
      if (d === this.data.seq[this.data.inputIdx]) {
        const inputIdx = this.data.inputIdx + 1
        this.setData({ flash: d })
        setTimeout(() => this.setData({ flash: -1 }), 180)
        if (inputIdx >= this.data.seq.length) {
          const result = mod.score({ correct: this.data.seq.length, total: this.data.seq.length })
          this.setData({ phase: 'done', correct: this.data.seq.length })
          this.triggerEvent('finish', result)
        } else {
          this.setData({ inputIdx })
        }
      } else {
        const result = mod.score({ correct: this.data.inputIdx, total: this.data.seq.length })
        this.setData({ phase: 'done', correct: this.data.inputIdx })
        this.triggerEvent('finish', result)
      }
    },
  },
})
