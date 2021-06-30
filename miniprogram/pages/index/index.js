const app = getApp()
const db = wx.cloud.database()
const dayjs = require("./dayjs");
const $ = db.command.aggregate
const _ = db.command

Page({
  data: {
    look: false
  },

  onLoad: function () {
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: loginres => {
        if ( loginres.result.openid == 'ooqHY5VPsNzi80qnH0-RNU0S0lBA11' || loginres.result.openid == 'ooqHY5arIyp2vyz0PkM5NxBmFu-8') {
          wx.redirectTo({
            url: '../houduan/guanli/guanli',
          })
        } else {
          db.collection('worker').where({
            _openid: loginres.result.openid
          }).get().then(res => {
            console.log(res.data)
            if (res.data.length > 0) {
              if (res.data[0].style == "shop") {
                wx.redirectTo({
                  url: '../houduan/shangpu/shangpu?shopid=' + res.data[0].shopid,
                })
              }
              if (res.data[0].style == "worker") {
                wx.redirectTo({
                  url: '../houduan/guanli/guanli',
                })
              }

            }
          })
        }
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },
  gouser: function () {
    wx.navigateTo({
      url: '../user/shangpu/shangpu',
    })
  },
  goshop: function () {
    wx.navigateTo({
      url: '../houduan/shangpu/shangpu',
    })
  },
  gohouduan: function () {
    wx.navigateTo({
      url: '../houduan/guanli/guanli',
    })
  },
  look: function () {
    this.setData({
      look: !this.data.look
    })
  },
  formSubmit(e) {
    var self = this
    var zhanghao = e.detail.value.zhanghao
    var mima = e.detail.value.mima
    console.log(zhanghao, mima)
    if (zhanghao.length > 0 && mima.length > 0) {
      wx.showLoading({
        title: '账号检验中...',
        mask: true,
      })
      if(zhanghao=='useruser'&&mima=='useruser'){
        wx.redirectTo({
          url: '../user/shangpu/shangpu?shop_id=' + 'info_1',
        })
      }
      if(zhanghao=='workeworke'&&mima=='workeworke'){
        wx.redirectTo({
          url: '../houduan/guanli/guanli',
        })
      }
      db.collection('shop').where({
        name: zhanghao,
        shopid: mima
      }).get({
        success: function (res) {
          wx.hideLoading()
          if (res.data.length > 0) {
            var shop_id = res.data[0]._id
            var work = {
              shopname: zhanghao,
              shopid: mima,
              shop_id: shop_id,
              style: "shop",
            }
            wx.showModal({
              title: '提示',
              content: '您将与商铺【' + zhanghao + '】绑定',
              success(res) {
                if (res.confirm) {
                  wx.showLoading({
                    title: '账号绑定中...',
                    mask: true,
                  })
                  db.collection('worker').add({
                    data: work,
                    success: function (res) {
                      wx.hideLoading()
                      wx.redirectTo({
                        url: '../houduan/shangpu/shangpu?shopid=' + mima,
                      })
                    },
                    fail: console.error,
                    complete: console.log
                  })
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }
            })
          } else {
            wx.hideLoading()
            wx.showToast({
              icon: "none",
              title: '请输入正确的账号密码',
            })
          }
        },
        fail: function (res) {
          wx.hideLoading()
        }
      })
    } else {
      wx.hideLoading()
      wx.showToast({
        icon: "none",
        title: '请输入正确的账号密码',
      })
    }
  },
})