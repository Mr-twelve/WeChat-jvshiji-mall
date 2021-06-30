const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    setting:false,
    shopTJ: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self=this
    db.collection('shop').where({

    }).field({
      _id: true,
      name: true,
      shopid: true,
    }).limit(11).get().then(res => {
      self.setData({
        shopTJ:res.data
      })
      console.log(res.data)
    })
  },

  goshop(e){

    wx.navigateTo({
      url: '../../../user/shangpu/shangpu?shop_id=' + e.currentTarget.id
    })
  }
})