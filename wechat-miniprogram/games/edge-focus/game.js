const mod = require('./index')
const sound = require('../../utils/sound')

Component({
  properties: {
    level: { type: Number, value: 1, observer() { this.reset() } },
  },
  data: {
    rounds: 8,
    target: '●',
    grid: [],
    idx: 0,
    phase: 'idle',
    correct: 0,
    total: 0,
    flash: '',
  },
  lifetimes: {
    attached() { this.reset() },
    detached() { this.clearTimers() },
  },
  methods: {
    clearTimers() {
      if (this._round) clearTimeout(this._round)
      if (this._adv) clearTimeout(this._adv)
      this._round = this._adv = null
    },
    buildGrid(cur) {
      // 中央放 index 4，边缘按序环绕
      const chars = cur.edges.slice(0, 4).concat([cur.center], cur.edges.slice(4))
      return chars.map((ch) => ({ ch }))
    },
    reset() {
      this.clearTimers()
      this._seed = mod.generate(this.data.level)
      this.setData({
        rounds: this._seed.rounds,
        target: this._seed.target,
        grid: [],
        idx: 0,
        phase: 'idle',
        correct: 0,
        total: 0,
        flash: '',
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
      this._evaluated = false
      const cur = this._seed.list[this.data.idx]
      this._cur = cur
      this.setData({ grid: this.buildGrid(cur), phase: 'play', flash: '' })
      this._round = setTimeout(() => this.evaluate(false), 1700)
    },
    onSpace() {
      if (this.data.phase !== 'play' || this._evaluated) return
      this._evaluated = true
      clearTimeout(this._round)
      this.evaluate(true)
    },
    evaluate(pressed) {
      const ok = pressed === this._cur.central
      if (ok) sound.hit()
      else sound.miss()
      const correct = this.data.correct + (ok ? 1 : 0)
      const total = this.data.total + 1
      const idx = this.data.idx + 1
      this._evaluated = true
      this.setData({ correct, total, idx, phase: 'flash', flash: ok ? 'ok' : 'bad' })
      this._adv = setTimeout(() => this.showRound(), 320)
    },
  },
})
