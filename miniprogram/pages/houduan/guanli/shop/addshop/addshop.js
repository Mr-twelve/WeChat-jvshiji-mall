const app = getApp()
const db = wx.cloud.database()
const dayjs = require("./dayjs");
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      shop_id: options.shopid
    })

  },
  /* Object.assign(i,a) */
  formSubmit(e) {
    var self = this
    var shop_id = self.data.shop_id
    var id = self.createNonceStr()
    console.log(id)
    console.log(shop_id)
    console.log(e.detail.value.name)
    if (e.detail.value.name.length > 0) {
      wx.showModal({
        title: '提示',
        content: '确定商铺名称为：' + e.detail.value.name,
        success(res) {
          if (res.confirm) {
            wx.showLoading({
              mask:true,
              title:  '商铺添加中...',
            })
            db.collection('shop').doc(shop_id).update({
              data: {
                "name": e.detail.value.name,
                "shopid": id,
                "goprice": "10",
                "shopyesno": false,
                "caidan": [],
                "goods": [],
                "have": true,
                "look": false
              },
              success: function (res) {
                db.collection('shop').doc('9aa177b05f0d42350001958b692cd84f').get().then(res => {
                  console.log(res.data.LSshopid)
                  var a = res.data.LSshopid
                  var b = {
                    [id]: e.detail.value.name
                  }
                  var LSshopid = Object.assign(a, b)
                  db.collection('shop').doc('9aa177b05f0d42350001958b692cd84f').update({
                    data: {
                      LSshopid: LSshopid
                    },
                    success: function (res) {
                      wx.hideLoading()
                      wx.redirectTo({
                        url: '../../shop/shop',
                      })
                    },
                    fail: function (res) {
                      wx.hideLoading()
                    },
                  })
                })

              },
              fail: function (res) {
                wx.hideLoading()
              },
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    } else {
      wx.showToast({
        icon:"none",
        title: '请输入商铺名称',
      })
    }
  },
  //生成随机数
  createNonceStr: function () {
    var str = "",
      range = 9, //min
      arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];


    for (var i = 0; i < range; i++) {
      var pos = Math.round(Math.random() * (arr.length - 1));
      str += arr[pos];
    }
    return str;
  }
})