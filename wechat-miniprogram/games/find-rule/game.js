const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 2, observer() { this.reset() } },
    boardWidth: { type: Number, value: 705, observer() { this.applySizing() } },
    boardHeight: { type: Number, value: 0, observer() { this.applySizing() } },
  },
  data: {
    size: 5,
    cells: [],
    ruleHex: '#ef4444',
    ruleName: '红',
    targetCount: 0,
    found: 0,
    errors: 0,
    running: false,
    phase: 'idle', // idle | playing | done
    cellSize: 0,
  },
  lifetimes: {
    attached() { this.reset() },
  },
  methods: {
    reset() {
      const seed = mod.generate(this.data.level)
      const cells = seed.cells.map((c, idx) => ({ hex: c.hex, target: c.target, hit: false, wrong: false, idx }))
      this.setData({
        size: seed.size,
        cells,
        ruleHex: seed.ruleHex,
        ruleName: this.getColorName(seed.ruleKey),
        targetCount: seed.targetCount,
        found: 0,
        errors: 0,
        running: false,
        phase: 'idle',
      })
      this.computeCellSize(seed.size)
    },
    getColorName(key) {
      const map = { red: '红', blue: '蓝', green: '绿', yellow: '黄' }
      return map[key] || key
    },
    computeCellSize(size) {
      const gap = 6 // rpx
      const padding = 32 // rpx
      const viewportWidth = this.data.boardWidth || 705
      const cellW = Math.floor((viewportWidth - padding * 2 - gap * (size - 1)) / size)
      let final = cellW
      const bh = this.data.boardHeight
      if (bh > 0) {
        const cellH = Math.floor((bh - padding * 2 - gap * (size - 1)) / size)
        final = Math.min(cellW, cellH)
      }
      final = Math.max(40, Math.min(final, 120))
      this.setData({ cellSize: final })
    },
    applySizing() {
      this.computeCellSize(this.data.size)
    },
    start() {
      this.setData({ running: true, phase: 'playing', startTime: Date.now() })
    },
    onTap(e) {
      const idx = e.currentTarget.dataset.idx
      const cell = this.data.cells[idx]
      if (!this.data.running) {
        this.start()
        return
      }
      if (cell.hit || cell.wrong) return
      if (cell.target) {
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
      this.setData({ running: false, phase: 'done' })
      this.triggerEvent('finish', result)
    },
  },
})
