var server = require('../../../utils/server');
var cPage = 0;
Page({

  data: {
    collects: undefined,
  },

  details: function (e) {
    var objectId = e.currentTarget.dataset.goodsId;
    wx.navigateTo({
      url: "../../goods/detail/detail?objectId=" + objectId
    });
  },

  deleteGoods: function (e) {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定删除该收藏吗？',
      success: function (res) {
        if (res.confirm) {
          var favorite_id = e.currentTarget.dataset.favoriteId;

          server.getJSON('/api/shop/collect/cancel-collect.do?favorite_id=' + favorite_id, function (res) {
            wx.showLoading();
            that.getCollectLists();
          });
        }
      }
    })
  },

  tabClick: function (e) {
    var index = e.currentTarget.dataset.index
    var classs = ["text-normal", "text-normal", "text-normal", "text-normal", "text-normal", "text-normal"]
    classs[index] = "text-select"
    this.setData({ tabClasss: classs, tab: index })
  },

  onReachBottom: function () {
    // this.getCollectLists(++cPage);
  },
  onPullDownRefresh: function () {
    this.getCollectLists();
  },

  getCollectLists: function (page) {
    var that = this;
    wx.showLoading();
    server.getJSON('/api/mobile/collect/getCollect.do', function (res) {
      if (res.data.result) {
        wx.hideLoading();
        wx.stopPullDownRefresh();
        that.setData({ collects: res.data.data.result });
      } else {
        wx.showToast({ title: '获取收藏列表失败！', image: '/images/error.png' });
      }
    });
  },

  onLoad: function () {
    this.getCollectLists(0);
  }
});