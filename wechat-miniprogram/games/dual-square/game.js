const mod = require('./index')
const sound = require('../../utils/sound')

const TONE1_MS = 300   // 第一个音
const TONE2_MS = 1200  // 第二个音
const WINDOW_MS = 2200 // 本轮按压窗口（截止）
const FB_MS = 450      // 反馈停顿

Component({
  properties: {
    level: { type: Number, value: 1, observer() { this.reset() } },
  },
  data: {
    rounds: 3,
    idx: 0,
    phase: 'idle',
    cells: [],
    correct: 0,
    total: 0,
    mark: '',
  },
  lifetimes: {
    attached() { this.reset() },
    detached() { this.clearTimers() },
  },
  methods: {
    clearTimers() {
      if (this._t1) clearTimeout(this._t1)
      if (this._t2) clearTimeout(this._t2)
      if (this._t3) clearTimeout(this._t3)
      if (this._t4) clearTimeout(this._t4)
      this._t1 = this._t2 = this._t3 = this._t4 = null
    },
    reset() {
      this.clearTimers()
      this._seed = mod.generate(this.data.level)
      this._windowOpen = false
      this._pressed = false
      this.setData({
        rounds: this._seed.rounds,
        idx: 0,
        phase: 'idle',
        cells: [],
        correct: 0,
        total: 0,
        mark: '',
      })
    },
    start() {
      if (this.data.phase !== 'idle' && this.data.phase !== 'done') return
      this.setData({ correct: 0, total: 0, idx: 0 })
      this.showRound()
    },
    showRound() {
      if (this.data.idx >= this._seed.list.length) {
        const result = mod.score({ correct: this.data.correct, total: this.data.total })
        sound.success()
        this.setData({ phase: 'done' })
        this.triggerEvent('finish', result)
        return
      }
      this._answered = false
      this._windowOpen = true
      this._pressed = false
      const cur = this._seed.list[this.data.idx]
      this._cur = cur
      this.setData({ phase: 'play', cells: cur.cells, mark: '' })
      this._t1 = setTimeout(() => sound.tone(cur.tones[0], 0.25, 'sine', 0.22), TONE1_MS)
      this._t2 = setTimeout(() => sound.tone(cur.tones[1], 0.25, 'sine', 0.22), TONE2_MS)
      this._t3 = setTimeout(() => this.evaluate(), WINDOW_MS)
    },
    onSpace() {
      if (this.data.phase !== 'play' || !this._windowOpen) return
      this._pressed = true
      this.evaluate()
    },
    evaluate() {
      if (this._answered) return
      this._answered = true
      this.clearTimers()
      this._windowOpen = false
      const expected = this._cur.square || this._cur.doubleTone
      const ok = this._pressed === expected
      if (ok) sound.hit()
      else sound.miss()
      const correct = this.data.correct + (ok ? 1 : 0)
      const idx = this.data.idx + 1
      this.setData({ correct, total: idx, idx, phase: 'fb', mark: ok ? '✓' : '✗' })
      this._t4 = setTimeout(() => this.showRound(), FB_MS)
    },
  },
})
