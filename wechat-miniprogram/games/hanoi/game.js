const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 3, observer() { this.reset() } },
  },
  data: {
    disks: 3,
    pegs: [[], [], []],
    goal: 2,
    optimal: 7,
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
      this.setData({ disks: seed.disks, pegs: seed.pegs.map((p) => p.slice()), goal: seed.goal, optimal: seed.optimal, selected: -1, moves: 0, phase: 'idle' })
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
      const from = this.data.pegs[this.data.selected]
      const to = this.data.pegs[idx]
      const disk = from[from.length - 1]
      const top = to[to.length - 1]
      if (top !== undefined && top < disk) {
        // 非法：大压小
        this.setData({ selected: -1 })
        return
      }
      const pegs = this.data.pegs.map((p) => p.slice())
      pegs[idx].push(pegs[this.data.selected].pop())
      const moves = this.data.moves + 1
      const selected = -1
      if (pegs[this.data.goal].length === this.data.disks) {
        const result = mod.score({ moves, optimal: this.data.optimal })
        this.setData({ pegs, moves, selected, phase: 'done' })
        this.triggerEvent('finish', result)
      } else {
        this.setData({ pegs, moves, selected })
      }
    },
  },
})
