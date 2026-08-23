const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 2, observer() { this.reset() } },
  },
  data: {
    grid: 3,
    total: 9,
    trials: 10,
    active: -1,
    shown: 0,
    hits: 0,
    misses: 0,
    phase: 'idle',
  },
  lifetimes: {
    attached() { this.reset() },
    detached() { this.clearTimers() },
  },
  methods: {
    clearTimers() {
      if (this.timers) { this.timers.forEach((t) => clearTimeout(t)); this.timers = [] }
    },
    reset() {
      this.clearTimers()
      this.timers = []
      const seed = mod.generate(this.data.level)
      this.setData({ grid: seed.grid, total: seed.total, trials: seed.trials, active: -1, shown: 0, hits: 0, misses: 0, phase: 'idle' })
    },
    start() {
      if (this.data.phase !== 'idle' && this.data.phase !== 'done') return
      this.setData({ phase: 'play', hits: 0, misses: 0, shown: 0, active: -1 })
      this.loop()
    },
    loop() {
      if (this.data.shown >= this.data.trials) {
        const result = mod.score({ hits: this.data.hits, misses: this.data.misses })
        this.setData({ phase: 'done' })
        this.triggerEvent('finish', result)
        return
      }
      const pos = Math.floor(Math.random() * this.data.total)
      this.setData({ active: pos, shown: this.data.shown + 1 })
      const hide = setTimeout(() => {
        this.setData({ active: -1 })
        const gap = setTimeout(() => this.loop(), 250)
        this.timers.push(gap)
      }, 650)
      this.timers.push(hide)
    },
    onTap(e) {
      if (this.data.phase !== 'play') return
      if (e.currentTarget.dataset.idx !== this.data.active) {
        this.setData({ misses: this.data.misses + 1 })
        return
      }
      this.setData({ active: -1, hits: this.data.hits + 1 })
    },
  },
})
