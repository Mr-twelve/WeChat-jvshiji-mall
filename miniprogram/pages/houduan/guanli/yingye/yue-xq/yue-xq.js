const app = getApp()
const db = wx.cloud.database()
const dayjs = require("./dayjs");
const $ = db.command.aggregate
const _ = db.command
Page({
  data: {
    day: []
  },

  onLoad: function (options) {
    var self = this
    var yue = options.yue

    
    db.collection('TJday').aggregate()
      .match({
        day: _.and([_.gt(yue), _.lt(dayjs(yue).add(1, 'month').format('YYYY-MM'))])
      })
      .limit(99)
      .end({
        success: function (res) {
          db.collection('shop').doc('9aa177b05f0d42350001958b692cd84f').get().then(shopTJ => {
            self.setData({
              TJ: res.list,
              shopTJ: shopTJ.data.LSshopid
            })
          })
        },
        fail: function (err) {
          console.error(err)
        }
      })
  },
  lookday(e) {
    var self = this
    var day = 'TJ[' + e.currentTarget.id + '].look'
    self.setData({
      [day]: !self.data.TJ[e.currentTarget.id].look
    })
  }


})