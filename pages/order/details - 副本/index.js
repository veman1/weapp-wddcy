var server = require('../../../utils/server');

function getOrderDetail(order_sn, cb) {
  server.getJSON('/api/wmp/order/detail.do?ordersn=' + order_sn, function (res) {
    cb(res);
  });
};

Page({
  data: {},
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
    var that = this;
    getOrderDetail(options.order_sn, function (res) {
      that.setData({
        order: res.data.data.order
      });
    });
  },
})