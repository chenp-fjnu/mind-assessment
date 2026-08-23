const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 1, observer() { this.reset() } },
  },
  data: {
    size: 3,
    cells: [],
    oddIdx: 0,
    errors: 0,
    running: false,
  },
  lifetimes: {
    attached() { this.reset() },
  },
  methods: {
    reset() {
      const seed = mod.generate(this.data.level)
      this.setData({
        size: seed.size,
        cells: seed.cells,
        oddIdx: seed.oddIdx,
        errors: 0,
        running: false,
      })
    },
    start() {
      this.setData({ running: true, startTime: Date.now() })
    },
    onTap(e) {
      const idx = e.currentTarget.dataset.idx
      if (!this.data.running) this.start()
      if (idx === this.data.oddIdx) {
        this.finish()
      } else {
        this.setData({ errors: this.data.errors + 1 })
        if (wx.vibrateShort) wx.vibrateShort({ type: 'light' })
      }
    },
    finish() {
      const time = (Date.now() - this.data.startTime) / 1000
      const result = mod.score({ errors: this.data.errors, time })
      this.setData({ running: false })
      this.triggerEvent('finish', result)
    },
  },
})
