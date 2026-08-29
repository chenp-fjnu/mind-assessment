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
      this._seed = mod.generate({ level: this.data.level, trials: this.getTrialsForLevel(this.data.level) })
      const firstTrial = this._seed.trialsData[0]
      const cells = firstTrial.cells.map((color) => ({ color, correct: false, wrong: false }))
      this.setData({
        level: this._seed.level,
        trials: this._seed.trials,
        trialIdx: 0,
        size: firstTrial.size,
        cells,
        oddIdx: firstTrial.oddIdx,
        errors: 0,
        running: false,
        hueDiff: firstTrial.hueDiff,
      })
      this.computeCellSize(firstTrial.size)
    },
    getTrialsForLevel(level) {
      const meta = mod
      const lvl = meta.levels.find((x) => x.value === level) || meta.levels[0]
      return lvl.trials || 8
    },
    computeCellSize(size) {
      const gap = 10 // rpx
      const padding = 32 // rpx
      const viewportWidth = this.data.boardWidth || 705
      const cellW = Math.floor((viewportWidth - padding * 2 - gap * (size - 1)) / size)
      let final = cellW
      const bh = this.data.boardHeight
      if (bh > 0) {
        const cellH = Math.floor((bh - padding * 2 - gap * (size - 1)) / size)
        final = Math.min(cellW, cellH)
      }
      final = Math.max(36, final)
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

      const trialData = this._seed.trialsData[this.data.trialIdx]
      if (idx === trialData.oddIdx) {
        // 正确：闪烁绿色反馈
        const key = 'cells[' + idx + ']'
        this.setData({ [key + '.correct']: true })
        setTimeout(() => {
          this.setData({ [key + '.correct']: false })
          this.nextTrial()
        }, 200)
      } else {
        // 错误：震动 + 红色反馈
        this.setData({ errors: this.data.errors + 1 })
        if (wx.vibrateShort) wx.vibrateShort({ type: 'light' })
        const key = 'cells[' + idx + ']'
        this.setData({ [key + '.wrong']: true })
        setTimeout(() => {
          this.setData({ [key + '.wrong']: false })
        }, 300)
      }
    },
    nextTrial() {
      const nextIdx = this.data.trialIdx + 1
      if (nextIdx >= this.data.trials) {
        this.finish()
        return
      }
      const trial = this._seed.trialsData[nextIdx]
      const cells = trial.cells.map((color) => ({ color, correct: false, wrong: false }))
      this.computeCellSize(trial.size)
      this.setData({
        trialIdx: nextIdx,
        size: trial.size,
        cells,
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