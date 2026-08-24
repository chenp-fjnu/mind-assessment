const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 4, observer() { this.reset() } },
    boardWidth: { type: Number, value: 705, observer() { this.applySizing() } },
    boardHeight: { type: Number, value: 0, observer() { this.applySizing() } },
  },
  data: {
    size: 4,
    cells: [],
    pattern: [],
    selected: [],
    phase: 'idle', // idle | show | input | done
    correct: 0,
    total: 0,
    cellSize: 0,
    cellH: 0,
  },
  lifetimes: {
    attached() { this.reset() },
    detached() { this.clearTimer() },
  },
  methods: {
    clearTimer() {
      if (this.timer) { clearTimeout(this.timer); this.timer = null }
    },
    reset() {
      this.clearTimer()
      const seed = mod.generate(this.data.level)
      const { cellSize, cellH } = this.computeCellSize(seed.size)
      this.setData({
        size: seed.size,
        pattern: seed.cells,
        cells: seed.cells.map((v) => !!v),
        selected: [],
        phase: 'idle',
        correct: 0,
        total: 0,
        cellSize,
        cellH,
      })
    },
    computeCellSize(size) {
      const gap = 12 // rpx
      const padding = 32 // rpx
      const viewportWidth = this.data.boardWidth || 705
      const availableWidth = viewportWidth - padding * 2 - gap * (size - 1)
      const cellSize = Math.floor(availableWidth / size)
      const minCellSize = 52
      const finalSize = Math.max(minCellSize, cellSize) // 移除上限，让格子自动变大填满框
      // 全屏时利用屏幕高度把格子拉高，放大更明显；非全屏则保持正方形
      const bh = this.data.boardHeight
      const cellH = bh > 0 ? Math.max(minCellSize, Math.floor((bh - padding * 2 - gap * (size - 1)) / size)) : finalSize
      return { cellSize: finalSize, cellH }
    },
    applySizing() {
      const { cellSize, cellH } = this.computeCellSize(this.data.size)
      this.setData({ cellSize, cellH })
    },
    start() {
      if (this.data.phase !== 'idle' && this.data.phase !== 'done') return
      this.setData({ phase: 'show', cells: this.data.pattern.map((v) => !!v) })
      this.timer = setTimeout(() => {
        this.setData({
          phase: 'input',
          cells: this.data.pattern.map(() => false),
          selected: [],
        })
      }, this.data.size * this.data.size * 60 + 700)
    },
    onTap(e) {
      if (this.data.phase !== 'input') return
      const idx = e.currentTarget.dataset.idx
      const selected = this.data.selected.slice()
      const at = selected.indexOf(idx)
      if (at >= 0) selected.splice(at, 1)
      else selected.push(idx)
      const cells = this.data.cells.slice()
      cells[idx] = !cells[idx]
      this.setData({ selected, cells })
    },
    onSubmit() {
      if (this.data.phase !== 'input') return
      let correct = 0
      for (let i = 0; i < this.data.pattern.length; i++) {
        const sel = this.data.selected.indexOf(i) >= 0
        if (sel === this.data.pattern[i]) correct++
      }
      const result = mod.score({ correct, total: this.data.pattern.length })
      this.setData({ phase: 'done', correct, total: this.data.pattern.length })
      this.triggerEvent('finish', result)
    },
  },
})