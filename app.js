/**
 * 旺东大菜园
 * appid: wxaefb1474ee48a97a;
 * secret: c2515396d27d4e5ecc051b86e9f102fb;
 */
// 

var server = require('./utils/server');
var MD5 = require('./utils/md5.js')

/* 函数：从 响应头 分析出 sessionId  */
function getSessionIdFromCookie(str) {
  var i1 = str.indexOf('JSESSIONID=');
  var i2 = str.indexOf(';');
  var sessionId = str.substring(i1 + 11, i2);
  return sessionId;
}

function getPaySign(appid, nonceStr, prepay_id, timeStamp, key) {
  var str = 'appId=' + appid +
    '&nonceStr=' + nonceStr +
    '&package=' + 'prepay_id=' + prepay_id +
    '&signType=MD5' +
    '&timeStamp=' + timeStamp +
    '&key=' + key;
  return MD5.hex_md5(str).toUpperCase();
}

App({
  globalData: {
    sessionId: '',
    openid: '',
  },
  onLaunch: function () {
    this.getSessionid({
      success: () => {
        // this.autologin()
      }
    });
  },
  checkLogin() {
    if (this.globalData.login) {
      return true
    } else {
      wx.showModal({
        title: '您还没有登录',
        showCancel: false
      })
      return false
    }
  },
  getOpenid: function (success) {
    wx.login({
      success: (res) => {
        if (res.code) {
          server.getJSON({
            url: '/api/wmp/wx_pay/oauth2.do?code=' + res.code,
            success: (res) => {
              success && success(res)
            }
          });
        }
      }
    });
  },
  requestPayment(order_id, openid, success) {
    wx.showLoading()
    server.getJSON({
      url: '/api/wmp/wx_pay/pay.do',
      data: {
        order_id,
        openid,
      },
      success: (res) => {
        wx.hideLoading()
        var nonce_str = res.data.data.nonce_str,
          prepay_id = res.data.data.prepay_id,
          key = res.data.data.key,
          appid = res.data.data.appid,
          timeStamp = new Date().getTime()
        var paySign = getPaySign(appid, nonce_str, prepay_id, timeStamp, key)
        wx.requestPayment({
          timeStamp: timeStamp + '',
          nonceStr: nonce_str,
          package: 'prepay_id=' + prepay_id,
          signType: 'MD5',
          paySign,
          success: (res) => {
            success && success(res)
          }
        })
      }
    })
  },
  getSessionid(options) {
    wx.request({
      url: 'https://wx.dcyfood.com/api',
      complete: (res) => {
        this.globalData.sessionId = getSessionIdFromCookie(res.header['Set-Cookie']);
        options.success && options.success()
      }
    });
  },
  checkSession(options) {
    if (this.globalData.sessionId) {
      options.success()
    } else {
      options.fail()
    }
  },
  autologin() {
    server.getJSON({
      url: '/api/wmp/member/login.do',
      data: {
        username: '123456',
        password: '123456',
      },
      success: () => {
        this.globalData.login = true
      }
    })
  },
})
