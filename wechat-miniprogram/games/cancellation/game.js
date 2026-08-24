const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 0, observer() { this.reset() } },
    boardWidth: { type: Number, value: 705, observer() { this.applySizing() } },
  },
  data: {
    rows: 8,
    cols: 8,
    target: '0',
    targetCount: 0,
    cells: [],
    found: 0,
    errors: 0,
    running: false,
    cellSize: 0,
    fontSize: 0,
  },
  lifetimes: {
    attached() { this.reset() },
  },
  methods: {
    reset() {
      const seed = mod.generate(this.data.level)
      const cells = seed.cells.map((ch, idx) => ({ ch, idx, hit: false, wrong: false }))
      // 响应式计算单元格大小
      const { cellSize, fontSize } = this.computeCellSize(seed.rows, seed.cols)
      this.setData({
        rows: seed.rows,
        cols: seed.cols,
        target: seed.target,
        targetCount: seed.targetCount,
        cells,
        found: 0,
        errors: 0,
        running: false,
        cellSize,
        fontSize,
      })
    },
    computeCellSize(rows, cols) {
      // 基于 94vw - 32rpx padding 计算可用宽度，预留间隙
      // 让网格始终占满可用宽度：格子越少，单个格子越大
      const maxCols = Math.max(rows, cols)
      const gap = 6 // rpx
      const padding = 32 // rpx
      const viewportWidth = this.data.boardWidth || 705
      const availableWidth = viewportWidth - padding * 2 - gap * (maxCols - 1)
      const cellSize = Math.floor(availableWidth / maxCols)
      const minCellSize = 48 // 最小 48rpx 确保可点击
      const finalSize = Math.max(minCellSize, cellSize) // 移除上限，让格子自动变大填满框
      const fontSize = Math.floor(finalSize * 0.55)
      return { cellSize: finalSize, fontSize }
    },
    start() {
      this.setData({ running: true, startTime: Date.now() })
    },
    applySizing() {
      const { cellSize, fontSize } = this.computeCellSize(this.data.rows, this.data.cols)
      this.setData({ cellSize, fontSize })
    },
    onTap(e) {
      const idx = e.currentTarget.dataset.idx
      const cell = this.data.cells[idx]
      if (!this.data.running) this.start()
      if (cell.hit || cell.wrong) return
      if (cell.ch === this.data.target) {
        const k = 'cells[' + idx + '].hit'
        const found = this.data.found + 1
        this.setData({ [k]: true, found })
        if (found >= this.data.targetCount) this.finish()
      } else {
        const k = 'cells[' + idx + '].wrong'
        this.setData({ [k]: true, errors: this.data.errors + 1 })
        if (wx.vibrateShort) wx.vibrateShort({ type: 'light' })
      }
    },
    finish() {
      const time = (Date.now() - this.data.startTime) / 1000
      const result = mod.score({ targetCount: this.data.targetCount, found: this.data.found, errors: this.data.errors, time })
      this.setData({ running: false })
      this.triggerEvent('finish', result)
    },
  },
})