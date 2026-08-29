const mod = require('./index')
const sound = require('../../utils/sound')

Component({
  properties: {
    level: { type: Number, value: 2, observer() { this.reset() } },
    boardWidth: { type: Number, value: 705, observer() { this.computeLayout() } },
    boardHeight: { type: Number, value: 0, observer() { this.computeLayout() } },
  },
  data: {
    grid: 3,
    total: 9,
    moles: 10,
    bombCount: 0,
    showMs: 650,
    gapMs: 300,
    cell: 200,
    active: -1,
    activeType: '',
    hits: 0,
    misses: 0,
    escaped: 0,
    bombs: 0,
    score: 0,
    combo: 0,
    bestCombo: 0,
    popIdx: -1,
    popType: '',
    shake: false,
    phase: 'idle',
  },
  lifetimes: {
    attached() { this.computeLayout(); this.reset() },
    detached() { this.clearTimers() },
  },
  methods: {
    clearTimers() {
      if (this.timers) { this.timers.forEach((t) => clearTimeout(t)); this.timers = [] }
      if (this._hide) { clearTimeout(this._hide); this._hide = null }
      if (this._gap) { clearTimeout(this._gap); this._gap = null }
      if (this._pop) { clearTimeout(this._pop); this._pop = null }
      if (this._shake) { clearTimeout(this._shake); this._shake = null }
    },
    computeLayout() {
      const grid = this.data.grid || 3
      const gap = 18
      const w = this.data.boardWidth || 705
      const h = this.data.boardHeight || 0
      const padW = 40
      const availW = w - padW
      // 全屏时 boardHeight 有效，按可用高度（扣除 HUD/按钮）让格子尽量大
      const availH = h > 0 ? h - 220 : availW
      let cell = Math.floor(Math.min(availW, availH) / grid) - gap
      cell = Math.max(120, Math.min(cell, 300))
      this.setData({ cell })
    },
    buildQueue(seed) {
      const bombCount = seed.bombMin + Math.floor(Math.random() * (seed.bombMax - seed.bombMin + 1))
      const q = []
      for (let i = 0; i < seed.moles; i++) q.push('mole')
      for (let i = 0; i < bombCount; i++) q.push('bomb')
      // Fisher–Yates 打乱，使炸弹随机穿插在地鼠之间
      for (let i = q.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const t = q[i]; q[i] = q[j]; q[j] = t
      }
      this._queue = q
      this._qi = 0
      return bombCount
    },
    reset() {
      this.clearTimers()
      this.timers = []
      const seed = mod.generate(this.data.level)
      this.setData({
        grid: seed.grid, total: seed.total, moles: seed.moles, bombCount: 0, showMs: seed.showMs,
        gapMs: seed.gapMs, active: -1, activeType: '', hits: 0, misses: 0, escaped: 0,
        bombs: 0, score: 0, combo: 0, bestCombo: 0, popIdx: -1, popType: '', phase: 'idle',
      })
      this.triggerEvent('showStartButton', { text: '开始游戏' })
    },
    start() {
      if (this.data.phase !== 'idle' && this.data.phase !== 'done') return
      this.triggerEvent('hideStartButton')
      const seed = mod.generate(this.data.level)
      const bombCount = this.buildQueue(seed)
      this.setData({ phase: 'play', bombs: 0, bombCount, hits: 0, misses: 0, escaped: 0, score: 0, combo: 0, bestCombo: 0, active: -1, activeType: '' })
      this.loop()
    },
    loop() {
      if (this._qi >= this._queue.length) {
        const result = mod.score({
          hits: this.data.hits, misses: this.data.misses, escaped: this.data.escaped,
          bombs: this.data.bombs, score: this.data.score, bestCombo: this.data.bestCombo,
        })
        this.setData({ phase: 'done' })
        this.triggerEvent('finish', result)
        this.triggerEvent('showStartButton', { text: '再玩一次' })
        return
      }
      const type = this._queue[this._qi++]
      const pos = Math.floor(Math.random() * this.data.total)
      this.setData({ active: pos, activeType: type })
      this._hide = setTimeout(() => {
        this._hide = null
        // 地鼠溜走：断连击；炸弹自然消失：安全（连击保留）
        if (type !== 'bomb') {
          this.setData({ escaped: this.data.escaped + 1, combo: 0 })
        }
        this.setData({ active: -1, activeType: '' })
        this._gap = setTimeout(() => { this._gap = null; this.loop() }, this.data.gapMs)
        this.timers.push(this._gap)
      }, this.data.showMs)
      this.timers.push(this._hide)
    },
    nextMole() {
      if (this._hide) { clearTimeout(this._hide); this._hide = null }
      if (this._gap) { clearTimeout(this._gap); this._gap = null }
      this.loop()
    },
    flash(idx, type) {
      this.setData({ popIdx: idx, popType: type })
      if (this._pop) clearTimeout(this._pop)
      this._pop = setTimeout(() => { this._pop = null; this.setData({ popIdx: -1, popType: '' }) }, 320)
    },
    haptic(kind) {
      try {
        wx.vibrateShort({ type: kind === 'bomb' ? 'heavy' : 'light' })
      } catch (e) { /* 不支持时忽略 */ }
    },
    triggerShake() {
      this.setData({ shake: true })
      if (this._shake) clearTimeout(this._shake)
      this._shake = setTimeout(() => { this._shake = null; this.setData({ shake: false }) }, 400)
    },
    onTap(e) {
      if (this.data.phase !== 'play') return
      if (this.data.active === -1) return
      const idx = parseInt(e.currentTarget.dataset.idx, 10)
      if (idx !== this.data.active) {
        // 点错洞：记一次失误并断连击
        this.setData({ misses: this.data.misses + 1, combo: 0 })
        return
      }
      const type = this.data.activeType
      if (type === 'bomb') {
        // 点到炸弹：扣分、断连击、记一次炸弹失误，并触发屏幕抖动
        this.setData({ bombs: this.data.bombs + 1, combo: 0, score: Math.max(0, this.data.score - 15) })
        this.flash(idx, 'bomb')
        this.haptic('bomb')
        this.triggerShake()
        sound.miss()
      } else {
        const combo = this.data.combo + 1
        const mult = Math.min(combo, 5)
        const gained = 10 * mult
        const bestCombo = Math.max(this.data.bestCombo, combo)
        this.setData({ hits: this.data.hits + 1, combo, bestCombo, score: this.data.score + gained })
        this.flash(idx, 'hit')
        sound.hit()
      }
      this.setData({ active: -1, activeType: '' })
      this.nextMole()
    },
  },
})
