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
    nohave: false,
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
      shopid: this.data.picker[e.detail.value].shopid,
      index: e.detail.value
    })
  },
  lookday(e) {
    var self = this
    var day = self.data.date1
    console.log(e.detail.value.inputname)
    var inputname = e.detail.value.inputname
    /* wx.showLoading({
      mask: true,
      title: '数据获取中...',
    }) */
    db.collection('dindan').aggregate()
      .match(_.or([{
          name: inputname
        },
        {
          tell: inputname
        },
        {
          outTradeNo: inputname
        }
      ]))
      .limit(99999)
      .end({
        success: function (res) {
          console.log(res)
            if (res.list.length == 0) {
              var nohave = true
            } else {
              var nohave = false
            }
          self.setData({
            nohave: nohave,
            dindan: res.list.reverse(),
          })
          wx.hideLoading()

        },
        fail: function (err) {
          console.error(err)
        }
      })

  }

})