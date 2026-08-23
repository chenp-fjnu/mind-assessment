const { getModule } = require('../../utils/registry')
const { drawCell } = require('../../utils/figure')
const { readableTextColor } = require('../../utils/color')

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
    hasTimeLimit: false,
    timeLeft: 0,
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
    const meta = { id: mod.id, name: mod.name, icon: mod.icon, color: mod.color, colorText: readableTextColor(mod.color) }
    const answers = questions.map(() => null)
    this._timings = questions.map(() => 0)
    this._qStart = Date.now()

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
    this._qStart = Date.now()
    // 切题时旧画布签名全部失效，下一帧重绘；选中态切换则保留 memo 只重绘变化项
    this._figKeys = {}
    this.stopCountdown()
    const i = this.data.current
    const q = this.data.questions[i]
    this.startCountdown(q)
    const n = (q.options || []).length
    let cols = 4
    if (n <= 2) cols = 2
    else if (n === 3) cols = 3
    else if (n === 6) cols = 3
    else if (n === 8) cols = 4
    const optStyle = 'width:' + (96 / cols).toFixed(2) + '%;'
    const needCanvas = q.type === 'matrix' || !!q.matrix || !!(q.candidates && q.candidates.length)
    let groupLabel = ''
    const gs = q.set
    if (gs && this._setMeta[gs]) {
      const gm = this._setMeta[gs]
      groupLabel = '第 ' + gs + ' 组 ' + (i - gm.start + 1) + '/' + gm.total
    }
    let showFigureOptions = false
    let figureOptions = []
    let targetMatrix = null
    const cand = q.candidates
    const blockTarget = cand && cand.length ? cand[q.answer] : q.matrix
    if (q.type === 'choice' && blockTarget && q.answer != null && cand && cand.length) {
      targetMatrix = blockTarget
      showFigureOptions = true
      figureOptions = cand
    }
    this.setData(
      {
        q,
        qType: q.type,
        progress: Math.round(((i + 1) / this.data.total) * 100),
        optStyle,
        groupLabel,
        showFigureOptions,
        figureOptions,
        targetMatrix,
      },
      () => {
        if (needCanvas) this.drawFigures()
      }
    )
  },

  ensureCanvas(id, cb, tries = 0) {
    const MAX_TRIES = 30
    wx.createSelectorQuery()
      .select('#' + id)
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) {
          if (tries >= MAX_TRIES) return
          setTimeout(() => this.ensureCanvas(id, cb, tries + 1), 60)
          return
        }
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const W = res[0].width
        const H = res[0].height
        if (!W || !H) {
          if (tries >= MAX_TRIES) return
          setTimeout(() => this.ensureCanvas(id, cb, tries + 1), 60)
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

    // 轻量 memo：按画布 id + 签名跳过未发生变化的整帧重绘。
    // 矩阵图随题号变化、候选图随选中项变化，避免每次选中都重画整张矩阵。
    const shouldDraw = (id, sig) => {
      this._figKeys = this._figKeys || {}
      if (this._figKeys[id] === sig) return false
      this._figKeys[id] = sig
      return true
    }

    // 选项序号徽标：除颜色外用编号区分选项，兼顾色盲用户与快速定位
    const drawBadge = (ctx, W, H, idx) => {
      const r = 11
      const cx = r + 4
      const cy = r + 4
      ctx.fillStyle = 'rgba(15,23,42,0.85)'
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 13px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(idx + 1), cx, cy)
      ctx.textAlign = 'left'
      ctx.textBaseline = 'alphabetic'
    }

    // 矩阵选项字母徽标（A–F 对应 idx）：白字 + 深色描边，置于画布右下角，
    // 使矩阵选项像图形选择题的 figopt-key 一样有可见字母（色盲不依赖颜色即可区分）。
    const drawLetterBadge = (ctx, W, H, idx) => {
      const letter = String.fromCharCode(65 + idx)
      const r = 11
      const cx = W - r - 4
      const cy = H - r - 4
      ctx.save()
      ctx.fillStyle = 'rgba(15,23,42,0.85)'
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.font = 'bold 13px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.lineWidth = Math.max(1.5, r * 0.18)
      ctx.strokeStyle = 'rgba(15,23,42,0.85)'
      ctx.strokeText(letter, cx, cy)
      ctx.fillStyle = '#ffffff'
      ctx.fillText(letter, cx, cy)
      ctx.restore()
    }

    if (q.type === 'matrix') {
      if (shouldDraw('matrixCanvas', 'm:' + this.data.current)) {
      this.ensureCanvas('matrixCanvas', (ctx, W, H) => {
        ctx.clearRect(0, 0, W, H)
        const N = q.matrix.length
        const side = Math.min(W, H)
        const cell = side / N
        const offX = (W - side) / 2
        const offY = (H - side) / 2
        q.matrix.forEach((row, r) => {
          row.forEach((c, col) => drawCell(ctx, c, offX + col * cell, offY + r * cell, cell))
        })
        ctx.strokeStyle = '#e2e8f0'
        ctx.lineWidth = 1
        for (let i = 1; i < N; i++) {
          ctx.beginPath()
          ctx.moveTo(offX + i * cell, offY)
          ctx.lineTo(offX + i * cell, offY + side)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(offX, offY + i * cell)
          ctx.lineTo(offX + side, offY + i * cell)
          ctx.stroke()
        }
      })
      }
      q.options.forEach((opt, idx) => {
        if (shouldDraw('opt' + idx, 'o:' + this.data.current + ':' + idx + ':' + sel)) {
        this.ensureCanvas('opt' + idx, (ctx, W, H) => {
          ctx.clearRect(0, 0, W, H)
          const s = Math.min(W, H)
          drawCell(ctx, opt, (W - s) / 2, (H - s) / 2, s)
          drawBadge(ctx, W, H, idx)
          drawLetterBadge(ctx, W, H, idx)
          if (sel === idx) {
            ctx.strokeStyle = '#2563eb'
            ctx.lineWidth = 4
            ctx.strokeRect(2, 2, W - 4, H - 4)
          }
        })
        }
      })
    }

    const tm = this.data.targetMatrix
    if (this.data.showFigureOptions && tm) {
      if (shouldDraw('targetCanvas', 't:' + this.data.current)) {
      this.ensureCanvas('targetCanvas', (ctx, W, H) => {
        ctx.clearRect(0, 0, W, H)
        const rows = tm.length
        const cols = tm[0].length
        const cw = W / cols
        const ch = H / rows
        tm.forEach((row, r) => {
          row.forEach((c, col) => drawCell(ctx, c, col * cw, r * ch, Math.min(cw, ch)))
        })
      })
      }
    }

    if (this.data.showFigureOptions) {
      this.data.figureOptions.forEach((m, idx) => {
        if (shouldDraw('figopt' + idx, 'f:' + this.data.current + ':' + idx + ':' + sel)) {
        this.ensureCanvas('figopt' + idx, (ctx, W, H) => {
          ctx.clearRect(0, 0, W, H)
          const rows = m.length
          const cols = m[0].length
          const cw = W / cols
          const ch = H / rows
          m.forEach((row, r) => {
            row.forEach((c, col) => drawCell(ctx, c, col * cw, r * ch, Math.min(cw, ch)))
          })
          drawBadge(ctx, W, H, idx)
          if (sel === idx) {
            ctx.strokeStyle = '#2563eb'
            ctx.lineWidth = 4
            ctx.strokeRect(2, 2, W - 4, H - 4)
          }
        })
        }
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
      this.stopCountdown()
      this.saveProgress()
      // 图形/矩阵题给用户更长时间观察，普通测评表题快速跳入下一题
      const delay = this.data.showFigureOptions || this.data.qType === 'matrix' ? 900 : 350
      this.scheduleNext(delay)
    })
  },

  scheduleNext(delay) {
    if (this._timer) clearTimeout(this._timer)
    this._timer = setTimeout(() => {
      if (this.data.current < this.data.total - 1) this.next()
      else this.submit()
    }, delay || 350)
  },

  markTime() {
    const i = this.data.current
    const now = Date.now()
    this._timings[i] = (this._timings[i] || 0) + (now - (this._qStart || now))
    this._qStart = now
  },

  stopCountdown() {
    if (this._timer2) {
      clearInterval(this._timer2)
      this._timer2 = null
    }
  },

  startCountdown(q) {
    this.stopCountdown()
    if (!q || !q.timeLimit) {
      this.setData({ hasTimeLimit: false, timeLeft: 0 })
      return
    }
    this.setData({ hasTimeLimit: true, timeLeft: q.timeLimit })
    this._qDeadline = Date.now() + q.timeLimit * 1000
    this._timer2 = setInterval(() => {
      const left = Math.max(0, Math.round((this._qDeadline - Date.now()) / 1000))
      this.setData({ timeLeft: left })
      if (left <= 0) {
        this.stopCountdown()
        if (this.data.current < this.data.total - 1) this.next()
        else this.submit()
      }
    }, 250)
  },

  prev() {
    if (this._timer) clearTimeout(this._timer)
    if (this.data.current === 0) return
    this.stopCountdown()
    this.markTime()
    this.setData({ current: this.data.current - 1 }, () => this.renderCurrent())
  },

  next() {
    if (this._timer) clearTimeout(this._timer)
    this.stopCountdown()
    this.markTime()
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

  showGroupSummary(set, cb) {
    const m = this._setMeta[set]
    if (!m) {
      cb && cb()
      return
    }
    let correct = 0
    for (let i = m.start; i < m.start + m.total; i++) {
      if (this.data.answers[i] != null && this.data.answers[i] === this.data.questions[i].answer) correct++
    }
    wx.showModal({
      title: set + ' 组完成',
      content: '本组答对 ' + correct + ' / ' + m.total,
      showCancel: false,
      success: () => cb && cb(),
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
    this.stopCountdown()
    this.markTime()
    const isLast = this.data.current === this.data.total - 1
    const curSet = this.data.questions[this.data.current] && this.data.questions[this.data.current].set
    const unanswered = this.data.answers.filter((a) => a === null).length
    const proceed = () => {
      if (isLast && curSet) this.showGroupSummary(curSet, () => this.doSubmit())
      else this.doSubmit()
    }
    if (unanswered > 0) {
      wx.showModal({
        title: '还有题目未作答',
        content: `剩余 ${unanswered} 题未作答，未答题目将按测评表默认分值计入，确定提交？`,
        success: (r) => {
          if (r.confirm) proceed()
        },
      })
      return
    }
    wx.showModal({
      title: '提交测评',
      content: `已完成全部 ${this.data.total} 题，确认提交并查看结果？`,
      success: (r) => {
        if (r.confirm) proceed()
      },
    })
  },

  doSubmit() {
    if (this._submitting) return
    this._submitting = true
    if (this._timer) clearTimeout(this._timer)
    this.stopCountdown()
    this.markTime()
    wx.removeStorageSync('ma_progress_' + this.data.meta.id)
    const layout = this.mod.resultLayout || {}
    const r = this.mod.computeResult(this.data.answers, this.data.questions, { timings: this._timings })
    const pv = r[layout.primaryField || 'score']
    const hist = wx.getStorageSync('ma_history') || []
    const record = {
      rid: Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      id: this.data.meta.id,
      name: this.data.meta.name,
      icon: this.data.meta.icon,
      time: Date.now(),
      answers: this.data.answers,
      qcount: this.data.total,
      summary: pv == null ? '' : String(pv),
      level: r.level || '',
      totalTime: typeof r.totalTime === 'number' ? r.totalTime : 0,
      schemaVersion: 1,
    }
    hist.unshift(record)
    // 配额兜底：写入失败时 progressively 丢弃最旧记录直至成功
    let trimmed = hist.slice(0, 30)
    for (let guard = 0; guard < trimmed.length; guard++) {
      try {
        wx.setStorageSync('ma_history', trimmed)
        break
      } catch (e) {
        trimmed = trimmed.slice(0, trimmed.length - 1)
      }
    }

    const app = getApp()
    app.globalData.lastResult = { id: this.data.meta.id, answers: this.data.answers, totalTime: record.totalTime }
    wx.reLaunch({ url: `/pages/result/result?id=${this.data.meta.id}` })
  },

  onUnload() {
    this._submitting = false
    this.stopCountdown()
  },

  onShareAppMessage() {
    return {
      title: this.data.meta.name + ' - 心智探索局',
      path: '/pages/detail/detail?id=' + this.data.meta.id,
    }
  },
})
