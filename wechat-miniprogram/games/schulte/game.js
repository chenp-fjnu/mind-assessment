const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 5, observer() { this.reset() } },
    // 棋盘可用宽度（rpx），由玩家页下发；全屏时变大，格子随之放大
    boardWidth: { type: Number, value: 705, observer() { this.applySizing() } },
    boardHeight: { type: Number, value: 0, observer() { this.applySizing() } },
  },
  data: {
    size: 5,
    cells: [],
    next: 1,
    total: 25,
    running: false,
    errors: 0,
    foundCount: 0,
    cellSize: 0,
    fontSize: 0,
    cellH: 0,
  },
  lifetimes: {
    attached() { this.reset() },
  },
  methods: {
    reset() {
      const size = this.data.level
      const seed = mod.generate(size)
      const cells = seed.cells.map((n, idx) => ({ n, idx, found: false }))
      const { cellSize, cellH, fontSize } = this.computeCellSize(size)
      this.setData({
        size,
        cells,
        next: 1,
        total: size * size,
        running: false,
        errors: 0,
        foundCount: 0,
        cellSize,
        cellH,
        fontSize,
      })
    },
    computeCellSize(size) {
      const gap = 8 // rpx
      const padding = 32 // rpx
      const viewportWidth = this.data.boardWidth || 705
      const availableWidth = viewportWidth - padding * 2 - gap * (size - 1)
      const cellSize = Math.floor(availableWidth / size)
      const fontSize = Math.max(16, Math.floor(cellSize * 0.4))
      // 全屏时利用屏幕高度把格子拉高，放大更明显；非全屏则保持正方形
      const bh = this.data.boardHeight
      const cellH = bh > 0 ? Math.floor((bh - padding * 2 - gap * (size - 1)) / size) : cellSize
      const finalSize = Math.max(40, cellSize)
      const finalH = Math.max(40, cellH)
      return { cellSize: finalSize, cellH: finalH, fontSize }
    },
    start() {
      this.setData({ running: true, startTime: Date.now(), next: 1, errors: 0 })
    },
    applySizing() {
      const { cellSize, cellH, fontSize } = this.computeCellSize(this.data.size)
      this.setData({ cellSize, cellH, fontSize })
    },
    onTap(e) {
      const n = e.currentTarget.dataset.n
      const idx = e.currentTarget.dataset.idx
      if (!this.data.running) this.start()
      if (n === this.data.next) {
        const key = 'cells[' + idx + '].found'
        const foundCount = this.data.foundCount + 1
        this.setData({ [key]: true, next: this.data.next + 1, foundCount })
        if (this.data.next > this.data.total) this.finish()
      } else {
        this.setData({ errors: this.data.errors + 1 })
        if (wx.vibrateShort) wx.vibrateShort({ type: 'light' })
      }
    },
    finish() {
      const time = (Date.now() - this.data.startTime) / 1000
      const result = mod.score({ size: this.data.size, time, errors: this.data.errors })
      this.setData({ running: false })
      this.triggerEvent('finish', result)
    },
  },
})