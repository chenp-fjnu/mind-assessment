const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 1, observer() { this.reset() } },
    boardWidth: { type: Number, value: 705, observer() { this.applySizing() } },
    boardHeight: { type: Number, value: 0, observer() { this.applySizing() } },
  },
  data: {
    level: 1,
    trials: 8,
    trialIdx: 0,
    size: 3,
    cells: [],
    oddIdx: 0,
    errors: 0,
    running: false,
    cellSize: 0,
    cellH: 0,
    hueDiff: 180,
  },
  lifetimes: {
    attached() { this.reset() },
  },
  methods: {
    reset() {
      const seed = mod.generate({ level: this.data.level, trials: 8 })
      this.setData({
        level: seed.level,
        trials: seed.trials,
        trialIdx: 0,
        size: seed.trialsData[0].size,
        cells: seed.trialsData[0].cells,
        oddIdx: seed.trialsData[0].oddIdx,
        errors: 0,
        running: false,
        hueDiff: seed.trialsData[0].hueDiff,
      })
      this.computeCellSize(seed.trialsData[0].size)
    },
    computeCellSize(size) {
      const gap = 10 // rpx
      const padding = 32 // rpx
      const viewportWidth = this.data.boardWidth || 705
      const cellW = Math.floor((viewportWidth - padding * 2 - gap * (size - 1)) / size)
      // 全屏时同时受屏幕高度限制：取宽/高可容纳的最小值并保持正方形，保证整盘不超出屏幕
      let final = cellW
      const bh = this.data.boardHeight
      if (bh > 0) {
        const cellH = Math.floor((bh - padding * 2 - gap * (size - 1)) / size)
        final = Math.min(cellW, cellH)
      }
      final = Math.max(36, final) // 移除上限，让格子自动变大填满框
      this.setData({ cellSize: final, cellH: final })
    },
    start() {
      this.setData({ running: true, startTime: Date.now() })
    },
    applySizing() {
      this.computeCellSize(this.data.size)
    },
    onTap(e) {
      const idx = e.currentTarget.dataset.idx
      if (!this.data.running) this.start()

      const trialData = this.getCurrentTrial()
      if (idx === trialData.oddIdx) {
        this.nextTrial()
      } else {
        this.setData({ errors: this.data.errors + 1 })
        if (wx.vibrateShort) wx.vibrateShort({ type: 'light' })
      }
    },
    getCurrentTrial() {
      const seed = mod.generate({ level: this.data.level, trials: this.data.trials })
      return seed.trialsData[this.data.trialIdx]
    },
    nextTrial() {
      const nextIdx = this.data.trialIdx + 1
      if (nextIdx >= this.data.trials) {
        this.finish()
        return
      }
      const seed = mod.generate({ level: this.data.level, trials: this.data.trials })
      const trial = seed.trialsData[nextIdx]
      this.computeCellSize(trial.size)
      this.setData({
        trialIdx: nextIdx,
        size: trial.size,
        cells: trial.cells,
        oddIdx: trial.oddIdx,
        hueDiff: trial.hueDiff,
      })
    },
    finish() {
      const time = (Date.now() - this.data.startTime) / 1000
      const result = mod.score({ errors: this.data.errors, time, trials: this.data.trials })
      this.setData({ running: false })
      this.triggerEvent('finish', result)
    },
  },
})