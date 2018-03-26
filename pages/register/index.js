var server = require('../../utils/server');
var app = getApp()

var config = {
  timeText: '获取验证码',
  waitTime: 60
}

Page({
  data: {
    timeText: config.timeText,
  },
  onLoad(o) {
  },
  onReady() {
    app.checkSession({
      success: () => {
        this.safeCheck()
      },
      fail: () => {
        wx.showModal({
          title: '会话异常，请尝试刷新',
          confirmText: '刷新页面',
          cancelText: '返回首页',
          success: (res) => {
            if (res.confirm) {
              wx.redirectTo({
                url: '/' + this.route,
              })
            } else {
              wx.switchTab({
                url: '/pages/index/index',
              })
            }
          }
        })
      },
    })
  },
  submitTap() {
    if (this.data.num && this.data.num.length === 6) {
      this.checkCode()
    } else {
      wx.showToast({
        title: '无效的验证码',
        image: '/images/error.png'
      })
    }
  },
  safeCheck() {
    server.postJSON({
      url: '/api/shop/sms/sms-safe.do',
      success: (res) => {
        if (res.data.result !== 1) {
          wx.showModal({
            title: '短信安全检测失败！',
            showCancel: false,
            success: (res) => {
              wx.navigateBack()
            }
          })
        }
      }
    })
  },
  resetTime() {
    var timer = null;
    var t = Math.floor(config.waitTime)
    let countDown = () => {
      t--;
      if (t <= 0) {
        clearInterval(timer);
        this.setData({
          timeText: config.timeText,
        })
      } else {
        this.setData({
          timeText: t + 's',
        })
      }
    }
    timer = setInterval(countDown, 1000);
  },
  getnum: function (e) {
    if (this.data.timeText !== config.timeText) {
      return
    }
    if (parseInt(this.data.phoneNum).toString().length == 11) {
      server.getJSON({
        url: '/api/shop/sms/send-sms-code.do',
        data: {
          key: 'register',
          mobile: this.data.phoneNum
        },
        success: (res) => {
          wx.showModal({
            title: res.data.message,
            showCancel: false,
          })
          if (res.data.result === 1) {
            this.resetTime()
          }
        },
      })
    } else {
      wx.showModal({
        title: "请输入正确的手机号",
        showCancel: false,
      })
    }
  },
  inputNum: function (e) {
    this.data.num = e.detail.value;
  },
  quick_register_phone: function (e) {
    server.postJSON({
      url: '/api/shop/member/mobile_register.do',
      data: {
        action: 'mobile_register',
        password: this.data.pass
      },
      success: (res) => {
        wx.showModal({
          title: res.data.message,
          showCancel: false,
        })
      }
    })
  },
  checkCode() {
    server.getJSON({
      url: '/api/shop/member/check-mobile-code.do',
      data: {
        checkType: 'register',
        mobile: this.data.phoneNum,
        mobileCode: this.data.num,
      },
      success: (res) => {
        wx.showModal({
          title: res.data.message,
          showCancel: false,
        })
        if (res.data.result === 1) {
          this.quick_register_phone()
        }
      },
    })
  },
  getPhoneNum: function (e) {
    this.setData({
      phoneNum: e.detail.value,
    });
  },
  inputRemindPass: function (e) {
    this.setData({
      remindpass: e.detail.value,
    });
  },
  inputPass: function (e) {
    this.setData({
      pass: e.detail.value,
    });
  },
})