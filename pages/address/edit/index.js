var server = require('../../../utils/server');

Page({
  data: {
    current: 0,
    province: [],
    city: [],
    region: [],
    town: [],
    provinceObjects: [],
    cityObjects: [],
    regionObjects: [],
    townObjects: [],
    areaSelectedStr: '请选择省市区',
    maskVisual: 'hidden',
    provinceName: '请选择'
  },
  onLoad: function (options) {
    var that = this
    wx.showLoading();
    this.getArea(1, function (area) {
      wx.hideLoading();
      var array = [];
      for (var i = 0; i < area.length; i++) {
        array[i] = area[i].local_name;
      }
      that.setData({
        province: array,
        provinceObjects: area
      });
    });
    this.loadAddress(options.addr_id);
  },
  loadAddress: function (addr_id) {
    var that = this;
    server.getJSON('/api/wmp/consignee/getConsigneeDetail.do', {
      addressId: addr_id
    }, function (res) {
      var address = res.data.data;
      that.setData({
        addr_id: address.addr_id,
        areaSelectedStr: address.province + address.city + address.region,
        province_id: address.province_id,
        city_id: address.city_id,
        region_id: address.region_id,
        provinceName: address.province,
        cityName: address.city,
        regionName: address.region,
        mobile: address.mobile,
        zipcode: address.zip,
        address: address.addr, 
        consignee: address.name, 
        district: address.district, 
        cityvalue: address.cityvalue, 
        provincev: address.province 
      });
      console.log('province:', that.data.province);
    });
  },

  formSubmit: function (e) {
    var addr_id = this.data.addr_id;
    // user 
    var mobile = this.data.mobile;
    // detail
    var zipcode = this.data.zipcode;

    var consignee = this.data.consignee;
    if (!consignee) { wx.showToast({ title: '请输入收货人姓名！' }); return; }

    var address = this.data.address;
    if (!address) { wx.showToast({ title: '请输入地址！' }); return; }

    var provinceIndex = this.data.provinceIndex;
    var cityIndex = this.data.cityIndex;
    var regionIndex = this.data.regionIndex;
    
    if (provinceIndex >= 0 && cityIndex >= 0 && regionIndex >= 0) {
      var province_id = this.data.provinceObjects[this.data.provinceIndex].region_id;
      var city_id = this.data.cityObjects[this.data.cityIndex].region_id;
      var region_id = this.data.regionObjects[this.data.regionIndex].region_id;
      // wx.showToast({ title: '请选择地区' }); return; 
    } else {
      var province_id = this.data.province_id;
      var city_id = this.data.city_id;
      var region_id = this.data.region_id;
    }

    var province = this.data.provinceName;
    var city = this.data.cityName;
    var region = this.data.regionName;

    // var province_id = this.data.province_id;
    // var city_id = this.data.city_id;
    // var region_id = this.data.region_id;

    // if (!(province_id >= 0 && city_id >= 0 && region_id >= 0)) { wx.showToast({ title: '请选择地区' }); return; }

    var that = this;
    // server.postJSON('/User/addAddress/user_id/' + user_id, { user_id: user_id, mobile: mobile, zipcode: zipcode, consignee: consignee, address: address, is_default: is_default, country: country, twon: twon, province: province, city: city, district: district }, function (res) {
    console.log('发送请求');
    server.getJSON('/api/shop/member-address/edit.do', {
      addr_id: addr_id,
      name: consignee,
      mobile: mobile,
      province_id: province_id,
      city_id: city_id,
      region_id: region_id,
      province: province,
      city: city,
      region: region,
      addr: address,
      def_addr: 1,
    }, function (res) {
      if (!res.data.result) {
        wx.showToast({ title: res.data.message, image: '/images/error.png' }); return;
      } else {
        wx.navigateBack();
        wx.showToast({ title: res.data.message }); return;
      }
    });
  },
  nameChange: function (e) {

    var value = e.detail.value;

    this.setData({
      consignee: value
    });
  },
  addressChange: function (e) {

    var value = e.detail.value;

    this.setData({
      address: value
    });
  },
  phoneChange: function (e) {

    var value = e.detail.value;

    this.setData({
      mobile: value
    });
  },
  yzChange: function (e) {

    var value = e.detail.value;

    this.setData({
      zipcode: value
    });
  },
  getArea: function (rigeonid, cb) {
    var that = this;

    server.getJSON('/api/base/region/get-children.do?regionid=' + rigeonid, function (res) {
      cb(res.data);
    })
  },
  setDefault: function () {
    var that = this;
    var user = AV.User.current();
    // if user has no address, set the address for default
    var query = new AV.Query('Address');
    query.equalTo('user', user);
    query.count().then(function (count) {
      if (count <= 0) {
        that.isDefault = true;
      }
    });
  },
  cascadePopup: function () {
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease-in-out',
    });
    this.animation = animation;
    animation.translateY(-285).step();
    this.setData({
      animationData: this.animation.export(),
      maskVisual: 'show'
    });
  },
  cascadeDismiss: function () {
    this.animation.translateY(285).step();
    this.setData({
      animationData: this.animation.export(),
      maskVisual: 'hidden'
    });
  },
  provinceTapped: function (e) {
    // 标识当前点击省份，记录其名称与主键id都依赖它
    var index = e.currentTarget.dataset.index;
    // current为1，使得页面向左滑动一页至市级列表
    // provinceIndex是市区数据的标识
    this.setData({
      provinceName: this.data.province[index],
      regionName: '',
      townName: '',
      provinceIndex: index,
      cityIndex: -1,
      regionIndex: -1,
      townIndex: -1,
      region: [],
      town: []
    });
    var that = this;
    //provinceObjects是一个LeanCloud对象，通过遍历得到纯字符串数组
    // getArea方法是访问网络请求数据，网络访问正常则一个回调function(area){}
    this.getArea(this.data.provinceObjects[index].region_id, function (area) {
      var array = [];
      for (var i = 0; i < area.length; i++) {
        array[i] = area[i].local_name;
      }
      // city就是wxml中渲染要用到的城市数据，cityObjects是LeanCloud对象，用于县级标识取值
      that.setData({
        cityName: '请选择',
        city: array,
        cityObjects: area
      });
      // 确保生成了数组数据再移动swiper
      that.setData({
        current: 1
      });
    });
  },
  cityTapped: function (e) {
    // 标识当前点击县级，记录其名称与主键id都依赖它
    var index = e.currentTarget.dataset.index;
    // current为1，使得页面向左滑动一页至市级列表
    // cityIndex是市区数据的标识
    this.setData({
      cityIndex: index,
      regionIndex: -1,
      townIndex: -1,
      cityName: this.data.city[index],
      regionName: '',
      townName: '',
      town: []
    });
    var that = this;
    //cityObjects是一个LeanCloud对象，通过遍历得到纯字符串数组
    // getArea方法是访问网络请求数据，网络访问正常则一个回调function(area){}
    this.getArea(this.data.cityObjects[index].region_id, function (area) {
      var array = [];
      for (var i = 0; i < area.length; i++) {
        array[i] = area[i].local_name;
      }
      // region就是wxml中渲染要用到的城市数据，regionObjects是LeanCloud对象，用于县级标识取值
      that.setData({
        regionName: '请选择',
        region: array,
        regionObjects: area
      });
      // 确保生成了数组数据再移动swiper
      that.setData({
        current: 2
      });
    });
  },
  regionTapped: function (e) {
    // 标识当前点击镇级，记录其名称与主键id都依赖它
    var index = e.currentTarget.dataset.index;
    // current为1，使得页面向左滑动一页至市级列表
    // regionIndex是县级数据的标识
    this.setData({
      regionIndex: index,
      townIndex: -1,
      regionName: this.data.region[index],
      townName: ''
    });
    var that = this;
    //townObjects是一个LeanCloud对象，通过遍历得到纯字符串数组
    // getArea方法是访问网络请求数据，网络访问正常则一个回调function(area){}
    this.getArea(this.data.regionObjects[index].region_id, function (area) {
      // 假如没有镇一级了，关闭悬浮框，并显示地址
      if (area.length == 0) {
        var areaSelectedStr = that.data.provinceName + that.data.cityName + that.data.regionName;
        that.setData({
          areaSelectedStr: areaSelectedStr
        });
        that.cascadeDismiss();
        return;
      }
      var array = [];
      for (var i = 0; i < area.length; i++) {
        array[i] = area[i].local_name;
      }
      // region就是wxml中渲染要用到的县级数据，regionObjects是LeanCloud对象，用于县级标识取值
      that.setData({
        townName: '请选择',
        town: array,
        townObjects: area
      });
      // 确保生成了数组数据再移动swiper
      that.setData({
        current: 3
      });
    });
  },
  townTapped: function (e) {
    // 标识当前点击镇级，记录其名称与主键id都依赖它
    var index = e.currentTarget.dataset.index;
    // townIndex是镇级数据的标识
    this.setData({
      townIndex: index,
      townName: this.data.town[index]
    });
    var areaSelectedStr = this.data.provinceName + this.data.cityName + this.data.regionName + this.data.townName;
    this.setData({
      areaSelectedStr: areaSelectedStr
    });
    this.cascadeDismiss();
  },
  currentChanged: function (e) {
    // swiper滚动使得current值被动变化，用于高亮标记
    var current = e.detail.current;
    this.setData({
      current: current
    });
  },
  changeCurrent: function (e) {
    // 记录点击的标题所在的区级级别
    var current = e.currentTarget.dataset.current;
    this.setData({
      current: current
    });
  }
})

var A = {
  
}