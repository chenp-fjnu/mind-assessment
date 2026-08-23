const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 4, observer() { this.reset() } },
  },
  data: {
    len: 4,
    seq: [],
    phase: 'idle',
    input: [],
    correct: 0,
    total: 0,
    showText: '',
  },
  lifetimes: {
    attached() { this.reset() },
    detached() { this.clearTimer() },
  },
  methods: {
    clearTimer() {
      if (this.timer) { clearTimeout(this.timer); this.timer = null }
    },
    reset() {
      this.clearTimer()
      const seed = mod.generate(this.data.level)
      this.setData({
        len: seed.len,
        seq: seed.seq,
        phase: 'idle',
        input: [],
        correct: 0,
        total: 0,
        showText: seed.seq.join(' '),
      })
    },
    start() {
      if (this.data.phase !== 'idle' && this.data.phase !== 'done') return
      this.setData({ phase: 'show', input: [] })
      this.timer = setTimeout(() => this.setData({ phase: 'input' }), this.data.len * 700 + 400)
    },
    onPad(e) {
      if (this.data.phase !== 'input') return
      const d = parseInt(e.currentTarget.dataset.d, 10)
      const input = this.data.input.concat(d)
      const i = input.length - 1
      const ok = input[i] === this.data.seq[i]
      const correct = this.data.correct + (ok ? 1 : 0)
      const total = this.data.total + 1
      if (input.length >= this.data.len) {
        this.clearTimer()
        const result = mod.score({ correct, total })
        this.setData({ phase: 'done', correct, total })
        this.triggerEvent('finish', result)
      } else {
        this.setData({ input, correct, total })
      }
    },
  },
})
