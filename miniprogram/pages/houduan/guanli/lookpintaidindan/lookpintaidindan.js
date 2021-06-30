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
    index: 0,
    picker: [],
    date1: '2020-07-15',
    date2: '2020-07-25',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this
    self.setData({
      date1: dayjs().format('YYYY-MM-DD'),
      date2: dayjs().add(6, 'day').format('YYYY-MM-DD')
    })
  },
  DateChange1(e) {
    this.setData({
      date1: e.detail.value,
    })
  },

  PickerChange(e) {
    console.log(e);
    console.log(this.data.picker[e.detail.value].shopid)
    this.setData({
      shopid:this.data.picker[e.detail.value].shopid,
      index: e.detail.value
    })
  },
  lookday(e) {
    var self = this
    var day = self.data.date1
    wx.showLoading({
      mask: true,
      title: '数据获取中...',
    })
    db.collection('dindan').aggregate()
      .match({
        upday:day
      })
      .project({
        _id: 0,
        day: 1,
        upday: 1,
        uptime: 1,
        yuyue: 1,
        outTradeNo: 1,
        shopname: 1,
        totalprice: 1,
      })
      .limit(99999)
      .end({
        success: function (res) {
          console.log(res)
          self.setData({
            dindan:res.list.reverse(),
          })
          wx.hideLoading()

        },
        fail: function (err) {
          console.error(err)
        }
      })

  }

})