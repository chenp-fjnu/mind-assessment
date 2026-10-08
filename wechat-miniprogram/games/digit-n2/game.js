const mod = require('./index')
const sound = require('../../utils/sound')
const cue = require('../../utils/cue')

const WINDOW_MS = 700   // 每条线索的按压窗口
const FEEDBACK_MS = 400 // 判定后展示反馈的停顿

Component({
  properties: {
    level: { type: Number, value: 1, observer() { this.reset() } },
  },
  data: {
    n: 10,
    list: [],
    idx: 0,
    phase: 'idle',
    correct: 0,
    total: 0,
    shown: '',
    mark: '',
  },
  lifetimes: {
    attached() { this.reset() },
    detached() { this.clearTimers(); cue.destroy() },
  },
  methods: {
    clearTimers() {
      if (this._cueT) clearTimeout(this._cueT)
      if (this._winT) clearTimeout(this._winT)
      if (this._fbT) clearTimeout(this._fbT)
      this._cueT = this._winT = this._fbT = null
    },
    reset() {
      this.clearTimers()
      cue.stop()
      this._seed = mod.generate(this.data.level)
      this._windowOpen = false
      this._pressed = false
      this.setData({
        n: this._seed.n,
        list: this._seed.list,
        idx: 0,
        phase: 'idle',
        correct: 0,
        total: 0,
        shown: '',
        mark: '',
      })
    },
    start() {
      if (this.data.phase !== 'idle' && this.data.phase !== 'done') return
      this.setData({ correct: 0, total: 0, idx: 0, phase: 'play', shown: '', mark: '' })
      this._cueT = setTimeout(() => this.cueNext(), 500)
    },
    cueNext() {
      this._cueT = null
      if (this.data.idx >= this._seed.list.length) {
        const result = mod.score({ correct: this.data.correct, total: this.data.total })
        sound.success()
        this.setData({ phase: 'done', shown: '', mark: '' })
        this.triggerEvent('finish', result)
        return
      }
      const digit = this._seed.list[this.data.idx]
      this._pressed = false
      this._windowOpen = true
      this.setData({ phase: 'play', shown: '' })
      cue.play('d' + digit)
      this._winT = setTimeout(() => this.closeWindow(), WINDOW_MS)
    },
    onSpace() {
      if (this.data.phase !== 'play' || !this._windowOpen) return
      this._pressed = true
      this.closeWindow()
    },
    closeWindow() {
      if (!this._windowOpen) return
      this._windowOpen = false
      if (this._winT) clearTimeout(this._winT)
      this._winT = null
      const i = this.data.idx
      const digit = this._seed.list[i]
      const expected = mod.isTarget(this._seed.list, i)
      const ok = this._pressed === expected
      if (ok) sound.hit()
      else sound.miss()
      const correct = this.data.correct + (ok ? 1 : 0)
      const idx = i + 1
      this.setData({
        correct,
        total: idx,
        idx,
        phase: 'fb',
        shown: digit,
        mark: ok ? '✓' : '✗',
      })
      this._fbT = setTimeout(() => this.cueNext(), FEEDBACK_MS)
    },
  },
})
