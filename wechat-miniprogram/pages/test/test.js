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
    optStyle: 'width:23%;',
    groupLabel: '',
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
    this._timer = null
    const setMeta = {}
    questions.forEach((qq, i) => {
      if (!qq.set) return
      if (!setMeta[qq.set]) setMeta[qq.set] = { total: 0, start: null }
      setMeta[qq.set].total++
      if (setMeta[qq.set].start === null) setMeta[qq.set].start = i
    })
    this._setMeta = setMeta
    const meta = { id: mod.id, name: mod.name, icon: mod.icon, color: mod.color }
    const answers = questions.map(() => null)

    this.setData(
      {
        meta,
        questions,
        answers,
        total: questions.length,
        current: 0,
        answeredCount: 0,
      },
      () => {
        const key = 'ma_progress_' + mod.id
        const saved = wx.getStorageSync(key)
        const hasProgress = saved && saved.answers && saved.answers.some((a) => a !== null)
        if (hasProgress) {
          wx.showModal({
            title: '继续测评',
            content: '发现未完成的「' + mod.name + '」，是否继续上次的进度？',
            confirmText: '继续',
            cancelText: '重新开始',
            success: (r) => {
              if (r.confirm) {
                this.setData(
                  {
                    answers: saved.answers,
                    current: saved.current || 0,
                    answeredCount: saved.answers.filter((a) => a !== null).length,
                  },
                  () => this.renderCurrent()
                )
              } else {
                wx.removeStorageSync(key)
                this.renderCurrent()
              }
            },
            fail: () => this.renderCurrent(),
          })
        } else {
          wx.removeStorageSync(key)
          this.renderCurrent()
        }
      }
    )
    wx.setNavigationBarTitle({ title: mod.name })
  },

  renderCurrent() {
    const i = this.data.current
    const q = this.data.questions[i]
    const n = (q.options || []).length
    let cols = 4
    if (n <= 2) cols = 2
    else if (n === 3) cols = 3
    else if (n === 6) cols = 3
    else if (n === 8) cols = 4
    const optStyle = 'width:' + (96 / cols).toFixed(2) + '%;'
    const needCanvas = q.type === 'matrix' || !!q.matrix
    let groupLabel = ''
    const gs = q.set
    if (gs && this._setMeta[gs]) {
      const gm = this._setMeta[gs]
      groupLabel = '第 ' + gs + ' 组 ' + (i - gm.start + 1) + '/' + gm.total
    }
    this.setData(
      {
        q,
        qType: q.type,
        progress: Math.round(((i + 1) / this.data.total) * 100),
        optStyle,
        groupLabel,
      },
      () => {
        if (needCanvas) this.drawFigures()
      }
    )
  },

  ensureCanvas(id, cb) {
    wx.createSelectorQuery()
      .in(this)
      .select('#' + id)
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const W = res[0].width
        const H = res[0].height
        if (!W || !H) {
          setTimeout(() => this.ensureCanvas(id, cb), 60)
          return
        }
        canvas.width = W * this.dpr
        canvas.height = H * this.dpr
        ctx.scale(this.dpr, this.dpr)
        cb(ctx, W, H)
      })
  },

  drawFigures() {
    const q = this.data.q
    const sel = this.data.answers[this.data.current]
    const self = this

    if (q.type === 'matrix') {
      this.ensureCanvas('matrixCanvas', (ctx, W, H) => {
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
        this.ensureCanvas('opt' + idx, (ctx, W, H) => {
          ctx.clearRect(0, 0, W, H)
          drawCell(ctx, opt, 0, 0, W)
          if (sel === idx) {
            ctx.strokeStyle = '#2563eb'
            ctx.lineWidth = 4
            ctx.strokeRect(2, 2, W - 4, H - 4)
          }
        })
      })
    }

    if (q.matrix) {
      this.ensureCanvas('targetCanvas', (ctx, W, H) => {
        ctx.clearRect(0, 0, W, H)
        const rows = q.matrix.length
        const cols = q.matrix[0].length
        const cw = W / cols
        const ch = H / rows
        q.matrix.forEach((row, r) => {
          row.forEach((c, col) => drawCell(ctx, c, col * cw, r * ch, Math.min(cw, ch)))
        })
      })
    }
  },

  selectAnswer(e) {
    const idx = e.currentTarget.dataset.index
    const answers = this.data.answers.slice()
    answers[this.data.current] = idx
    const answeredCount = answers.filter((a) => a !== null).length
    this.setData({ answers, answeredCount }, () => {
      if (this.data.qType === 'matrix') this.drawFigures()
      this.saveProgress()
      this.scheduleNext(this.data.qType === 'matrix' ? 700 : 350)
    })
  },

  scheduleNext(delay) {
    if (this._timer) clearTimeout(this._timer)
    this._timer = setTimeout(() => {
      if (this.data.current < this.data.total - 1) this.next()
      else this.submit()
    }, delay || 350)
  },

  prev() {
    if (this._timer) clearTimeout(this._timer)
    if (this.data.current === 0) return
    this.setData({ current: this.data.current - 1 }, () => this.renderCurrent())
  },

  next() {
    if (this._timer) clearTimeout(this._timer)
    const cur = this.data.current
    if (cur >= this.data.total - 1) {
      this.submit()
      return
    }
    const nxt = cur + 1
    const curSet = this.data.questions[cur].set
    const nxtSet = this.data.questions[nxt].set
    this.setData({ current: nxt }, () => this.renderCurrent())
    if (curSet && nxtSet && curSet !== nxtSet) this.showGroupSummary(curSet)
  },

  showGroupSummary(set) {
    const m = this._setMeta[set]
    if (!m) return
    let correct = 0
    for (let i = m.start; i < m.start + m.total; i++) {
      if (this.data.answers[i] === this.data.questions[i].answer) correct++
    }
    wx.showModal({
      title: set + ' 组完成',
      content: '本组答对 ' + correct + ' / ' + m.total,
      showCancel: false,
    })
  },

  saveProgress() {
    wx.setStorageSync('ma_progress_' + this.data.meta.id, {
      answers: this.data.answers,
      current: this.data.current,
    })
  },

  submit() {
    if (this._timer) clearTimeout(this._timer)
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
    wx.showModal({
      title: '提交测评',
      content: `已完成全部 ${this.data.total} 题，确认提交并查看结果？`,
      success: (r) => {
        if (r.confirm) this.doSubmit()
      },
    })
  },

  doSubmit() {
    wx.removeStorageSync('ma_progress_' + this.data.meta.id)
    const layout = this.mod.resultLayout || {}
    const r = this.mod.computeResult(this.data.answers, this.data.questions)
    const pv = r[layout.primaryField || 'score']
    const hist = wx.getStorageSync('ma_history') || []
    hist.unshift({
      id: this.data.meta.id,
      name: this.data.meta.name,
      icon: this.data.meta.icon,
      time: Date.now(),
      answers: this.data.answers,
      summary: pv == null ? '' : String(pv),
      level: r.level || '',
    })
    wx.setStorageSync('ma_history', hist.slice(0, 30))

    const app = getApp()
    app.globalData.lastResult = { id: this.data.meta.id, answers: this.data.answers }
    wx.redirectTo({ url: `/pages/result/result?id=${this.data.meta.id}` })
  },

  onShareAppMessage() {
    return {
      title: this.data.meta.name + ' - 心智测评中心',
      path: '/pages/detail/detail?id=' + this.data.meta.id,
    }
  },
})
