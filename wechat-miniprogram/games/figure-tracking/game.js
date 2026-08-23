const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 5, observer() { this.reset() } },
  },
  data: {
    size: 5,
    cells: [],
    next: 1,
    total: 25,
    running: false,
    errors: 0,
  },
  lifetimes: {
    attached() { this.reset() },
  },
  methods: {
    reset() {
      const size = this.data.level
      const seed = mod.generate(size)
      const cells = seed.cells.map((n, idx) => ({ n, idx, found: false }))
      this.setData({ size, cells, next: 1, total: size * size, running: false, errors: 0 })
    },
    start() {
      this.setData({ running: true, startTime: Date.now(), next: 1, errors: 0 })
    },
    onTap(e) {
      const n = e.currentTarget.dataset.n
      const idx = e.currentTarget.dataset.idx
      if (!this.data.running) this.start()
      if (n === this.data.next) {
        const k = 'cells[' + idx + '].found'
        this.setData({ [k]: true, next: this.data.next + 1 })
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
