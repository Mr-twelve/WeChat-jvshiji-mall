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
    db.collection('shop').doc('9aa177b05f0d42350001958b692cd84f').get().then(res => {
      console.log(res.data)
      var LSshopid = res.data.LSshopid
      var picker = []
      for (let key of Object.keys(LSshopid)) {
        picker.push({
          shopid: key,
          name: LSshopid[key]
        })
      }
      self.setData({
        picker: picker
      })
    })
  },
  DateChange1(e) {
    var date2 = dayjs(e.detail.value).add(6, 'day').format('YYYY-MM-DD')
    this.setData({
      date1: e.detail.value,
      date2: date2,
    })
  },
  DateChange2(e) {
    console.log(e.detail.value)
    this.setData({
      date2: e.detail.value
    })
  },
  PickerChange(e) {
    console.log(e);
    this.setData({
      index: e.detail.value
    })
  },
  daygoods() {
    var self = this
    var data1 = self.data.date1
    var data2 = self.data.date2
    console.log(self.data.picker[self.data.index].shopid)
    db.collection('dindan').aggregate()
      .match({
        shopid: self.data.picker[self.data.index].shopid,
        day: _.and([_.gte(data1), _.lte(data2)])
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
          console.log(goodsres)
          self.setData({
            goods: goodsres.list
          })
          wx.hideLoading()
        },
        fail: function (err) {
          wx.hideLoading()
          console.error(err)
        }
      })
    db.collection('dindan').aggregate()
      .match({
        shopid: self.data.picker[self.data.index].shopid,
        day: _.and([_.gte(data1), _.lte(data2)])
      })
      .project({
        _id: 0,
        totalprice: 1
      })
      .group({
        _id: '1',
        price: $.sum('$totalprice')
      })
      .limit(9999)
      .end({
        success: function (res) {
          console.log(res)
          self.setData({
            shopprice: res.list[0].price.toFixed(2)
          })
          wx.hideLoading()
        },
        fail: function (err) {
          wx.hideLoading()
          console.error(err)
        }
      })
  },
})