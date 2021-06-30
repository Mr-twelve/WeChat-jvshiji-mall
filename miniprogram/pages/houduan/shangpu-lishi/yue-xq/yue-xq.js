const app = getApp()
const db = wx.cloud.database()
const dayjs = require("./dayjs");
const $ = db.command.aggregate
const _ = db.command
Page({
  data: {
    endindex: 0,
    day: [],
    yyyymmdd: [],
  },

  onLoad: function (options) {
    console.log(options)
    var shop_id = options.shopid
    var self = this
    var day = []
    var yue = options.yue
    var nowyue = dayjs(yue).format('YYYY-MM-DD')
    var addyue = dayjs(yue).add(1, 'month').format('YYYY-MM-DD')
    for (var i = 1; i < 40; i++) {
      var newday = {
        day: dayjs(addyue).subtract(i, 'day').format('YYYY-MM-DD'),
        look: false
      }
      day.push(newday)
      if (dayjs(addyue).subtract(i, 'day').format('YYYY-MM-DD') == nowyue) {
        self.setData({
          day: day
        })
        break;
      }
    }
    db.collection('dindan').aggregate()
      .match({
        shopid: shop_id,
        day: _.and([_.gt(yue), _.lt(dayjs(yue).add(1, 'month').format('YYYY-MM'))])
      })
      .project({
        _id: 0,
        day: 1,
        totalprice: 1
      })
      .group({
        _id: '$day',
        num: $.sum('$totalprice')
      })
      .limit(99999)
      .end({
        success: function (res) {
          var yuetotalprice=0
          for(var i=0;i<res.list.length;i++){
            yuetotalprice+=res.list[i].num
          }
          console.log(res)
          self.setData({
            yue:yue,
            yuetotalprice:parseFloat(yuetotalprice.toFixed(2)),
            shop_id: shop_id,
            yyyymmdd: res.list
          })
          wx.hideLoading()
        },
        fail: function (err) {
          console.error(err)
        }
      })
  },
  lookday(e) {
    var self = this
    var endday = 'day[' + self.data.endindex + '].look'
    var day = 'day[' + e.currentTarget.id + '].look'
    if (self.data.endindex == e.currentTarget.id) {
      self.setData({
        endindex: e.currentTarget.id,
        [day]: !self.data.day[e.currentTarget.id].look
      })
    } else {
      self.setData({
        [endday]: false,
        endindex: e.currentTarget.id,
        [day]: true
      })
    }
    if ((self.data.endindex != e.currentTarget.id) || (self.data.endindex == e.currentTarget.id && self.data.day[e.currentTarget.id].look == false)) {
      wx.hideLoading()
    } else {
      wx.showLoading({
        mask: true,
        title: '数据获取中...',
      })
      db.collection('dindan').aggregate()
        .match({
          shopid: self.data.shop_id,
          day: self.data.day[e.currentTarget.id].day
        })
        .limit(99999)
        .end({
          success: function (res) {
            console.log(res.list)
            db.collection('dindan').aggregate()
              .match({
                shopid: self.data.shop_id,
                day: self.data.day[e.currentTarget.id].day
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
                  console.log(res)
                  self.setData({
                    todaygoods: goodsres.list,
                    todaydindan: res.list
                  })
                  wx.hideLoading()
                },
                fail: function (err) {
                  wx.hideLoading()
                  console.error(err)
                }
              })
          },
          fail: function (err) {
            wx.hideLoading()
            console.error(err)
          }
        })
    }

  }


})