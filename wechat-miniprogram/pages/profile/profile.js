const { getUser, saveUser, GENDERS, GENDER_LABELS } = require('../../utils/user')
const { useTheme } = require('../../utils/theme-store')

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

// 将头像临时文件持久化到本地用户目录，避免临时路径失效后头像丢失
function persistAvatar(tempPath, cb) {
  if (!tempPath) return cb && cb('')
  let fs
  try {
    fs = wx.getFileSystemManager()
  } catch (e) {
    fs = null
  }
  if (!fs || !fs.saveFile) return cb && cb(tempPath)
  fs.saveFile({
    tempFilePath: tempPath,
    success: (res) => cb && cb(res.savedFilePath || tempPath),
    fail: () => cb && cb(tempPath),
  })
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
    showWechatAvatar: true,
  },
  onLoad() {
    useTheme(this)
    // 旧基础库不支持 chooseAvatar 时，仅展示「从相册选择」入口
    let can = true
    try {
      can = wx.canIUse('open-type.chooseAvatar')
    } catch (e) {
      can = true
    }
    this.setData({ showWechatAvatar: !!can })
    this.refresh()
  },
  onShow() {
    this.refresh()
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
  // 微信头像快速填入（基础库 >= 2.21.2）
  onChooseAvatar(e) {
    const temp = e.detail && e.detail.avatarUrl
    if (!temp) return
    persistAvatar(temp, (p) => this.setData({ avatarUrl: p }))
  },
  // 相册/拍照兜底选择，兼容不支持 chooseAvatar 的环境
  chooseFromAlbum() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const temp = res.tempFiles && res.tempFiles[0] && res.tempFiles[0].tempFilePath
        if (temp) persistAvatar(temp, (p) => this.setData({ avatarUrl: p }))
      },
    })
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
  },
  save() {
    const gender = GENDERS[this.data.genderIndex] || 'unknown'
    saveUser({
      nickname: (this.data.nickname || '').trim(),
      avatarUrl: this.data.avatarUrl,
      gender,
      birthday: this.data.birthday,
    })
    wx.showToast({ title: '已保存', icon: 'success' })
  },
  goBack() {
    wx.navigateBack({ delta: 1 })
  },
})
