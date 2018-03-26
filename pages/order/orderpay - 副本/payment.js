var server = require('../../../utils/server');
var md5 = require('../../../utils/md5.js');

Page({
  data: {
    order_id: null,
    sn: null,
    money: null
  },

  onLoad: function (options) {
    this.setData({
      order_id: options.order_id,
      sn: options.sn,
      money: options.money,
    });
  },

  pay: function () {
    wx.showLoading();

    var that = this;
    var openid = getApp().globalData.openid;
    var order_id = this.data.order_id;
    console.info('要付款的订单id:', order_id);

    server.postJSON({
      url: '/api/wmp/wx_pay/pay.do?order_id=' + order_id + '&openid=' + openid,
      success: function (res) {
        if (res.data.result == 0) {
          wx.showToast({
            title: res.data.message,
            image: '/images/fail.png'
          })
        }
        if (res.data.result == 1) {
          var payData = res.data.data;

          var appid = payData.appid;
          var key = payData.key;
          var timeStamp = new Date().getTime() + '';
          var nonceStr = payData.nonce_str;
          var prepay_id = payData.prepay_id;

          var str = 'appId=' + appid +
            '&nonceStr=' + nonceStr +
            '&package=' + 'prepay_id=' + prepay_id +
            '&signType=MD5' +
            '&timeStamp=' + timeStamp +
            '&key=' + key;
          console.info('str:', str);
          var paySign = md5.hex_md5(str).toUpperCase();
          console.info('sign:', paySign);

          wx.requestPayment({
            'nonceStr': nonceStr,
            'package': 'prepay_id=' + prepay_id,
            'signType': 'MD5',
            'timeStamp': timeStamp,
            'paySign': paySign,

            success: function (res) {
              console.log('支付成功:', res);
              wx.showToast({ title: '支付成功', icon: 'success', duration: 2000 })
              setTimeout(function () {
                wx.navigateBack();
                wx.redirectTo({
                  url: '/pages/order/list/list?tab=2',
                })
              }, 2000);
            },
            'fail': function (res) {
              console.log('支付失败:', res);
              wx.showToast({ title: res.err_desc, image: '/images/fail.png', duration: 2000 });
            },
            'complete': function (res) {
              wx.hideLoading();
            }
          });
        }
      },
      complete: function () {
        wx.hideLoading();
      }
    });

  }
})