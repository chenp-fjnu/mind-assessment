const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 4, observer() { this.reset() } },
  },
  data: {
    size: 4,
    cells: [],
    pattern: [],
    selected: [],
    phase: 'idle', // idle | show | input | done
    correct: 0,
    total: 0,
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
        size: seed.size,
        pattern: seed.cells,
        cells: seed.cells.map((v) => !!v),
        selected: [],
        phase: 'idle',
        correct: 0,
        total: 0,
      })
    },
    start() {
      if (this.data.phase !== 'idle' && this.data.phase !== 'done') return
      this.setData({ phase: 'show', cells: this.data.pattern.map((v) => !!v) })
      this.timer = setTimeout(() => {
        this.setData({
          phase: 'input',
          cells: this.data.pattern.map(() => false),
          selected: [],
        })
      }, this.data.size * this.data.size * 60 + 700)
    },
    onTap(e) {
      if (this.data.phase !== 'input') return
      const idx = e.currentTarget.dataset.idx
      const selected = this.data.selected.slice()
      const at = selected.indexOf(idx)
      if (at >= 0) selected.splice(at, 1)
      else selected.push(idx)
      const cells = this.data.cells.slice()
      cells[idx] = !cells[idx]
      this.setData({ selected, cells })
    },
    onSubmit() {
      if (this.data.phase !== 'input') return
      let correct = 0
      for (let i = 0; i < this.data.pattern.length; i++) {
        const sel = this.data.selected.indexOf(i) >= 0
        if (sel === this.data.pattern[i]) correct++
      }
      const result = mod.score({ correct, total: this.data.pattern.length })
      this.setData({ phase: 'done', correct, total: this.data.pattern.length })
      this.triggerEvent('finish', result)
    },
  },
})
