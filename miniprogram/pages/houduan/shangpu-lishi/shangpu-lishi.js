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
    endindex: 0,
    dayjs_yue: [],
    dayjs_day: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    /* var shop_id = "10000001" */
    var shop_id = options.shopid
    console.log(options)
    var self = this
    var dayjs_yue = []
    var enddayjs = '2020-07'
    for (var i = 0; i < 99; i++) {
      var dayjsyue = dayjs().subtract(i, 'month').format('YYYY-MM')
      var objectdayjsyue = {
        day: dayjsyue,
        look: false
      }
      dayjs_yue.push(objectdayjsyue)
      if (enddayjs == dayjsyue) {
        self.setData({
          endindex: 0,
          dayjs_yue: [],
          dayjs_day: [],
          dayjs_yue: dayjs_yue,
          shop_id: shop_id,
        })
        break;
      }
    }

  },
  /* 月份查看 */
  lookyue(e) {
    console.log(e.currentTarget.id)
    var self = this
    var dayjsyue = 'dayjs_yue[' + e.currentTarget.id + '].look'
    var enddayjsyue = 'dayjs_yue[' + self.data.endindex + '].look'
    var shopid = self.data.shop_id
    wx.showLoading({
      mask: true,
      title: '数据获取中...',
    })
    if (self.data.endindex == e.currentTarget.id) {
      self.setData({
        endindex: e.currentTarget.id,
        [dayjsyue]: !self.data.dayjs_yue[e.currentTarget.id].look
      })
    } else {
      self.setData({
        [enddayjsyue]: false,
        endindex: e.currentTarget.id,
        [dayjsyue]: true
      })
    }
    console.log(shopid)
    db.collection('dindan').aggregate()
      .match({
        shopid: shopid,
        day: _.and([_.gt(self.data.dayjs_yue[e.currentTarget.id].day), _.lt(dayjs(self.data.dayjs_yue[e.currentTarget.id].day).add(1, 'month').format('YYYY-MM'))])
      })
      .project({
        _id: 0,
        buy: 1
      })
      .unwind('$buy')
      .group({
        _id: '$buy.name',
        num: $.sum('$buy.number')
      })
      .limit(9999)
      .end({
        success: function (goodsres) {
          console.log(goodsres.list)
          self.setData({
            yuetotal: goodsres.list
          })
          wx.hideLoading()
        },
        fail: function (err) {
          wx.hideLoading()
          console.error(err)
        }
      })

  },
  /* 月详情查看 */
  lookyuexq(e) {
    console.log(e.currentTarget.id)
    wx.navigateTo({
      url: 'yue-xq/yue-xq?yue=' + e.currentTarget.id + '&shopid=' + this.data.shop_id,
    })
  }

})