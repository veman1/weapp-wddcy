var server = require('../../utils/server');
Page({
  data: {
    topCat: [],
    subCategories: [],
    highlight: ['highlight', '', '', '', '', '', '', '', '', '', '', ''],
    banner: '',

    // 测试用数据
    subCategories2: [
      {
        mobile_name: '蔬菜',
        image: '../../imgs/category_01.png'
      },
      {
        mobile_name: '肉类',
        image: '../../imgs/category_01.png'
      },
      {
        mobile_name: '家禽蛋类',
        image: '../../imgs/category_01.png'
      },
      {
        mobile_name: '水果',
        image: '../../imgs/category_01.png'
      },
      {
        mobile_name: '速冻食品',
        image: '../../imgs/category_01.png'
      },
      {
        mobile_name: '水产海鲜',
        image: '../../imgs/category_01.png'
      },
      {
        mobile_name: '奶饮',
        image: '../../imgs/category_01.png'
      },
      {
        mobile_name: '零食',
        image: '../../imgs/category_01.png'
      },
      {
        mobile_name: '粮油调味',
        image: '../../imgs/category_01.png'
      },
      {
        mobile_name: '干货',
        image: '../../imgs/category_01.png'
      },
      {
        mobile_name: '酒水',
        image: '../../imgs/category_01.png'
      },
      {
        mobile_name: '茗茶',
        image: '../../imgs/category_01.png'
      }
    ]
  },
  onLoad: function () {
    // this.getTopCategory();
  },
  onShow: function () {
    this.getTopCategory();
  },
  tapTopCategory: function (e) {
    // 拿到objectId，作为访问子类的参数
    var objectId = e.currentTarget.dataset.id;
    var banner_name = e.currentTarget.dataset.banner;

    var index = parseInt(e.currentTarget.dataset.index);
    this.setHighlight(index);

    this.getCategory(objectId);
    this.getBanner(banner_name);

  },
  getTopCategory: function (parent) {
    var url = '/api/mobile/cat/one_classification.do';
    var that = this;
    server.getJSON(url, function (res) {

      var topCat = res.data.data;
      that.setData({
        topCat: topCat
      });

      // that.getCategory(categorys[0].id);
      // that.getBanner(categorys[0].mobile_name);
    });
  },
  getCategory: function (parent) {
    var that = this;


    server.getJSON('/Goods/goodsCategoryList/parent_id/' + parent, function (res) {
      var categorys = res.data.result;
      that.setData({
        subCategories: categorys
      });
    });
  },
  setHighlight: function (index) {
    var highlight = [];
    for (var i = 0; i < this.data.topCategories; i++) {
      highlight[i] = '';
    }
    highlight[index] = 'highlight';
    this.setData({
      highlight: highlight
    });
  },
  avatarTap: function (e) {
    var cid = e.currentTarget.dataset.cid;
    var index = e.currentTarget.dataset.index;
    var cName = this.data.topCat[index].name;
    wx.navigateTo({
      url: "/pages/goods/list/list?categoryId=" + cid + '&cName=' + cName
    });
  },
  getBanner: function (banner_name) {


    var that = this;

    server.getJSON('/goods/categoryBanner/banner_name/' + banner_name, function (res) {
      var banner = res.data.banner;
      that.setData({
        banner: banner
      });
    });

  }
})
