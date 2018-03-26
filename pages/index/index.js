
var server = require('../../utils/server');

Page({
  data: {
    headline: [],
    banner: [],
    goods: {},
    tags_status: {
      todayWhatEat: 0,
      eatAllChina: 0,
      eatAllWorld: 0
    }
  },

  onLoad: function (options) {
    this.loadBanner();
    this.getHeadline();
    this.getHomeGoods();
  },

  loadBanner: function () {
    var that = this;
    server.getJSON("/api/wmp/adv/adv-cat.do?acid=21", function (res) {
      var banner = res.data.data;
      that.setData({
        banner: banner
      });
    });
  },

  getHomeGoods: function () {
    var that = this;
    var url = '/api/wmp/index/column-act.do';
    var cb = function (res) {
      console.log(res);
      that.setData({
        'goods.allInBuy': res.data.data.allInBuy,
        'goods.eatAllChina': res.data.data.eatAllChina,
        'goods.eatAllWorld': res.data.data.eatAllWorld,
        'goods.everyWeekHave': res.data.data.everyWeekHave,
        'goods.lostWillNextYear': res.data.data.lostWillNextYear,
        'goods.todayWhatEat': res.data.data.todayWhatEat,
      });
      console.log(that.data.goods);
    };
    server.getJSON(url, cb);
  },

  getHeadline: function () {
    var that = this;

    var url = '/api/wmp/article/get.do';
    var cb = function (res) {
      var headline = res.data.data;
      headline[0].show = true;
      that.setData({
        headline: headline
      });
      var count = 0;

      var t = setInterval(function () {
        count++;
        if (count >= headline.length) {
          count = 0;
        }
        for (var i = 0; i < headline.length; i++) {
          headline[i].show = false;
        }
        headline[count].show = true;
        that.setData({
          headline: headline
        });
      }, 3000);
    };

    server.getJSON(url, cb);
  },

  tabClick: function (e) {
    var section = e.currentTarget.dataset.section;
    var index = e.currentTarget.dataset.index;
    this.switchSectionTab(section, index);
    
    var tag_id = e.currentTarget.dataset.id;
    this.getSectionGoods(tag_id, section);
  },

  switchSectionTab: function (section, index) {
    var obj = {};;
    var key = 'tags_status.' + section;
    obj[key] = index;
    this.setData(obj);
  },

  getSectionGoods: function (tagId, section) {
    var that = this;
    var url = '/api/wmp/index/column-more-goods.do?tag_id=' + tagId;
    function cb (res) {
      var obj = {};var key = 'goods.' + section + '.goodsList';
      obj[key] = res.data.data.goodsList;
      that.setData(obj);
    };
    server.getJSON(url, cb);
  },

  showDetail: function (e) {
    var goodsId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "../goods/detail/detail?objectId=" + goodsId
    });
  },

  toSearch: function (e) {
    wx.navigateTo({
      url: "../search/index"
    });
  },

  onShareAppMessage: function () {
    return {
      title: '旺东大菜园',
      desc: '旺东大菜园商城',
      path: '/pages/index/index'
    }
  },
})