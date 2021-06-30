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

      var ishopid=picker[0].shopid
      self.setData({
        shopid:ishopid,
        picker: picker
      })
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
    var shopid=self.data.shopid
    wx.showLoading({
      mask: true,
      title: '数据获取中...',
    })
    db.collection('dindan').aggregate()
      .match({
        shopid: shopid,
        day:day
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

          console.log(res)
          var totalprice=res.list[0].num
          self.setData({
            totalprice:parseFloat(totalprice.toFixed(2)),
          })

        },
        fail: function (err) {
          console.error(err)
        }
      })

    db.collection('dindan').aggregate()
      .match({
        shopid: shopid,
        day: day
      })
      .limit(99999)
      .end({
        success: function (res) {
          console.log(res.list)
          db.collection('dindan').aggregate()
            .match({
              shopid: shopid,
              day: day
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

})