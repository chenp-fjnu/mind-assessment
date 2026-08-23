const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 2, observer() { this.reset() } },
  },
  data: {
    size: 5,
    cells: [],
    ruleHex: '#ef4444',
    targetCount: 0,
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
      const cells = seed.cells.map((c, idx) => ({ hex: c.hex, target: c.target, hit: false, wrong: false, idx }))
      this.setData({
        size: seed.size,
        cells,
        ruleHex: seed.ruleHex,
        targetCount: seed.targetCount,
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
      this.setData({ running: false })
      this.triggerEvent('finish', result)
    },
  },
})
