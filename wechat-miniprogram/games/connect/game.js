const mod = require('./index')
const sound = require('../../utils/sound')

Component({
  properties: {
    level: {
      type: Number,
      value: 7,
      observer() {
        this.reset()
      },
    },
    // 棋盘可用宽度（rpx），由玩家页下发；全屏时变大，格子随之放大
    boardWidth: {
      type: Number,
      value: 705,
      observer() {
        this.applySizing()
      },
    },
    boardHeight: {
      type: Number,
      value: 0,
      observer() {
        this.applySizing()
      },
    },
  },
  data: {
    size: 7,
    cells: [],
    next: 1,
    total: 49,
    running: false,
    errors: 0,
    foundCount: 0,
    combo: 0,
    bestCombo: 0,
    cellSize: 0,
    cellH: 0,
    fontSize: 0,
    pop: -1,
    popKey: 0,
    shakeIdx: -1,
  },
  lifetimes: {
    attached() {
      this.reset()
    },
    detached() {
      if (this._pop) clearTimeout(this._pop)
      if (this._shake) clearTimeout(this._shake)
    },
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
        total: seed.total,
        running: false,
        errors: 0,
        foundCount: 0,
        combo: 0,
        bestCombo: 0,
        cellSize,
        cellH,
        fontSize,
        pop: -1,
        shakeIdx: -1,
      })
    },
    computeCellSize(size) {
      const gap = 12
      const padding = 24
      // 左侧进度列 + 与棋盘间距，需要从可用宽度里预留
      const railReserve = 96
      const viewportWidth = (this.data.boardWidth || 705) - railReserve
      const cellW = Math.floor((viewportWidth - padding * 2 - gap * (size - 1)) / size)
      let final = cellW
      const bh = this.data.boardHeight
      if (bh > 0) {
        const cellH = Math.floor((bh - padding * 2 - gap * (size - 1)) / size)
        final = Math.min(cellW, cellH)
      }
      final = Math.max(36, final)
      const fontSize = Math.max(15, Math.floor(final * 0.42))
      return { cellSize: final, cellH: final, fontSize }
    },
    applySizing() {
      const { cellSize, cellH, fontSize } = this.computeCellSize(this.data.size)
      this.setData({ cellSize, cellH, fontSize })
    },
    start() {
      this.setData({ running: true, startTime: Date.now() })
    },
    preventScroll() {},
    onTap(e) {
      if (this.data.running === false) this.start()
      const n = Number(e.currentTarget.dataset.n)
      const idx = Number(e.currentTarget.dataset.idx)
      if (n === this.data.next) {
        const key = 'cells[' + idx + '].found'
        const foundCount = this.data.foundCount + 1
        const combo = this.data.combo + 1
        const bestCombo = Math.max(this.data.bestCombo, combo)
        this.setData({
          [key]: true,
          next: this.data.next + 1,
          foundCount,
          combo,
          bestCombo,
          pop: idx,
          popKey: this.data.popKey + 1,
        })
        sound.tap()
        this.retriggerPop()
        if (this.data.next > this.data.total) this.finish()
      } else {
        this.setData({
          errors: this.data.errors + 1,
          combo: 0,
          shakeIdx: idx,
        })
        sound.miss()
        this.retriggerShake(idx)
        if (wx.vibrateShort) wx.vibrateShort({ type: 'light' })
      }
    },
    retriggerPop() {
      if (this._pop) clearTimeout(this._pop)
      this._pop = setTimeout(() => {
        this._pop = null
        if (this.data.pop !== -1) this.setData({ pop: -1 })
      }, 260)
    },
    retriggerShake(idx) {
      if (this._shake) clearTimeout(this._shake)
      this._shake = setTimeout(() => {
        this._shake = null
        if (this.data.shakeIdx === idx) this.setData({ shakeIdx: -1 })
      }, 220)
    },
    finish() {
      const time = (Date.now() - this.data.startTime) / 1000
      const result = mod.score({
        total: this.data.total,
        time,
        errors: this.data.errors,
        bestCombo: this.data.bestCombo,
      })
      this.setData({ running: false })
      sound.success()
      this.triggerEvent('finish', result)
    },
  },
})
