const { getModule } = require('../../utils/registry')
const { drawCell } = require('../../utils/figure')

Page({
  data: {
    meta: {},
    questions: [],
    answers: [],
    current: 0,
    total: 0,
    progress: 0,
    q: null,
    qType: 'scale',
    answeredCount: 0,
  },

  onLoad(query) {
    const mod = getModule(query.id)
    if (!mod) {
      wx.showToast({ title: '未找到测评', icon: 'none' })
      return
    }
    const questions = mod.getQuestions()
    this.dpr = (wx.getWindowInfo ? wx.getWindowInfo().pixelRatio : wx.getSystemInfoSync().pixelRatio) || 2
    this.mod = mod
    this.setData({
      meta: {
        id: mod.id,
        name: mod.name,
        icon: mod.icon,
        color: mod.color,
      },
      questions,
      answers: questions.map(() => null),
      total: questions.length,
      current: 0,
      answeredCount: 0,
    })
    wx.setNavigationBarTitle({ title: mod.name })
    this.renderCurrent()
  },

  renderCurrent() {
    const i = this.data.current
    const q = this.data.questions[i]
    this.setData(
      {
        q,
        qType: q.type,
        progress: Math.round(((i + 1) / this.data.total) * 100),
      },
      () => {
        if (q.type === 'matrix') this.drawFigures()
      }
    )
  },

  drawFigures() {
    const q = this.data.q
    const sel = this.data.answers[this.data.current]
    const dpr = this.dpr
    const { drawCell } = require('../../utils/figure')

    wx.createSelectorQuery()
      .in(this)
      .select('#matrixCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const W = res[0].width
        const H = res[0].height
        canvas.width = W * dpr
        canvas.height = H * dpr
        ctx.scale(dpr, dpr)
        ctx.clearRect(0, 0, W, H)
        const cell = W / 3
        q.matrix.forEach((row, r) => {
          row.forEach((c, col) => drawCell(ctx, c, col * cell, r * cell, cell))
        })
        ctx.strokeStyle = '#e2e8f0'
        ctx.lineWidth = 1
        for (let i = 1; i < 3; i++) {
          ctx.beginPath()
          ctx.moveTo(i * cell, 0)
          ctx.lineTo(i * cell, H)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(0, i * cell)
          ctx.lineTo(W, i * cell)
          ctx.stroke()
        }
      })

    q.options.forEach((opt, idx) => {
      wx.createSelectorQuery()
        .in(this)
        .select('#opt' + idx)
        .fields({ node: true, size: true })
        .exec((res2) => {
          if (!res2[0]) return
          const canvas = res2[0].node
          const ctx = canvas.getContext('2d')
          const W = res2[0].width
          const H = res2[0].height
          canvas.width = W * dpr
          canvas.height = H * dpr
          ctx.scale(dpr, dpr)
          ctx.clearRect(0, 0, W, H)
          drawCell(ctx, opt, 0, 0, W)
          if (sel === idx) {
            ctx.strokeStyle = '#2563eb'
            ctx.lineWidth = 4
            ctx.strokeRect(2, 2, W - 4, H - 4)
          }
        })
    })
  },

  selectAnswer(e) {
    const idx = e.currentTarget.dataset.index
    const answers = this.data.answers.slice()
    answers[this.data.current] = idx
    const answeredCount = answers.filter((a) => a !== null).length
    this.setData({ answers, answeredCount }, () => {
      if (this.data.qType === 'matrix') this.drawFigures()
    })
  },

  prev() {
    if (this.data.current === 0) return
    this.setData({ current: this.data.current - 1 }, () => this.renderCurrent())
  },

  next() {
    if (this.data.current < this.data.total - 1) {
      this.setData({ current: this.data.current + 1 }, () => this.renderCurrent())
    } else {
      this.submit()
    }
  },

  submit() {
    const unanswered = this.data.answers.filter((a) => a === null).length
    if (unanswered > 0) {
      wx.showModal({
        title: '还有题目未作答',
        content: `剩余 ${unanswered} 题未作答，提交后将按未完成处理。确定提交？`,
        success: (r) => {
          if (r.confirm) this.doSubmit()
        },
      })
      return
    }
    this.doSubmit()
  },

  doSubmit() {
    const app = getApp()
    app.globalData.lastResult = {
      id: this.data.meta.id,
      answers: this.data.answers,
    }
    wx.redirectTo({ url: `/pages/result/result?id=${this.data.meta.id}` })
  },
})
