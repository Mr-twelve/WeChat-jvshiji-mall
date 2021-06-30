const app = getApp()
const db = wx.cloud.database()
const dayjs = require("./dayjs");
const $ = db.command.aggregate
const _ = db.command
const util = require("../../util/dayin.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    yesgo: 0,
    nowgo: 0,
    zwgo: 0,
    wsgo: 0,
    totalnowdindan: [],
    yuyuepicker: ['全部', '现在派送', '中午', '晚上', ],
    yuyuepickernow: '全部',
    yuyueindex: 0,
    totalnow: false, //弹窗统计
    shopdindan: true, //待出单和已出单
    tabbar: false,
    goodslength: 0,
  },
  onLoad: function (options) {
    console.log(options)
    var self = this
    var shop_id = options.shopid
    var nowday = dayjs().format('YYYY-MM-DD')
    var yestday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
    self.setData({
      shopid: shop_id
    }, () => {
      self.onShow()
    })
    /* db.collection('dindan').aggregate()
      .match({
        shopid: shop_id,
        day: nowday,
      })
      .project({
        _id: 0,
        go: 1
      })
      .group({
        _id: '$go',
        num: $.sum(1)
      })
      .limit(999)
      .end({
        success: function (res) {

          wx.hideLoading()
        },
        fail: function (err) {
          console.error(err)
        }
      }) */
  },

  onShow: function (options) {
    var shopid = this.data.shopid
    var shop_id = 'info_1'
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    var self = this
    var nowday = dayjs().format('YYYY-MM-DD')
    var yestday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
    var goodslength = self.data.goodslength
    db.collection('shop').where({
      shopid: shopid
    }).get().then(res => {
      const _ = db.command
      console.log(res)
      const watcher = db.collection('dindan')
        .where({
          shopid: res.data[0].shopid,
          day: nowday,
        })
        .watch({
          onChange: function (snapshot) {
            console.log('query result snapshot after the event', snapshot.docs)
            if (snapshot.type === 'init') {
              self.setData({
                goodslength: snapshot.docs.length
              })
            }
            wx.hideLoading()
            wx.hideNavigationBarLoading()
            wx.stopPullDownRefresh()
            self.setData({
              shopinfo:res.data[0],
              shopid: res.data[0].shopid,
              todaydindan: snapshot.docs
            })
            self.aggregatedindan(snapshot.docs)
          },
          onError: function (err) {
            console.error('the watch closed because of error', err)
            wx.hideNavigationBarLoading()
            wx.stopPullDownRefresh()
            wx.hideLoading()
          }
        })
      /* wx.cloud.callFunction({
        // 要调用的云函数名称
        name: 'shangpu-getdindan-now',
        // 传递给云函数的参数
        data: {
          shopid: res.data[0].shopid,
          nowday: nowday,
          yestday: yestday,
        },
        success: ssres => {
          wx.hideLoading()
          wx.hideNavigationBarLoading()
          wx.stopPullDownRefresh()
          self.setData({
            shopid: res.data[0].shopid,
            todaydindan: ssres.result.data
          })
          self.aggregatedindan(ssres.result.data)
        },
        fail: err => {
          console.log(err)
          wx.hideNavigationBarLoading()
          wx.stopPullDownRefresh()
          wx.hideLoading()
        },
        complete: () => {
          wx.hideNavigationBarLoading()
          wx.stopPullDownRefresh()
          wx.hideLoading()
        }
      }) */
    })
  },
  /* 统计各类订单条数 */
  aggregatedindan(res) {
    var self = this
    var nowgo = 0
    var zwgo = 0
    var wsgo = 0
    var yesgo = 0
    for (var i = 0; i <= res.length; i++) {
      if (i < res.length && res[i].go == 0) {
        switch (res[i].yuyue) {
          case "现在派送":
            nowgo++
            break;
          case "预约今天中午":
            zwgo++
            break;
          case "预约今天晚上":
            wsgo++
            break;
          case "预约明天中午":
            zwgo++
            break;
          case "预约明天晚上":
            wsgo++
            break;
        }
      }
      if (i < res.length && res[i].go == 1) {
        yesgo++
      }
      if (i == res.length) {
        self.setData({
          yesgo: yesgo,
          nowgo: nowgo,
          zwgo: zwgo,
          wsgo: wsgo,
        })
      }

    }
  },
  PickerChange(e) {
    this.setData({
      yuyuepickernow: this.data.yuyuepicker[e.detail.value],
      yuyueindex: e.detail.value
    })
  },
  tabbarshop(e) {
    wx.navigateTo({
      url: '../shangpu/shangpu?shopid=' + this.data.shopid,
    })
  },
  lishidingdan(e) {
    wx.navigateTo({
      url: '../shangpu-lishi/shangpu-lishi?shopid=' + this.data.shopid,
    })
  },
  tabSelect1(e) {
    this.setData({
      shopdindan: true
    })
  },
  tabSelect2(e) {
    this.setData({
      shopdindan: false
    })
  },
  /* 出单 */
  godan(e) {
    var self = this
    wx.showModal({
      title: '提示',
      content: '是否确定出单？',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            mask: true,
            title: '出单中...',
          })
          console.log(e.currentTarget.id)
          var _id = self.data.todaydindan[e.currentTarget.id]._id
          console.log(_id)
          var newdindan = 'todaydindan[' + e.currentTarget.id + '].go'
          var goday = dayjs().format('YYYY-MM-DD')
          var gotime = dayjs().format('HH:mm:ss')
          var newdindangoday = 'todaydindan[' + e.currentTarget.id + '].goday'
          var newdindangotime = 'todaydindan[' + e.currentTarget.id + '].gotime'
          db.collection('dindan').doc(_id).update({
            // data 传入需要局部更新的数据
            data: {
              // 表示将 done 字段置为 true
              go: 1,
              goday: goday,
              gotime: gotime,
            },
            success: function (res) {
              switch (self.data.todaydindan[e.currentTarget.id].yuyue) {
                case "现在派送":
                  self.setData({
                    nowgo: self.data.nowgo--,
                    yesgo: self.data.yesgo++
                  })
                  break;
                case "预约今天中午":
                  self.setData({
                    zwgo: self.data.zwgo--,
                    yesgo: self.data.yesgo++
                  })
                  break;
                case "预约今天晚上":
                  self.setData({
                    wsgo: self.data.wsgo--,
                    yesgo: self.data.yesgo++
                  })
                  break;
                case "预约明天中午":
                  self.setData({
                    zwgo: self.data.zwgo--,
                    yesgo: self.data.yesgo++
                  })
                  break;
                case "预约明天晚上":
                  self.setData({
                    wsgo: self.data.wsgo--,
                    yesgo: self.data.yesgo++
                  })
                  break;
              }
              self.setData({
                [newdindan]: 1,
                [newdindangoday]: goday,
                [newdindangotime]: gotime
              }, () => {
                wx.hideLoading()
              })
            },
            fail: function (res) {
              wx.hideLoading()
              wx.showToast({
                mask: true,
                icon: "none",
                title: '出单失败请重新尝试',
              })
            },
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  /* 待出单统计 */
  totalnow(e) {
    var self = this
    wx.showLoading({
      title: '统计中...',
    })
    self.setData({
      totalnow: true
    })
    var shopid = self.data.shopid
    var nowday = dayjs().format('YYYY-MM-DD')
    /* 现在 */
    db.collection('dindan').aggregate()
      .match({
        go: 0,
        shopid: shopid,
        day: nowday,
        yuyue: ('现在派送')
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
      .limit(999)
      .end({
        success: function (res) {
          self.setData({
            totalnowdindanXZ: res.list
          })
          wx.hideLoading()
        },
        fail: function (err) {
          console.error(err)
        }
      })
    /* 中午 */
    db.collection('dindan').aggregate()
      .match(
        _.or([{
            go: 0,
            shopid: shopid,
            day: nowday,
            yuyue: ('预约今天中午')
          },
          {
            go: 0,
            shopid: shopid,
            day: nowday,
            yuyue: '预约明天中午'
          },
        ])
      )
      .project({
        _id: 0,
        buy: 1
      })
      .unwind('$buy')
      .group({
        _id: '$buy.name',
        num: $.sum('$buy.number')
      })
      .limit(999)
      .end({
        success: function (res) {
          self.setData({
            totalnowdindanZW: res.list
          })
          wx.hideLoading()
        },
        fail: function (err) {
          console.error(err)
        }
      })
    /* 晚上 */
    db.collection('dindan').aggregate()
      .match(
        _.or([{
            go: 0,
            shopid: shopid,
            day: nowday,
            yuyue: '预约今天晚上'
          },
          {
            go: 0,
            shopid: shopid,
            day: nowday,
            yuyue: '预约明天晚上'
          },
        ])
      )
      .project({
        _id: 0,
        buy: 1
      })
      .unwind('$buy')
      .group({
        _id: '$buy.name',
        num: $.sum('$buy.number')
      })
      .limit(999)
      .end({
        success: function (res) {
          self.setData({
            totalnowdindanWS: res.list
          })
          wx.hideLoading()
        },
        fail: function (err) {
          console.error(err)
        }
      })
  },
  hidetotalnow(e) {
    this.setData({
      totalnow: false
    })
  },
  //打印机出单
  dayin(e) {
    var dingdan = this.data.todaydindan[e.currentTarget.id]
    var shopinfo=this.data.shopinfo
     util.test(shopinfo.dayin, dingdan, shopinfo.name) 
  },

  /* 下拉刷新 */
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading()
    this.onShow()
  },


})