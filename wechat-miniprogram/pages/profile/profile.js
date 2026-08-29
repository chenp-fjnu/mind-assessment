const { getUser, saveUser, GENDERS } = require('../../utils/user')
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

Page({
  data: {
    themeClass: 'theme-light',
    nickname: '',
    avatarUrl: '',
    genderIndex: 0,
    genderOptions: ['暂不填写', '男', '女'],
    birthday: '',
    ageText: '',
    userId: '',
    createdText: '',
  },
  onLoad() {
    useTheme(this)
    try {
      this.refresh()
    } catch (e) {
      wx.showToast({ title: '页面初始化失败', icon: 'none' })
    }
  },
  onShow() {
    this.refresh()
  },
  refresh() {
    const u = getUser()
    const genderIndex = Math.max(0, ['unknown', 'male', 'female'].indexOf(u.gender))
    this.setData({
      nickname: u.nickname,
      avatarUrl: u.avatarUrl,
      genderIndex,
      birthday: u.birthday,
      ageText: calcAge(u.birthday),
      userId: u.id,
      createdText: fmtDateTime(u.createdAt),
    })
    
    // 后台同步用户信息（不阻塞页面显示）
    // 同步由 saveUser 后的手动同步或后台任务处理，此处不阻塞页面显示
  },
  // 点击头像即触发 chooseAvatar：系统选择器内置「微信头像 / 拍照 / 从相册选」三种来源
  onChooseAvatar(e) {
    const temp = e.detail && e.detail.avatarUrl
    if (!temp) return
    // 持久化头像到本地
    function persistAvatar(tempPath, cb) {
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
    persistAvatar(temp, (p) => this.setData({ avatarUrl: p }))
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
    // 立即持久化生日：舒尔特等依赖年龄组的对比在结算时直接读取档案，
    // 若仅改 picker 不点「保存」会导致年龄组不更新，故此处即时落盘。
    saveUser({ birthday })
  },
  save() {
    saveUser({
      nickname: (this.data.nickname || '').trim(),
      avatarUrl: this.data.avatarUrl,
      gender: GENDERS[this.data.genderIndex] || 'unknown',
      birthday: this.data.birthday,
    })
    // 资料仅保存在本机（云同步为占位实现，详见 utils/user.js）
    wx.showToast({ title: '已保存', icon: 'success' })
  },
  goBack() {
    wx.navigateBack({ delta: 1 })
  },
})