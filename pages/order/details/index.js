var server = require('../../../utils/server');

function formatDate(date) {
  var date = new Date(date * 1000);//如果date为10位不需要乘1000
  var Y = date.getFullYear() + '-';
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
  var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
  var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
  var s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
  return Y + M + D + h + m + s;
}

Page({
  data: {
    order_sn: undefined,
    date_format: undefined
  },

  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    //     var that = this;
    //     var app = getApp();
    //     var order_id = options.order_id;
    //     var user_id = app.globalData.userInfo.user_id

    //     server.getJSON('/User/getOrderDetail?user_id=' + user_id + "&id=" + order_id,function(res){
    // var result = res.data.result
    //         that.setData({result:result});
    //     });
    
    this.setData({ order_sn: options.order_sn });
    this.getOrderDetail(options.order_sn);
  },

  getOrderDetail: function (order_sn) {
    var that = this;
    server.getJSON('/api/wmp/order/detail.do?ordersn=' + order_sn, function (res) {
      that.formatDate(res.data.data.order.create_time);
      that.setData({ order: res.data.data.order });
      wx.stopPullDownRefresh();
    });
  },

  formatDate: function (t) {
    this.setData({
      date_format: formatDate(t)
    });
  },

  toPay: function () {
    var order_id = this.data.order.order_id;
    var sn = this.data.order.sn;
    var money = this.data.order.order_amount;
    wx.navigateTo({
      url: '../orderpay/payment?order_id=' + order_id + '&sn=' + sn + '&money=' + money,
    })
  },

  onPullDownRefresh: function () {
    this.getOrderDetail(this.data.order_sn);
  },
})