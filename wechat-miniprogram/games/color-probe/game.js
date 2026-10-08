const mod = require('./index')
const sound = require('../../utils/sound')

const SHOW_MS = 1400  // 色块组展示时长
const PROBE_MS = 2600  // 探针等待作答时长（超时判错）
const FB_MS = 450      // 反馈停顿

Component({
  properties: {
    level: { type: Number, value: 1, observer() { this.reset() } },
  },
  data: {
    n: 4,
    trials: [],
    idx: 0,
    phase: 'idle', // idle | show | probe | fb | done
    cur: null,
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
      this._t1 = this._t2 = this._t3 = null
    },
    reset() {
      this.clearTimers()
      this._seed = mod.generate(this.data.level)
      this._answered = false
      this.setData({
        n: this._seed.n,
        trials: this._seed.trials,
        idx: 0,
        phase: 'idle',
        cur: null,
        correct: 0,
        total: 0,
        mark: '',
      })
    },
    start() {
      if (this.data.phase !== 'idle' && this.data.phase !== 'done') return
      this.setData({ correct: 0, total: 0, idx: 0 })
      this.showTrial()
    },
    showTrial() {
      if (this.data.idx >= this._seed.trials.length) {
        const result = mod.score({ correct: this.data.correct, total: this.data.total })
        sound.success()
        this.setData({ phase: 'done', cur: null })
        this.triggerEvent('finish', result)
        return
      }
      this._answered = false
      const cur = this._seed.trials[this.data.idx]
      this.setData({ cur, phase: 'show', mark: '' })
      this._t1 = setTimeout(() => {
        this.setData({ phase: 'probe' })
        this._t2 = setTimeout(() => this.respond(''), PROBE_MS)
      }, SHOW_MS)
    },
    onAnswer(e) {
      if (this.data.phase !== 'probe' || this._answered) return
      this.respond(e.currentTarget.dataset.key)
    },
    respond(key) {
      if (this._answered) return
      this._answered = true
      this.clearTimers()
      const cur = this.data.cur
      const ok = key === cur.answer
      if (ok) sound.hit()
      else sound.miss()
      const correct = this.data.correct + (ok ? 1 : 0)
      const total = this.data.total + 1
      const idx = this.data.idx + 1
      this.setData({ correct, total, idx, phase: 'fb', mark: ok ? '✓' : '✗' })
      this._t3 = setTimeout(() => this.showTrial(), FB_MS)
    },
  },
})
