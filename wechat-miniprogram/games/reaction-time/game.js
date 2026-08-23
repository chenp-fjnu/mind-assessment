const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 10, observer() { this.reset() } },
  },
  data: {
    trials: 10,
    phase: 'idle', // idle | wait | go | early | done
    idx: 0,
    times: [],
    early: 0,
    hint: '点击开始',
  },
  lifetimes: {
    attached() { this.reset() },
    detached() { this.clearTimer() },
  },
  methods: {
    clearTimer() {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
    },
    reset() {
      this.clearTimer()
      this.setData({
        trials: this.data.level,
        phase: 'idle',
        idx: 0,
        times: [],
        early: 0,
        hint: '点击开始',
      })
    },
    start() {
      if (this.data.phase !== 'idle' && this.data.phase !== 'done') return
      this.beginTrial()
    },
    beginTrial() {
      this.setData({ phase: 'wait', hint: '等待绿色…' })
      const delay = 800 + Math.random() * 2000
      this.timer = setTimeout(() => {
        this.setData({ phase: 'go', hint: '点！', goTs: Date.now() })
      }, delay)
    },
    onTap() {
      const phase = this.data.phase
      if (phase === 'idle' || phase === 'done') {
        this.start()
        return
      }
      if (phase === 'wait') {
        // 太早
        this.clearTimer()
        const early = this.data.early + 1
        this.setData({ phase: 'early', hint: '太早了！', early })
        this.timer = setTimeout(() => this.beginTrial(), 900)
        return
      }
      if (phase === 'go') {
        const rt = Date.now() - this.data.goTs
        const times = this.data.times.concat(rt)
        const idx = this.data.idx + 1
        if (idx >= this.data.trials) {
          this.finish(times)
        } else {
          this.setData({ times, idx, phase: 'wait', hint: '等待绿色…' })
          this.beginTrial()
        }
      }
    },
    finish(times) {
      this.clearTimer()
      const result = mod.score({ times, total: this.data.trials, early: this.data.early })
      this.setData({ phase: 'done', hint: '完成！' })
      this.triggerEvent('finish', result)
    },
  },
})
