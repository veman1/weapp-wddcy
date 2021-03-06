var server = require('../../../utils/server');
var app = getApp()
Page({
  data: {
    addressObjects: []
  },
  add: function () {
    wx.navigateTo({
      url: '../add/add'
    });
  },
  onLoad(o) {
    o.from && this.setData({
      from: o.from
    })
  },
  onShow: function () {
    if (!app.globalData.login) {
      wx.showModal({
        title: '您还没有登录',
        confirmText: '前往登录',
        cancelText: '返回',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/index',
            })
          } else if (res.cancel) {
            wx.navigateBack()
          }
        }
      })
    } else {
      this.loadData();
    }
  },
  loadData: function () {
    var that = this;
    server.getJSON('/api/wmp/consignee/getConsigneeList.do', function (res) {
      if (res.data.result) {
        that.setData({
          addressObjects: res.data.data
        });
      } else {
        wx.showModal({
          title: '获取地址列表失败！',
          image: 'images/error.png',
          showCancel: false
        });
      }
    });
  },
  choose: function (e) {
    var that = this;
    var index = parseInt(e.currentTarget.dataset.index);
    var addressObjects = that.data.addressObjects;
    var addr_id = addressObjects[index].addr_id;
    // server.getJSON('/User/setDefaultAddress/user_id/' + user_id + "/address_id/" + address_id, function (res) {
    server.getJSON('/api/store/store-order/change-address.do?address_id=' + addr_id, function (res) {
      // if (res.data.status == 1) {
      //   that.setData({
      //     addressObjects: addressObjects
      //   });
      // }
    });
    // for (var i = 0; i < addressObjects.length; i++) {
    //   // 判断是否为当前地址，是则传true
    //   addressObjects[i].def_addr = i == index
    // }

    // // var user_id = getApp().globalData.userInfo.user_id
  },
  setDefault(e) {
    server.getJSON({
      url: '/api/shop/member-address/isdefaddr.do',
      data: {
        addr_id: e.currentTarget.dataset.id,
      },
      success: (res) => {
        if (res.data.result === 1) {
          if (this.data.from === 'ordersubmit') {
            wx.navigateBack()
          } else {
            this.loadData()
          }
        }
      }
    })
  },
  edit: function (e) {
    var that = this;
    // 取得下标
    var index = parseInt(e.currentTarget.dataset.index);
    // 取出id值
    var addr_id = this.data.addressObjects[index].addr_id;
    wx.navigateTo({
      url: '../edit/index?addr_id=' + addr_id
    });
  },
  delete: function (e) {
    var that = this;
    // 取得下标
    var addr_id = e.currentTarget.dataset.addrId;
    // 找到当前地址AVObject对象
    // var address = that.data.addressObjects[index];
    // var user_id = getApp().globalData.userInfo.user_id
    // var address_id = address.address_id;
    // 给出确认提示框
    wx.showModal({
      title: '确认',
      content: '要删除这个地址吗？',
      success: function (res) {
        if (res.confirm) {
          server.getJSON('/api/shop/member-address/delete.do?addr_id=' + addr_id, function (res) {
            wx.showToast({
              title: res.data.message,
              icon: 'success',
              duration: 2000
            });
            that.loadData();
          })
        }
      }
    })

  },
})