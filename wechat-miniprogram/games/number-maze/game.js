const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 5, observer() { this.reset() } },
    boardWidth: { type: Number, value: 705, observer() { this.applySizing() } },
    boardHeight: { type: Number, value: 0, observer() { this.applySizing() } },
  },
  data: {
    size: 5,
    cells: [],
    cur: 0,
    exit: 24,
    steps: 0,
    running: false,
    phase: 'idle',
    optimal: 0,
    cellSize: 0,
    cellH: 0,
    visited: [],
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
          const idx = r * seed.size + c
          cells.push({ idx, r, c, walls: w, visited: false })
        }
      }
      this.setData({
        size: seed.size,
        cells,
        cur: seed.start,
        exit: seed.exit,
        steps: 0,
        running: false,
        phase: 'idle',
        optimal: seed.optimal,
        visited: [seed.start],
      })
      this.computeCellSize(seed.size)
    },
    computeCellSize(size) {
      const gap = 4
      const padding = 32
      const viewportWidth = this.data.boardWidth || 705
      const cellW = Math.floor((viewportWidth - padding * 2 - gap * (size - 1)) / size)
      let final = cellW
      const bh = this.data.boardHeight
      if (bh > 0) {
        const cellH = Math.floor((bh - padding * 2 - gap * (size - 1)) / size)
        final = Math.min(cellW, cellH)
      }
      final = Math.max(40, Math.min(final, 100))
      this.setData({ cellSize: final, cellH: final })
    },
    applySizing() {
      this.computeCellSize(this.data.size)
    },
    start() {
      this.setData({ running: true, phase: 'playing', startTime: Date.now() })
    },
    onTap(e) {
      const idx = e.currentTarget.dataset.idx
      if (!this.data.running) {
        this.start()
        return
      }
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
      if (!open) {
        if (wx.vibrateShort) wx.vibrateShort({ type: 'light' })
        this.showWallFlash(r, c, nr, nc)
        return
      }
      const steps = this.data.steps + 1
      const visited = this.data.visited.slice()
      if (!visited.includes(idx)) visited.push(idx)
      if (idx === this.data.exit) {
        this.finish(steps, visited)
      } else {
        this.setData({ cur: idx, steps, visited })
      }
    },
    showWallFlash(r, c, nr, nc) {
      const fromIdx = r * this.data.size + c
      const toIdx = nr * this.data.size + nc
      const key1 = 'cells[' + fromIdx + '].wallFlash'
      const key2 = 'cells[' + toIdx + '].wallFlash'
      this.setData({ [key1]: true, [key2]: true })
      setTimeout(() => {
        this.setData({ [key1]: false, [key2]: false })
      }, 150)
    },
    finish(steps, visited) {
      const time = (Date.now() - this.data.startTime) / 1000
      const result = mod.score({ steps, time, optimal: this.data.optimal })
      this.setData({ running: false, phase: 'done', visited })
      this.triggerEvent('finish', result)
    },
  },
})