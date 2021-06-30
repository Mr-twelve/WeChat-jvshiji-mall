const app = getApp()
const db = wx.cloud.database()
const dayjs = require("./dayjs");
const $ = db.command.aggregate
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    setting:false,
    shop: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  onShow(e) {
    var self = this
    db.collection('shop').where({}).limit(11).get().then(shopTJ => {
      console.log(shopTJ)
      self.setData({
        setting:false,
        shopTJ: shopTJ.data
      })
    })
  },

  goshopdindan(e) {
    console.log(e.currentTarget.id)
    wx.navigateTo({
      url: '../../shangpu-lishi/shangpu-lishi?shopid=' + e.currentTarget.id,
    })

  },
  goshop(e) {
    console.log(e.currentTarget.id)
    wx.navigateTo({
      url: '../../shangpu/shangpu?shopid=' + e.currentTarget.id,
    })
  },
  /* 商铺添加 */
  addshop(e) {
    console.log(e)
    wx.navigateTo({
      url: 'addshop/addshop?shopid=' + e.currentTarget.id,
    })
  },
  fuzhi(e){
    console.log(e.currentTarget.id)
    wx.setClipboardData({
      data: e.currentTarget.id,
      success (res) {
        wx.getClipboardData({
          success (res) {}
        })
      }
    })
  },
  outshop(e) {
    var self=this
    wx.showModal({
      title: '确定下架该商铺？',
      content: '下架将清空该商铺所有信息(不包括用户已下订单信息)',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '商铺清理中...',
            mask:true
          })
          db.collection('shop').doc(e.currentTarget.id).update({
            data: {
              "name": '未入驻商家',
              "goprice": "10",
              "shopyesno": false,
              "caidan": [],
              "goods": [],
              "have": false,
              "look": false
            },
            success: function (res) {
              wx.hideLoading()
              self.onShow()
            },
            fail: console.error
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  setting(e){
    console.log(this.data.setting)
    this.setData({
      setting:!this.data.setting
    })
  }
})