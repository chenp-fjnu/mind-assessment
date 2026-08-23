const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 5, observer() { this.reset() } },
  },
  data: {
    size: 5,
    cells: [],
    cur: 0,
    exit: 24,
    steps: 0,
    running: false,
  },
  lifetimes: {
    attached() { this.reset() },
  },
  methods: {
    reset() {
      const seed = mod.generate(this.data.level)
      this._seed = seed
      const cells = []
      for (let r = 0; r < seed.size; r++) {
        for (let c = 0; c < seed.size; c++) {
          const w = seed.walls[r][c]
          const style =
            'border-top:' + (w[0] ? '4rpx solid #475569' : '4rpx solid transparent') + ';' +
            'border-right:' + (w[1] ? '4rpx solid #475569' : '4rpx solid transparent') + ';' +
            'border-bottom:' + (w[2] ? '4rpx solid #475569' : '4rpx solid transparent') + ';' +
            'border-left:' + (w[3] ? '4rpx solid #475569' : '4rpx solid transparent') + ';'
          cells.push({ idx: r * seed.size + c, r, c, style })
        }
      }
      this.setData({
        size: seed.size,
        cells,
        cur: seed.start,
        exit: seed.exit,
        steps: 0,
        running: false,
        optimal: seed.optimal,
      })
    },
    start() {
      this.setData({ running: true, startTime: Date.now() })
    },
    onTap(e) {
      const idx = e.currentTarget.dataset.idx
      if (!this.data.running) this.start()
      if (idx === this.data.cur || idx === this.data.exit) return
      const size = this.data.size
      const r = Math.floor(this.data.cur / size)
      const c = this.data.cur % size
      const nr = Math.floor(idx / size)
      const nc = idx % size
      if (Math.abs(nr - r) + Math.abs(nc - c) !== 1) return
      const w = this._seed.walls[r][c]
      let open = false
      if (nr === r && nc === c + 1) open = !w[1]
      else if (nr === r && nc === c - 1) open = !w[3]
      else if (nc === c && nr === r + 1) open = !w[2]
      else if (nc === c && nr === r - 1) open = !w[0]
      if (!open) return
      const steps = this.data.steps + 1
      if (idx === this.data.exit) this.finish(steps)
      else this.setData({ cur: idx, steps })
    },
    finish(steps) {
      const time = (Date.now() - this.data.startTime) / 1000
      const result = mod.score({ steps, time, optimal: this.data.optimal })
      this.setData({ running: false })
      this.triggerEvent('finish', result)
    },
  },
})
