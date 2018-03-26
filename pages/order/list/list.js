var server = require('../../../utils/server');
const app = getApp()

Page({
  data: {
    orderStatus: [
      {
        name: '',
        text: '全部'
      },
      {
        name: 'wait_pay',
        text: '待支付'
      },
      {
        name: '2',
        text: '待发货'
      },
      {
        name: 'wait_rog',
        text: '待收货'
      },
      {
        name: '4',
        text: '已完成'
      },
    ],
    tab: 0,
    orders: [],
  },
  onLoad: function (options) {
    wx.showLoading();
    if (options.tab) {
      var tab = parseInt(options.tab);
      this.setData({ tab: tab });
      this.getOrderLists(this.data.orderStatus[tab].name);
    } else {
      this.getOrderLists(this.data.orderStatus[0].name);
    }
  },
  tabClick: function (e) {
    var index = e.currentTarget.dataset.index;
    this.setData({ tab: index });
    wx.showLoading();
    this.getOrderLists(this.data.orderStatus[index].name);
  },
  getOrderLists: function (ctype) {
    var that = this;
    server.postJSON({
      url: '/api/wmp/order/list.do?status=' + ctype,
      success: function (res) {
        that.setData({
          orders: res.data.data
        });
      },
      complete: function () {
        wx.hideLoading();
      }
    });
  },
  payTap(e) {
    wx.showLoading()
    app.getOpenid((res) => {
      wx.hideLoading()
      app.requestPayment(e.currentTarget.dataset.orderId, res.data.data.openid, (res) => {})
    })
  },
  cancel: function (e) {
    var index = e.currentTarget.dataset.index;
    var order = this.data.orders[index];
    var that = this;
    wx.showModal({
      title: '提示',
      showCancel: true,
      content: '确定取消订单吗？',
      success: function (res) {
        if (res.confirm) {
          var user_id = getApp().globalData.userInfo.user_id
          server.getJSON('/User/cancelOrder/user_id/' + user_id + "/order_id/" + order['order_id'], function (res) {
            wx.showToast({ title: res.data.msg, icon: 'success', duration: 2000 })
            cPage = 0;
            that.data.orders = [];
            that.getOrderLists(ctype, 0);
          });
        }
      }
    })
  },
  confirm: function (e) {
    var index = e.currentTarget.dataset.index;
    var order = this.data.orders[index];
    var that = this;
    wx.showModal({
      title: '提示',
      showCancel: true,
      content: '确定已收货吗？',
      success: function (res) {
        if (res.confirm) {
          var user_id = getApp().globalData.userInfo.user_id
          server.getJSON('/User/orderConfirm/user_id/' + user_id + "/order_id/" + order['order_id'], function (res) {
            wx.showToast({ title: res.data.msg, icon: 'success', duration: 2000 })
            cPage = 0;
            that.data.orders = [];
            that.getOrderLists(ctype, 0);
          });
        }
      }
    })
  },
  details: function (e) {
    var index = e.currentTarget.dataset.index;
    var order_sn = this.data.orders[index].sn;
    wx.navigateTo({
      url: '../details/index?order_sn=' + order_sn
    });
  },
  onPullDownRefresh: function () {
    cPage = 0;
    this.data.orders = [];
    this.getOrderLists(ctype, 0);
  },
});