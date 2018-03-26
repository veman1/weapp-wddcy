var server = require('../../utils/server');

Page({
  data: {
    empty: false,
    total: ''
  },
  onLoad: function (options) { },
  onShow: function () {
    wx.showLoading();
    this.getCarts();
  },
  see: function (e) {
    wx.switchTab({
      url: "../category/category"
    });
  },
  bindMinus: function (e) {
    var cartid = e.currentTarget.dataset.cartId;
    var productid = e.currentTarget.dataset.productId;
    var num = e.currentTarget.dataset.num;
    if (num <= 1) { return; }
    this._updateNum(cartid, productid, num - 1);
  },
  bindPlus: function (e) {
    var cartid = e.currentTarget.dataset.cartId;
    var productid = e.currentTarget.dataset.productId;
    var num = e.currentTarget.dataset.num;
    this._updateNum(cartid, productid, num + 1);
  },
  bindManual: function (e) {
    var cartid = e.currentTarget.dataset.cartId;
    var productid = e.currentTarget.dataset.productId;
    var num = parseInt(e.detail.value);
    this._updateNum(cartid, productid, num);
  },
  _updateNum: function (cartid, productid, num) {
    console.log(cartid, productid, num);
    var that = this;
    server.getJSON({
      url: '/api/store/store-cart/update-num.do',
      data: { cartid: cartid, productid: productid, num: num },
      success: function (res) {
        that.getCarts();
      }
    });
  },
  checkout: function () {
    var storelist = this.data.storelist
    for (var s = 0; s < storelist.length; s++) {
      for (var g = 0; g < storelist[s].goodslist.length; g++) {
        if (storelist[s].goodslist[g].is_check) {
          wx.navigateTo({
            url: '/pages/order/ordersubmit/index'
          })
          return
        }
      }
    }
    wx.showToast({
      title: '请勾选商品',
      image: '/images/error.png',
      duration: 1000,
    })
  },
  getCarts: function () {
    var that = this;
    function cb(res) {
      wx.hideLoading();
      if (res.data.result === 1) {
        var storelist = res.data.data.storelist;
        that.setData({
          storelist: storelist,
          empty: storelist.length ? false : true
        });
        that.checkPrice();
      } else {
        wx.showToast({
          title: '获取购物车信息失败！',
          iamge: 'error.png'
        });
      }
    };
    var url = '/api/wmp/cart/list.do';
    server.getJSON(url, cb);
  },
  _deleteCart: function (e) {
    var cartid = e.currentTarget.dataset.cartId;
    console.log('要删除的商品的cartid:', cartid);
    var that = this;
    server.getJSON('/api/store/store-cart/delete.do?cartid=' + cartid, function (res) {
      if (res.data.result === 1) {
        wx.showToast({ title: '删除成功' });
        that.getCarts();
      }
    });
  },
  saveNum: function (id, num) {
    server.getJSON('/Cart/updateNum/id/' + id + "/num/" + num, function (res) {
      that.getCarts();
    });
  },
  checkTap(e) {
    var d = e.currentTarget.dataset
    this.checkProduct(d.checked, d.productId, (res) => {
      if (res.data.result === 1) {
        this.getCarts()
      }
    })
  },
  checkProduct: function (checked, product_id, success) {
    server.getJSON({
      url: '/api/store/store-cart/check-product.do',
      data: {
        checked,
        product_id,
      },
      success: (res) => {
        success(res)
      }
    })
  },
  checkPrice: function () {
    var that = this;
    server.getJSON({
      url: '/api/wmp/cart/total.do',
      success: function (res) {
        that.setData({
          total: res.data.data.goodsPrice
        });
      }
    });
  },
})