const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 1, observer() { this.reset() } },
    boardWidth: { type: Number, value: 705, observer() { this.applySizing() } },
    boardHeight: { type: Number, value: 0, observer() { this.applySizing() } },
  },
  data: {
    n: 1,
    trials: 20,
    mode: 'dual',
    gridSize: 'small',
    visualSeq: [],
    auditorySeq: [],
    roundIdx: 0,
    shownPos: -1,
    shownLetter: '',
    phase: 'idle', // idle | show | answer | done
    correct: 0,
    total: 0,
    visualCorrect: 0,
    visualTotal: 0,
    auditoryCorrect: 0,
    auditoryTotal: 0,
    times: [],
    answerTs: 0,
    visualMatch: false,
    auditoryMatch: false,
    gridCols: 3,
    lastResult: null,
    score: 0,
    cellSize: 0,
  },
  lifetimes: {
    attached() {
      this.audioCtx = wx.createInnerAudioContext()
      this.audioCtx.autoplay = true
      this.reset()
    },
    detached() {
      this.clearTimer()
      if (this.audioCtx) this.audioCtx.destroy()
    },
  },
  methods: {
    clearTimer() {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
    },
    applySizing() {
      this.computeCellSize()
    },
    computeCellSize() {
      const cols = this.data.gridCols
      const gap = 12 // rpx
      const padding = 32 // rpx
      const viewportWidth = this.data.boardWidth || 705
      const cellW = Math.floor((viewportWidth - padding * 2 - gap * (cols - 1)) / cols)
      let final = cellW
      const bh = this.data.boardHeight
      if (bh > 0) {
        const cellH = Math.floor((bh - padding * 2 - gap * (cols - 1)) / cols)
        final = Math.min(cellW, cellH)
      }
      final = Math.max(60, Math.min(final, 120))
      this.setData({ cellSize: final })
    },
    reset() {
      this.clearTimer()
      const levelMeta = this.getLevelMeta(this.data.level)
      const seed = mod.generate({
        n: levelMeta.n,
        trials: levelMeta.trials,
        mode: levelMeta.mode,
        gridSize: levelMeta.gridSize,
      })
      const gridCols = mod.GRID_SIZES[seed.gridSize]
      this.setData({
        n: seed.n,
        trials: seed.trials,
        mode: seed.mode,
        gridSize: seed.gridSize,
        visualSeq: seed.visualSeq,
        auditorySeq: seed.auditorySeq,
        roundIdx: 0,
        shownPos: -1,
        shownLetter: '',
        phase: 'idle',
        correct: 0,
        total: 0,
        visualCorrect: 0,
        visualTotal: 0,
        auditoryCorrect: 0,
        auditoryTotal: 0,
        times: [],
        answerTs: 0,
        visualMatch: false,
        auditoryMatch: false,
        gridCols,
        lastResult: null,
        score: 0,
      })
      this.computeCellSize()
      this.updateComputed()
    },
    getLevelMeta(level) {
      const g = mod
      const lvl = g.levels.find((x) => x.value === level) || g.levels[0]
      return {
        n: lvl.n,
        trials: lvl.trials,
        mode: lvl.mode,
        gridSize: lvl.gridSize,
      }
    },
    updateComputed() {
      const modeLabels = { dual: '双重', visual: '仅视觉', auditory: '仅听觉' }
      const gridLabels = { small: '3×3', medium: '4×4' }
      this.setData({
        modeLabel: modeLabels[this.data.mode] || this.data.mode,
        gridLabel: gridLabels[this.data.gridSize] || this.data.gridSize,
        idleTip: this.getIdleTip(),
        showTip: this.getShowTip(),
      })
    },
    getIdleTip() {
      const { mode, n } = this.data
      if (mode === 'dual') return `同时判断视觉位置和听觉字母是否与 ${n} 步前匹配`
      if (mode === 'visual') return `判断当前方块位置是否与 ${n} 步前相同`
      return `判断当前字母是否与 ${n} 步前相同`
    },
    getShowTip() {
      const { mode } = this.data
      if (mode === 'dual') return '记住位置与字母…'
      if (mode === 'visual') return '记住位置…'
      return '记住字母…'
    },
    start() {
      if (this.data.phase !== 'idle' && this.data.phase !== 'done') return
      this.showRound()
    },
    showRound() {
      const i = this.data.roundIdx
      const pos = this.data.visualSeq[i]
      const letter = mod.AUDIO_LETTERS[this.data.auditorySeq[i]]

      this.setData({
        phase: 'show',
        shownPos: pos,
        shownLetter: letter,
        lastResult: null,
      })

      this.playLetter(letter)

      this.timer = setTimeout(() => {
        this.setData({
          phase: 'answer',
          shownPos: -1,
          shownLetter: '',
          answerTs: Date.now(),
        })
      }, 600)
    },
    playLetter(letter) {
      if (!this.audioCtx) return
      // 实际项目可接入 TTS 服务播放字母发音
      // 这里用振动作为听觉提示的替代
      wx.vibrateShort({ type: 'light' })
    },
    onVisualAnswer(e) {
      if (this.data.phase !== 'answer' || this.data.mode === 'auditory') return
      const saidMatch = e.currentTarget.dataset.match === '1'
      this.processAnswer('visual', saidMatch)
    },
    onAuditoryAnswer(e) {
      if (this.data.phase !== 'answer' || this.data.mode === 'visual') return
      const saidMatch = e.currentTarget.dataset.match === '1'
      this.processAnswer('auditory', saidMatch)
    },
    onDualAnswer(e) {
      if (this.data.phase !== 'answer' || this.data.mode !== 'dual') return
      const visualSaid = e.currentTarget.dataset.visual === '1'
      const auditorySaid = e.currentTarget.dataset.auditory === '1'
      this.processAnswer('visual', visualSaid)
      this.processAnswer('auditory', auditorySaid)
    },
    processAnswer(modality, saidMatch) {
      const i = this.data.roundIdx
      const expected = mod.isMatch(this.data[modality + 'Seq'], i, this.data.n)
      const ok = saidMatch === expected

      const updates = {
        total: this.data.total + 1,
        correct: this.data.correct + (ok ? 1 : 0),
        [modality + 'Total']: this.data[modality + 'Total'] + 1,
        [modality + 'Correct']: this.data[modality + 'Correct'] + (ok ? 1 : 0),
        roundIdx: i + 1,
        times: this.data.times.concat(Date.now() - this.data.answerTs),
        lastResult: {
          ...this.data.lastResult,
          [modality]: { said: saidMatch, expected, ok },
        },
      }

      const next = i + 1
      if (next >= this.data.trials) {
        this.finish(updates)
      } else {
        this.setData({ ...updates, phase: 'show' })
        this.showRound()
      }
    },
    finish(updates) {
      this.clearTimer()
      const result = mod.score({
        correct: updates.correct,
        total: updates.total,
        times: updates.times,
        visualCorrect: updates.visualCorrect,
        visualTotal: updates.visualTotal,
        auditoryCorrect: updates.auditoryCorrect,
        auditoryTotal: updates.auditoryTotal,
      })
      this.setData({ phase: 'done', ...updates, score: result.score })
      this.triggerEvent('finish', result)
    },
  },
})