const mod = require('./index')

Component({
  properties: {
    level: { type: Number, value: 6, observer() { this.reset() } },
    boardWidth: { type: Number, value: 705, observer() { this.computeCardSize() } },
    boardHeight: { type: Number, value: 0, observer() { this.computeCardSize() } },
  },
  data: {
    cards: [],
    flipped: [],
    matched: 0,
    moves: 0,
    cols: 4,
    running: false,
    lock: false,
    cardSize: 0,
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
      this.computeCardSize()
    },
    computeCardSize() {
      const cols = this.data.cols
      const gap = 12 // rpx
      const padding = 32 // rpx
      const viewportWidth = this.data.boardWidth || 705
      const cardW = Math.floor((viewportWidth - padding * 2 - gap * (cols - 1)) / cols)
      let final = cardW
      const bh = this.data.boardHeight
      if (bh > 0) {
        const rows = Math.ceil(this.data.cards.length / cols)
        const cardH = Math.floor((bh - padding * 2 - gap * (rows - 1)) / rows)
        final = Math.min(cardW, cardH)
      }
      // 限制最大卡片尺寸，避免过大
      final = Math.min(final, 160)
      final = Math.max(final, 72)
      this.setData({ cardSize: final })
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
