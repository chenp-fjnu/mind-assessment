const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 6, observer() { this.reset() } },
  },
  data: {
    cards: [],
    flipped: [],
    matched: 0,
    moves: 0,
    cols: 4,
    running: false,
    lock: false,
  },
  lifetimes: {
    attached() { this.reset() },
  },
  methods: {
    reset() {
      const pairs = this.data.level
      const seed = mod.generate(pairs)
      const cards = seed.deck.map((sym, id) => ({
        id,
        sym: mod.symbols[sym],
        faceUp: false,
        matched: false,
      }))
      const cols = pairs <= 6 ? 3 : 4
      this.setData({ cards, cols, flipped: [], matched: 0, moves: 0, running: false, lock: false })
    },
    start() {
      this.setData({ running: true, startTime: Date.now() })
    },
    onTap(e) {
      const idx = e.currentTarget.dataset.idx
      const card = this.data.cards[idx]
      if (this.data.lock || card.faceUp || card.matched) return
      if (!this.data.running) this.start()
      const flipped = this.data.flipped.concat(idx)
      const fk = 'cards[' + idx + '].faceUp'
      this.setData({ [fk]: true, flipped })
      if (flipped.length === 2) {
        this.setData({ lock: true, moves: this.data.moves + 1 })
        const [a, b] = flipped
        if (this.data.cards[a].sym === this.data.cards[b].sym) {
          const ka = 'cards[' + a + '].matched'
          const kb = 'cards[' + b + '].matched'
          const matched = this.data.matched + 1
          this.setData({ [ka]: true, [kb]: true, flipped: [], lock: false, matched })
          if (matched >= this.data.level) this.finish()
        } else {
          setTimeout(() => {
            const ra = 'cards[' + a + '].faceUp'
            const rb = 'cards[' + b + '].faceUp'
            this.setData({ [ra]: false, [rb]: false, flipped: [], lock: false })
          }, 600)
        }
      }
    },
    finish() {
      const time = (Date.now() - this.data.startTime) / 1000
      const result = mod.score({ pairs: this.data.level, time, moves: this.data.moves })
      this.setData({ running: false })
      this.triggerEvent('finish', result)
    },
  },
})
