const mod = require('./index')
const cue = require('../../utils/cue')

const STIMULUS_MS = 650
const FEEDBACK_MS = 500

Component({
  properties: {
    level: {
      type: Number,
      value: 1,
      observer() {
        this.reset()
      },
    },
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
    n: 1,
    trials: 20,
    mode: 'dual',
    gridSize: 'small',
    visualSeq: [],
    auditorySeq: [],
    roundIdx: 0,
    stimulusIdx: 0,
    shownPos: -1,
    shownLetter: '',
    phase: 'idle', // idle | show | warmup | answer | feedback | done
    correct: 0,
    total: 0,
    visualCorrect: 0,
    visualTotal: 0,
    auditoryCorrect: 0,
    auditoryTotal: 0,
    times: [],
    answerTs: 0,
    selectedVisual: false,
    selectedAuditory: false,
    hasVisualAnswer: false,
    hasAuditoryAnswer: false,
    canSubmit: false,
    gridCols: 3,
    lastResult: null,
    result: null,
    score: 0,
    cellSize: 0,
  },
  lifetimes: {
    attached() {
      this.reset()
    },
    detached() {
      this.clearTimer()
      cue.stop()
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
      this.prepareGame(levelMeta.mode, levelMeta.gridSize)
    },
    prepareGame(mode, gridSize) {
      this.clearTimer()
      const seed = mod.generate({
        n: this.getLevelMeta(this.data.level).n,
        trials: this.getLevelMeta(this.data.level).trials,
        mode,
        gridSize,
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
        stimulusIdx: 0,
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
        selectedVisual: false,
        selectedAuditory: false,
        hasVisualAnswer: false,
        hasAuditoryAnswer: false,
        canSubmit: false,
        gridCols,
        lastResult: null,
        result: null,
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
    onModeChange(e) {
      const mode = e.currentTarget.dataset.mode
      if (['dual', 'visual', 'auditory'].indexOf(mode) < 0) return
      this.prepareGame(mode, this.data.gridSize)
    },
    onGridSizeChange(e) {
      const gridSize = e.currentTarget.dataset.size
      if (!mod.GRID_SIZES[gridSize]) return
      this.prepareGame(this.data.mode, gridSize)
    },
    updateComputed() {
      const modeLabels = { dual: '双重', visual: '仅视觉', auditory: '仅听觉' }
      this.setData({
        modeLabel: modeLabels[this.data.mode] || this.data.mode,
        idleTip: this.getIdleTip(),
      })
    },
    getIdleTip() {
      const { mode, n } = this.data
      if (mode === 'dual') return `同时判断视觉位置和听觉字母是否与 ${n} 步前匹配`
      if (mode === 'visual') return `判断当前方块位置是否与 ${n} 步前相同`
      return `判断当前字母是否与 ${n} 步前相同`
    },
    start() {
      if (this.data.phase !== 'idle' && this.data.phase !== 'done') return
      this.showRound()
    },
    replay() {
      this.prepareGame(this.data.mode, this.data.gridSize)
    },
    showRound() {
      const i = this.data.stimulusIdx
      const pos = this.data.visualSeq[i]
      const letter = mod.AUDIO_LETTERS[this.data.auditorySeq[i]]

      this.setData({
        phase: 'show',
        shownPos: pos,
        shownLetter: letter,
        selectedVisual: false,
        selectedAuditory: false,
        hasVisualAnswer: false,
        hasAuditoryAnswer: false,
        canSubmit: false,
      })

      if (this.data.mode !== 'visual') this.playLetter(letter)

      this.timer = setTimeout(() => {
        this.timer = null
        if (i < this.data.n) {
          this.setData({
            phase: 'warmup',
            shownPos: -1,
            shownLetter: '',
          })
          this.timer = setTimeout(() => {
            this.timer = null
            this.setData({ stimulusIdx: i + 1 })
            this.showRound()
          }, FEEDBACK_MS)
          return
        }
        this.setData({
          phase: 'answer',
          shownPos: -1,
          shownLetter: '',
          answerTs: Date.now(),
        })
      }, STIMULUS_MS)
    },
    playLetter(letter) {
      cue.play('l' + letter.toLowerCase())
    },
    onVisualAnswer(e) {
      if (this.data.phase !== 'answer' || this.data.mode === 'auditory') return
      this.updateAnswerSelection('visual', e.currentTarget.dataset.match === '1')
    },
    onAuditoryAnswer(e) {
      if (this.data.phase !== 'answer' || this.data.mode === 'visual') return
      this.updateAnswerSelection('auditory', e.currentTarget.dataset.match === '1')
    },
    updateAnswerSelection(modality, said) {
      if (this.data.phase !== 'answer') return
      const updates =
        modality === 'visual'
          ? { selectedVisual: said, hasVisualAnswer: true }
          : { selectedAuditory: said, hasAuditoryAnswer: true }
      const hasVisualAnswer = updates.hasVisualAnswer || this.data.hasVisualAnswer
      const hasAuditoryAnswer = updates.hasAuditoryAnswer || this.data.hasAuditoryAnswer
      updates.canSubmit =
        this.data.mode === 'dual'
          ? hasVisualAnswer && hasAuditoryAnswer
          : this.data.mode === 'visual'
            ? hasVisualAnswer
            : hasAuditoryAnswer
      this.setData(updates)
    },
    submitAnswer() {
      if (this.data.phase !== 'answer' || !this.data.canSubmit) return
      const answers = []
      if (this.data.mode !== 'auditory') {
        answers.push({ modality: 'visual', said: this.data.selectedVisual })
      }
      if (this.data.mode !== 'visual') {
        answers.push({ modality: 'auditory', said: this.data.selectedAuditory })
      }
      this.answerRound(answers)
    },
    answerRound(answers) {
      const i = this.data.stimulusIdx
      const n = this.data.n

      let correct = this.data.correct
      const lastResult = {}
      const updates = {
        total: this.data.total + answers.length,
        roundIdx: this.data.roundIdx + 1,
        stimulusIdx: i + 1,
        times: this.data.times.concat(Date.now() - this.data.answerTs),
      }

      for (const a of answers) {
        const expected = mod.isMatch(this.data[a.modality + 'Seq'], i, n)
        const ok = a.said === expected
        correct += ok ? 1 : 0
        updates[a.modality + 'Total'] = this.data[a.modality + 'Total'] + 1
        updates[a.modality + 'Correct'] = this.data[a.modality + 'Correct'] + (ok ? 1 : 0)
        lastResult[a.modality] = { said: a.said, expected, ok }
      }
      updates.correct = correct
      updates.lastResult = lastResult

      const next = this.data.roundIdx + 1
      this.setData({ ...updates, phase: 'feedback' })
      this.timer = setTimeout(() => {
        this.timer = null
        if (next >= this.data.trials) this.finish(updates)
        else this.showRound()
      }, FEEDBACK_MS)
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
      this.setData({ phase: 'done', ...updates, result, score: result.score })
      this.triggerEvent('finish', result)
    },
  },
})
