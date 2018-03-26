var server = require('../../../utils/server');

Page({
  data: {
  },

  onLoad: function (e) {
  },

  onShow() {
    this.checkOrder();
  },

  toAddress: function () {
    wx.navigateTo({
      url: '/pages/address/select/index?from=ordersubmit'
    });
  },

  submit: function () {
    server.postJSON({
      url: '/api/store/store-order/create.do',
      success: (res) => {
        if (res.data.result === 1) {
          wx.showToast({
            title: '订单提交成功',
            success: function (res) {
              setTimeout(function () {
                wx.redirectTo({
                  url: '/pages/order/list/list?tab=1',
                })
              }, 1000);
            }
          });
        } else {
          wx.showModal({
            title: res.data.message,
            showCancel: false
          })
        }
      }
    })
  },

  checkOrder: function () {
    wx.showLoading()
    server.getJSON({
      url: '/api/wmp/order/check-order.do',
      success: (res) => {
        wx.hideLoading()
        if (res.data.result === 1) {
          this.setData({
            address: res.data.data.address ? res.data.data.address : undefined,
            orderPrice: res.data.data.orderPrice,
            cartItem: res.data.data.cartItem
          });
        } else {
          wx.showModal({
            title: res.data.message,
            confirmText: '前往登录',
            cancelText: '返回',
            success: (res) => {
              if (res.confirm) {
                wx.navigateTo({
                  url: '/pages/login/index',
                })
              } else if (res.cancel) {
                wx.navigateBack()
              }
            }
          })
        }
      },
    });
  },

})