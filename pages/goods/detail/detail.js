var server = require('../../../utils/server');

Page({
  data: {
    popUpShow: false,
    collected: false,
    sectionTops: [0, 100, 200],
    tab: 0,
    goods: {},
    galleryList: [],
    goods_num: 1,
  },
  propClick: function (e) {
    var pos = e.currentTarget.dataset.pos;
    var index = e.currentTarget.dataset.index;
    var goods = this.data.goods
    for (var i = 0; i < goods.goods.goods_spec_list[index].length; i++) {
      if (i == pos)
        goods.goods.goods_spec_list[index][pos].isClick = 1;
      else
        goods.goods.goods_spec_list[index][i].isClick = 0;
    }
    this.setData({ goods: goods });
    this.checkPrice();
  },
  tabClick: function (e) {
    var index = e.currentTarget.dataset.index;
    this.setTab(index);
    wx.pageScrollTo({ scrollTop: this.data.sectionTops[index] });
  },
  addCollect: function (e) {
    var goods_id = e.currentTarget.dataset.goodsId;
    server.getJSON('/api/wmp/goods/add-collect.do?goods_id=' + goods_id, (res) => {
      if (res.data.result === 1) {
        wx.showToast({ title: '收藏成功' });
        this.setData({
          collected: {
            favorite_id: res.data.message
          }
        })
      }
      else { wx.showToast({ title: res.data.message, image: '/images/error.png' }); }
    });
  },
  cancelCollect: function (e) {
    var favorite_id = e.currentTarget.dataset.favoriteId;
    server.getJSON('/api/shop/collect/cancel-collect.do?favorite_id=' + favorite_id, (res) => {
      if (res.data.result === 1) {
        wx.showToast({ title: '取消收藏成功' });
        this.setData({
          collected: null
        })
      }
      else { wx.showToast({ title: res.data.message, image: '/images/error.png' }); }
    });
  },
  home: function () {
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  toCart: function () {
    wx.switchTab({
      url: '/pages/cart/cart',
    })
  },
  bindMinus: function (e) {
    var num = this.data.goods_num;
    if (num > 1) {
      num--;
    }
    this.setData({ goods_num: num });
  },
  bindManual: function (e) {
    var index = parseInt(e.currentTarget.dataset.index);
    var num = e.detail.value;
    this.setData({ goods_num: num });
  },
  bindPlus: function (e) {
    var num = this.data.goods_num;
    num++;
    this.setData({ goods_num: num });
  },
  onLoad: function (options) {
    var goodsId = options.objectId;
    this.getGoodsById(goodsId);
  },
  onReady: function () {
    this.getSectionTops();
  },
  getGoodsById: function (goodsId) {
    wx.showLoading();
    var that = this
    var url = '/api/mobile/goods/detail.do?goodsid=' + goodsId;
    server.getJSON(url, function (res) {
      wx.hideLoading();
      that.setData({
        goods: res.data.data.goods,
        galleryList: res.data.data.galleryList,
        collected: res.data.data.collected || null
      });
    });
  },
  checkPrice: function () {
    var goods = this.data.goods;
    var spec = ""
    this.setData({ price: goods.goods.shop_price });
    for (var i = 0; i < goods.goods.goods_spec_list.length; i++) {
      for (var j = 0; j < goods.goods.goods_spec_list[i].length; j++) {
        if (goods.goods.goods_spec_list[i][j].isClick == 1) {
          if (spec == "")
            spec = goods.goods.goods_spec_list[i][j].item_id
          else
            spec = spec + "_" + goods.goods.goods_spec_list[i][j].item_id
        }
      }
    }
    var specs = spec.split("_");
    for (var i = 0; i < specs.length; i++) {
      specs[i] = parseInt(specs[i])
    }
    specs.sort(function (a, b) { return a - b });
    spec = ""
    for (var i = 0; i < specs.length; i++) {
      if (spec == "")
        spec = specs[i]
      else
        spec = spec + "_" + specs[i]
    }
    console.log(spec);
    var price = goods['spec_goods_price'][spec].sale_price;
    console.log('goods price is', goods);
    console.log(price);
    this.setData({ price: price });
  },
  showPopUp: function (e) {
    this.setData({ popUpShow: true });
  },
  hidePopUp: function () {
    this.setData({ popUpShow: false });
  },
  imgLoad: function (e) {
    this.getSectionTops();
  },
  getSectionTops: function () {
    var that = this;
    wx.createSelectorQuery().selectAll('.section').fields({
      size: true,
    }, function (res) {
      var sectionTops = that.data.sectionTops;
      sectionTops[1] = sectionTops[0] + res[0].height;
      sectionTops[2] = sectionTops[1] + res[1].height;
      that.setData({ sectionTops: sectionTops });
    }).exec(function (res) {
    })
  },
  buy: function () {
    var goods = this.data.goods;
    var spec = ""
    if (goods.goods.goods_spec_list != null)
      for (var i = 0; i < goods.goods.goods_spec_list.length; i++) {
        for (var j = 0; j < goods.goods.goods_spec_list[i].length; j++) {
          if (goods.goods.goods_spec_list[i][j].isClick == 1) {
            if (spec == "")
              spec = goods.goods.goods_spec_list[i][j].item_id
            else
              spec = spec + "_" + goods.goods.goods_spec_list[i][j].item_id
          }
        }
      }
    var that = this;
    var goods_id = that.data.goods.goods.goods_id;
    var goods_spec = spec;
    var session_id = app.globalData.openid//that.data.goods.goods.spec_goods_price
    var goods_num = that.data.goods_num;
    if (app.globalData.login)
      var user_id = app.globalData.userInfo.user_id;
    wx.showToast({
      title: '请稍候',
      icon: 'loading',
      duration: 10000
    });
    server.getJSON('/Cart/addCart', { goods_id: goods_id, goods_spec: goods_spec, session_id: session_id, goods_num: goods_num, user_id: user_id }, function (res) {
      console.log('res:', res);
      if (res.data.status == 1) {
        server.getJSON('/Cart/updateAllSelect/open_id/' + session_id + "/selected/" + false, function (res) {
          server.getJSON('/Cart/cartList/session_id/' + session_id, { user_id: user_id }, function (res) {
            var carts = res.data;
            var id = carts[carts.length - 1].id;
            server.getJSON('/Cart/updateSelect/id/' + id + "/selected/1", function (res) {
              wx.hideToast();
              // wx.showToast({
              //   title: '已加入购物车',
              // })
              wx.switchTab({
                url: '/pages/cart/cart',
              });
            });
          });
        });
      }
      else
        wx.showToast({
          title: res.data.msg,
          icon: 'error',
          duration: 2000
        });
    });
    return;
  },
  addCart: function () {
    var goodsid = this.data.goods.goods_id;
    var num = this.data.goods_num;
    var that = this;
    server.getJSON({
      url: '/api/wmp/cart/add-goods.do',
      // url: '/api/wmp/cart/add-goods.do?goodsid=' + goodsid,
      data: {
        goodsid: goodsid,
        num: num,
      },
      success: function (res) {
        if (res.data.result === 1) {
          that.setData({ popUpShow: false });
          wx.showToast({
            title: '加入购物车成功',
            duration: 800
          });
        } else {
          wx.showModal({
            showCancel: false,
            title: res.data.message
          })
        }
      }
    });
  },
  previewImage: function (e) {
    wx.previewImage({
      //从<image>的data-current取到current，得到String类型的url路径
      current: this.data.goods.get('images')[parseInt(e.currentTarget.dataset.current)],
      urls: this.data.goods.get('images') // 需要预览的图片http链接列表
    })
  },
  onPageScroll: function (e) {
    var scrollTop = e.scrollTop;
    var sectionTops = this.data.sectionTops;
    for (var i = 0; i < sectionTops.length; i++) {
      if (i < sectionTops.length - 1) {
        scrollTop >= sectionTops[i]
          && scrollTop < sectionTops[i + 1]
          && this.data.tab !== i
          && this.setTab(i);
      }
      else {
        scrollTop >= sectionTops[i]
          && this.data.tab !== i
          && this.setTab(i);
      }
    }
  },
  setTab: function (tab) {
    this.setData({
      tab: tab
    });
  },
});