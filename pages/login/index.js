var server = require('../../utils/server');
const app = getApp()

Page({
  data: {
    uname: '',
    pwd: '',
  },
  inputUname(e) {
    this.setData({
      uname: e.detail.value
    })
  },
  inputPwd(e) {
    this.setData({
      pwd: e.detail.value
    })
  },
  check() {
    if (!this.data.uname) {
      wx.showModal({
        title: '请输入账号',
        showCancel: false
      })
      return false
    }
    if (!this.data.pwd) {
      wx.showModal({
        title: '请输入密码',
        showCancel: false
      })
      return false
    }
    return true
  },
  login(e) {
    if (!this.check()) return
    wx.showNavigationBarLoading()
    server.getJSON('/api/wmp/member/login.do', {
      username: this.data.uname,
      password: this.data.pwd,
    }, (res) => {
      wx.hideNavigationBarLoading()
      if (res.data.result === 1) {
        app.globalData.login = true
        wx.showModal({
          title: '登录成功!',
          showCancel: false,
          success: (res) => {
            wx.navigateBack()
          }
        })
      } else {
        wx.showModal({
          title: res.data.message,
          showCancel: false
        })
      }
    })
  },
})