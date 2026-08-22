const methodsData = require('../../utils/methods-data')

Page({
  data: {
    recordCount: 0,
    methodCount: 0,
  },
  onShow() {
    const hist = wx.getStorageSync('ma_history') || []
    this.setData({
      recordCount: hist.length,
      methodCount: methodsData.METHODS.length,
    })
  },
  goHistory() { wx.navigateTo({ url: '/pages/history/history' }) },
  goAbout() { wx.navigateTo({ url: '/pages/about/about' }) },
})
