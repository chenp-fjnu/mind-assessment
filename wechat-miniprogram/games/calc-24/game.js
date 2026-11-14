const mod = require('./index')
const sound = require('../../utils/sound')

// 算24点交互组件：点 4 张数字卡 + 运算符拼成算式，点「=」校验。
// 用时为主指标（越低越好）。计时由宿主「开始游戏」按钮统一触发，保证公平计时。
Component({
  properties: {
    level: {
      type: Number,
      value: 1,
      observer() {
        this.reset()
      },
    },
  },
  data: {
    accent: '#0891b2',
    problems: 4,
    cur: null, // { nums, target, answer }
    cards: [], // [{ v, used }]
    tokens: [], // [{ t:'num', v, card } | { t:'op', v }]
    pi: 0,
    phase: 'idle', // idle | play | done
    correct: 0,
    errors: 0,
    time: 0,
    startT: 0,
    flash: '', // '' | 'bad'
    showAns: false,
  },
  lifetimes: {
    attached() {
      this.reset()
    },
    detached() {
      this.clearTimers()
    },
  },
  methods: {
    clearTimers() {
      if (this._timer) {
        clearInterval(this._timer)
        this._timer = null
      }
      if (this._flashT) {
        clearTimeout(this._flashT)
        this._flashT = null
      }
    },
    reset() {
      this.clearTimers()
      const seed = mod.generate(this.data.level)
      this.setData({
        problems: seed.problems,
        cur: { nums: seed.nums, target: seed.target, answer: seed.answer },
        cards: seed.nums.map((v) => ({ v, used: false })),
        pi: 0,
        tokens: [],
        correct: 0,
        errors: 0,
        time: 0,
        startT: 0,
        phase: 'idle',
        flash: '',
        showAns: false,
      })
      this.triggerEvent('showStartButton', { text: '开始游戏' })
    },
    start() {
      if (this.data.phase !== 'idle' && this.data.phase !== 'done') return
      const cards = this.data.cur.nums.map((v) => ({ v, used: false }))
      this.clearTimers()
      this.setData({
        cards,
        tokens: [],
        correct: 0,
        errors: 0,
        pi: 0,
        time: 0,
        startT: Date.now(),
        phase: 'play',
        flash: '',
        showAns: false,
      })
      this.triggerEvent('hideStartButton')
      this.startTimer()
    },
    loadProblem(i) {
      const p = mod.genOne(this.data.level)
      this.setData({
        pi: i,
        cur: { nums: p.nums, target: p.target, answer: p.answer },
        cards: p.nums.map((v) => ({ v, used: false })),
        tokens: [],
        flash: '',
        showAns: false,
      })
    },
    exprString() {
      return this.data.tokens.map((t) => String(t.v)).join(' ')
    },
    onNum(e) {
      if (this.data.phase !== 'play') return
      const idx = e.currentTarget.dataset.idx
      const cards = this.data.cards.map((c) => ({ ...c }))
      if (cards[idx].used) return
      sound.tap()
      cards[idx].used = true
      this.setData({
        cards,
        tokens: this.data.tokens.concat([{ t: 'num', v: cards[idx].v, card: idx }]),
        flash: '',
      })
    },
    onOp(e) {
      if (this.data.phase !== 'play') return
      const v = e.currentTarget.dataset.op
      sound.tap()
      this.setData({ tokens: this.data.tokens.concat([{ t: 'op', v }]), flash: '' })
    },
    onBack() {
      if (this.data.phase !== 'play') return
      const tokens = this.data.tokens.slice()
      const last = tokens.pop()
      const cards = this.data.cards.map((c) => ({ ...c }))
      if (last && last.t === 'num') cards[last.card].used = false
      this.setData({ tokens, cards, flash: '' })
    },
    onClear() {
      if (this.data.phase !== 'play') return
      const cards = this.data.cards.map((c) => ({ ...c, used: false }))
      this.setData({ tokens: [], cards, flash: '' })
    },
    onHint() {
      if (this.data.phase !== 'play') return
      this.setData({ showAns: true })
    },
    onSubmit() {
      if (this.data.phase !== 'play') return
      const r = mod.check24(this.exprString(), this.data.cur.nums)
      if (r.ok) {
        sound.hit()
        const correct = this.data.correct + 1
        const pi = this.data.pi + 1
        if (pi >= this.data.problems) {
          this.finish(correct)
        } else {
          this.setData({ correct })
          this.loadProblem(pi)
        }
      } else {
        sound.miss()
        this.vibe()
        this.setData({ errors: this.data.errors + 1, flash: 'bad' })
        if (this._flashT) clearTimeout(this._flashT)
        this._flashT = setTimeout(() => {
          this._flashT = null
          this.setData({ flash: '' })
        }, 600)
      }
    },
    finish(correct) {
      const time = Math.round((Date.now() - this.data.startT) / 100) / 10
      this.clearTimers()
      const result = mod.score({
        time,
        correct,
        total: this.data.problems,
        errors: this.data.errors,
      })
      result.time = time
      sound.success()
      this.setData({ phase: 'done', time, correct, showAns: false })
      this.triggerEvent('finish', result)
      this.triggerEvent('showStartButton', { text: '再玩一次' })
    },
    startTimer() {
      if (this._timer) {
        clearInterval(this._timer)
        this._timer = null
      }
      this._timer = setInterval(() => {
        const t = Math.round((Date.now() - this.data.startT) / 100) / 10
        this.setData({ time: t })
      }, 100)
    },
    vibe() {
      try {
        wx.vibrateShort({ type: 'light' })
      } catch (e) {
        /* 忽略 */
      }
    },
  },
})
