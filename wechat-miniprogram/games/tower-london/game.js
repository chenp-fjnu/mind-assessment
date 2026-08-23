const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 2, observer() { this.reset() } },
  },
  data: {
    pegs: [[], [], []],
    goal: [[], [], []],
    balls: [],
    selected: -1,
    moves: 0,
    phase: 'idle',
  },
  lifetimes: {
    attached() { this.reset() },
  },
  methods: {
    reset() {
      const seed = mod.generate(this.data.level)
      this.setData({
        pegs: seed.start.map((p) => p.slice()),
        goal: seed.goal.map((p) => p.slice()),
        balls: seed.balls,
        selected: -1,
        moves: 0,
        phase: 'idle',
      })
    },
    start() {
      if (this.data.phase !== 'idle' && this.data.phase !== 'done') return
      this.setData({ phase: 'play', moves: 0, selected: -1 })
    },
    onPeg(e) {
      if (this.data.phase !== 'play') {
        this.start()
        return
      }
      const idx = parseInt(e.currentTarget.dataset.idx, 10)
      if (this.data.selected === -1) {
        if (this.data.pegs[idx].length === 0) return
        this.setData({ selected: idx })
        return
      }
      if (idx === this.data.selected) {
        this.setData({ selected: -1 })
        return
      }
      const pegs = this.data.pegs.map((p) => p.slice())
      pegs[idx].push(pegs[this.data.selected].pop())
      const moves = this.data.moves + 1
      if (JSON.stringify(pegs) === JSON.stringify(this.data.goal)) {
        const result = mod.score({ moves })
        this.setData({ pegs, moves, selected: -1, phase: 'done' })
        this.triggerEvent('finish', result)
      } else {
        this.setData({ pegs, moves, selected: -1 })
      }
    },
  },
})
