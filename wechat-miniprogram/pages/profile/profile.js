const { getUser, saveUser, GENDERS, GENDER_LABELS } = require('../../utils/user')
const { useTheme } = require('../../utils/theme-store')
const { registerPrivacyModal } = require('../../utils/privacy')

function calcAge(birthday) {
  if (!birthday) return ''
  const b = new Date(birthday)
  if (isNaN(b.getTime())) return ''
  const now = new Date()
  let age = now.getFullYear() - b.getFullYear()
  const m = now.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--
  return age >= 0 && age < 150 ? age + ' 岁' : ''
}

function fmtDateTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const p = (n) => (n < 10 ? '0' + n : '' + n)
  return (
    d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
    ' ' + p(d.getHours()) + ':' + p(d.getMinutes())
  )
}

Page({
  data: {
    themeClass: 'theme-light',
    nickname: '',
    avatarUrl: '',
    genderIndex: 0,
    genderOptions: GENDERS.map((g) => GENDER_LABELS[g]),
    birthday: '',
    ageText: '',
    userId: '',
    createdText: '',
    canUseChooseAvatar: false,
    showPrivacy: false,
  },
  onLoad() {
    useTheme(this)
    this.checkSDKVersion()
    this.refresh()
    this.initPrivacy()
  },
  onUnload() {
    // 离开页面时把全局隐私监听恢复为 App 级兜底，避免本页监听残留影响其他页面
    registerPrivacyModal()
  },
  onShow() {
    this.refresh()
  },
  checkSDKVersion() {
    const info = wx.getSystemInfoSync()
    const versionStr = info.SDKVersion
    const versionParts = versionStr.split('.').map(Number)
    const versionNum = versionParts[0] * 10000 + versionParts[1] * 100 + versionParts[2]
    const canUse = versionNum >= 22102 // 2.21.2
    this.setData({ canUseChooseAvatar: canUse })
    if (!canUse) {
      console.warn('[Profile] 基础库版本过低，不支持 chooseAvatar，当前版本:', info.SDKVersion)
    }
  },
  refresh() {
    const u = getUser()
    const genderIndex = Math.max(0, GENDERS.indexOf(u.gender))
    this.setData({
      nickname: u.nickname,
      avatarUrl: u.avatarUrl,
      genderIndex,
      birthday: u.birthday,
      ageText: calcAge(u.birthday),
      userId: u.id,
      createdText: fmtDateTime(u.createdAt),
    })
  },
  initPrivacy() {
    if (typeof wx.onNeedPrivacyAuthorization !== 'function') return
    // 注册本页自定义隐私弹窗（覆盖式监听，本页生效）
    wx.onNeedPrivacyAuthorization((resolve) => {
      this._privacyResolve = resolve
      this.setData({ showPrivacy: true })
    })
  },
  onOpenPrivacy() {
    if (typeof wx.openPrivacyContract === 'function') {
      wx.openPrivacyContract({
        fail: () => wx.showToast({ title: '暂未配置隐私协议', icon: 'none' }),
      })
    }
  },
  onPrivacyAgree() {
    // 由 open-type="agreePrivacyAuthorization" 按钮触发，此时才可 resolve
    const resolve = this._privacyResolve
    this._privacyResolve = null
    this.setData({ showPrivacy: false })
    if (resolve) resolve({ buttonId: 'agree-btn', event: 'agree' })
  },
  onPrivacyDisagree() {
    const resolve = this._privacyResolve
    this._privacyResolve = null
    this.setData({ showPrivacy: false })
    if (resolve) resolve({ event: 'disagree' })
  },
  onChooseAvatar(e) {
    console.log('[Profile] chooseAvatar triggered', e)
    if (!this.data.canUseChooseAvatar) {
      wx.showToast({ title: '微信版本过低，请升级后重试', icon: 'none', duration: 3000 })
      return
    }
    const tempUrl = e.detail?.avatarUrl
    if (!tempUrl) {
      console.warn('[Profile] chooseAvatar returned empty avatarUrl')
      wx.showToast({ title: '未获取到头像，请重试', icon: 'none' })
      return
    }
    // 微信返回的是临时文件，重启后失效；保存到本地用户目录以长期保留
    try {
      const fs = wx.getFileSystemManager()
      const path = `${wx.env.USER_DATA_PATH}/avatar_${Date.now()}.png`
      fs.saveFileSync(tempUrl, path)
      this.setData({ avatarUrl: path })
      console.log('[Profile] 头像保存成功:', path)
    } catch (err) {
      console.warn('[Profile] 头像本地保存失败，使用临时路径:', err)
      this.setData({ avatarUrl: tempUrl })
    }
  },
  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value })
  },
  onGenderChange(e) {
    this.setData({ genderIndex: Number(e.detail.value) })
  },
  onBirthdayChange(e) {
    const birthday = e.detail.value
    this.setData({ birthday, ageText: calcAge(birthday) })
    saveUser({ birthday })
  },
  save() {
    const gender = GENDERS[this.data.genderIndex] || 'unknown'
    const nickname = (this.data.nickname || '').trim()
    if (!nickname) {
      wx.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }
    saveUser({
      nickname,
      avatarUrl: this.data.avatarUrl,
      gender: GENDERS[this.data.genderIndex] || 'unknown',
      birthday: this.data.birthday,
    })
    wx.showToast({ title: '已保存', icon: 'success' })
  },
  goBack() {
    wx.navigateBack({ delta: 1 })
  },
})