const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 3, observer() { this.reset() } },
    boardWidth: { type: Number, value: 705, observer() { this.applySizing() } },
  },
  data: {
    blocks: 9,
    cols: 3,
    seq: [],
    phase: 'idle',
    flash: -1,
    inputIdx: 0,
    correct: 0,
    cellSize: 0,
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
      const cols = 3
      const { cellSize } = this.computeCellSize(cols)
      this.setData({ blocks: seed.blocks, cols, seq: seed.seq, phase: 'idle', flash: -1, inputIdx: 0, correct: 0, cellSize })
    },
    computeCellSize(cols) {
      const gap = 18 // rpx
      const padding = 32 // rpx
      const viewportWidth = this.data.boardWidth || 705
      const availableWidth = viewportWidth - padding * 2 - gap * (cols - 1)
      const cellSize = Math.floor(availableWidth / cols)
      const minCellSize = 60
      const finalSize = Math.max(minCellSize, cellSize) // 移除上限，让格子自动变大填满框
      return { cellSize: finalSize }
    },
    start() {
      if (this.data.phase !== 'idle' && this.data.phase !== 'done') return
      this.playSeq()
    },
    applySizing() {
      const { cellSize } = this.computeCellSize(this.data.cols)
      this.setData({ cellSize })
    },
    playSeq() {
      this.setData({ phase: 'show', flash: -1, inputIdx: 0 })
      const seq = this.data.seq
      const step = 650
      seq.forEach((b, i) => {
        const t1 = setTimeout(() => this.setData({ flash: b }), i * step + 200)
        const t2 = setTimeout(() => this.setData({ flash: -1 }), i * step + 200 + step * 0.6)
        this.timers.push(t1, t2)
      })
      const end = setTimeout(() => this.setData({ phase: 'input' }), seq.length * step + 300)
      this.timers.push(end)
    },
    onTap(e) {
      if (this.data.phase !== 'input') return
      const idx = parseInt(e.currentTarget.dataset.idx, 10)
      if (idx === this.data.seq[this.data.inputIdx]) {
        const inputIdx = this.data.inputIdx + 1
        this.setData({ flash: idx })
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