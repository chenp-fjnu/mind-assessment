const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 0, observer() { this.reset() } },
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
  },
  lifetimes: {
    attached() { this.reset() },
  },
  methods: {
    reset() {
      const seed = mod.generate(this.data.level)
      const cells = seed.cells.map((ch, idx) => ({ ch, idx, hit: false, wrong: false }))
      this.setData({
        rows: seed.rows,
        cols: seed.cols,
        target: seed.target,
        targetCount: seed.targetCount,
        cells,
        found: 0,
        errors: 0,
        running: false,
      })
    },
    start() {
      this.setData({ running: true, startTime: Date.now() })
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
