const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 3, observer() { this.reset() } },
    boardWidth: { type: Number, value: 705, observer() { this.applySizing() } },
    boardHeight: { type: Number, value: 0, observer() { this.applySizing() } },
  },
  data: {
    pads: 4,
    seq: [],
    phase: 'idle', // idle | show | input | done
    flash: -1,
    inputIdx: 0,
    correct: 0,
    padSize: 0,
  },
  lifetimes: {
    attached() { this.reset() },
    detached() { this.clearTimers() },
  },
  methods: {
    clearTimers() {
      if (this.timers) { this.timers.forEach((t) => clearTimeout(t)); this.timers = [] }
    },
    computePadSize() {
      const gap = 20 // rpx
      const padding = 32 // rpx
      const viewportWidth = this.data.boardWidth || 705
      const padW = Math.floor((viewportWidth - padding * 2 - gap) / 2)
      let final = padW
      const bh = this.data.boardHeight
      if (bh > 0) {
        const padH = Math.floor((bh - padding * 2 - gap) / 2)
        final = Math.min(padW, padH)
      }
      final = Math.max(120, Math.min(final, 200))
      this.setData({ padSize: final })
    },
    applySizing() {
      this.computePadSize()
    },
    reset() {
      this.clearTimers()
      this.timers = []
      const seed = mod.generate(this.data.level)
      this.setData({ pads: seed.pads, seq: seed.seq, phase: 'idle', flash: -1, inputIdx: 0, correct: 0 })
      this.computePadSize()
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
