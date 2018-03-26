const server = require('../../../utils/server');
const sort = ['def_desc', 'def_asc', 'buynum_desc', 'buynum_asc', 'price_desc', 'price_asc']

Page({
  data: {
    categoryName: '分类',
    pageIndex: 0,
    goods: [],
    sort: 0,
  },
  onLoad(o) {
    this.getGoods({
      keywords: o.keywords || null,
      categoryId: o.categoryId || null,
      success: (res) => {
        this.setData({
          goods: this.data.goods.concat(res.data.data),
        })
      },
    })
    this.getTopCategory()
    this.setData({
      keywords: o.keywords || null,
      categoryId: o.categoryId || null,
      categoryName: o.cName || null,
    })
  },
  onReachBottom() {
    this.getGoods({
      categoryId: this.data.categoryId || null,
      keywords: this.data.keywords || null,
      pageIndex: this.data.pageIndex + 1,
      sort: sort[this.data.sort],
      success: (res) => {
        this.setData({
          goods: this.data.goods.concat(res.data.data),
        })
      },
    })
    this.setData({
      pageIndex: this.data.pageIndex + 1
    })
  },
  input(e) {
    this.setData({
      keywords: e.detail.value
    })
  },
  search: function (e) {
    this.getGoods({
      pageIndex: 1,
      keywords: e.currentTarget.dataset.keywords,
      success: (res) => {
        this.setData({
          goods: res.data.data,
        })
      },
    })
    this.setData({
      pageIndex: 1,
      sort: 0,
      dropDownShow: false,
      categoryName: '分类',
      categoryId: null,
    })
  },
  tapTopCategory: function (e) {
    this.getGoods({
      categoryId: e.currentTarget.dataset.cid,
      pageIndex: 1,
      sort: sort[this.data.sort],
      success: (res) => {
        this.setData({
          goods: res.data.data,
          pageIndex: 1,
        })
        wx.pageScrollTo({ scrollTop: 0, })
      }
    })
    this.setData({
      categoryName: this.data.topCat[e.currentTarget.dataset.index].name,
      categoryId: e.currentTarget.dataset.cid,
      keywords: null,
      dropDownShow: false,
    })
  },
  tapSort: function (e) {
    var i = e.currentTarget.dataset.index * 2
    var s = this.data.sort
    var sindex = s === i || s === i + 1 ? i + 1 - s % 2 : i
    this.getGoods({
      categoryId: this.data.categoryId || null,
      keywords: this.data.keywords || null,
      pageIndex: 1,
      sort: sort[sindex],
      success: (res) => {
        this.setData({
          goods: res.data.data,
          pageIndex: 1
        })
        wx.pageScrollTo({ scrollTop: 0, })
      }
    })
    this.setData({
      sort: sindex
    })
  },
  getTopCategory: function (parent) {
    var url = '/api/mobile/cat/one_classification.do';
    var that = this;
    server.getJSON(url, function (res) {
      var topCat = res.data.data;
      that.setData({
        topCat: topCat,
      });
    });
  },
  getGoods(options) {
    var data = {}
    if (options.categoryId) data.cat = options.categoryId
    if (options.sort) data.sort = options.sort
    if (options.pageIndex) data.page = options.pageIndex
    if (options.keywords) data.keyword = options.keywords
    server.getJSON({
      url: '/api/mobile/goods/list.do',
      data,
      success: (res) => {
        options.success && options.success(res)
      }
    })
  },
  tapGoods: function (e) {
    var objectId = e.currentTarget.dataset.objectId;
    wx.navigateTo({
      url: "../../../../../detail/detail?objectId=" + objectId
    });
  },
  bindDropDown: function () {
    this.setData({ dropDownShow: !this.data.dropDownShow });
  },
});