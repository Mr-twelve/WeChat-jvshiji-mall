const app = getApp()
const db = wx.cloud.database()
const dayjs = require("./dayjs");
const util = require("../../util/dayin.js");
Page({

  data: {
    allok:false,
    sf:"师范(目前东门自取)",
    freepay: false,
    index: '0',
    beizu: '',
    picker: ['预约今天中午', '预约今天晚上', '预约明天中午', '预约明天晚上', ],
  },

  onShow: function (options) {
    wx.showLoading({
      mask:true,
      title: '获取订单信息...',
    })
    var self = this
    db.collection('zzzTEXT').doc('70a338c25f2a626c0000bf446a0c1ce9').get().then(res => {
      console.log(res.data.freepay)
      self.setData({
        freepay: res.data.freepay
      })
    })
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'time',
      // 传递给云函数的参数
      data: {},
      success: res => {
        var nowtime = dayjs(res.result.time).format('HH:mm')
        if (nowtime < "11") {
          self.setData({
            oldindex: '0',
            index: '0'
          })
        }
        if (nowtime >= "11" && nowtime < "17") {
          self.setData({
            oldindex: '1',
            index: '1'
          })
        }
        if (nowtime >= "17") {
          self.setData({
            oldindex: '2',
            index: '2'
          })
        }
        wx.getStorage({
          key: 'userinfo',
          success(res) {
            wx.getStorage({
              key: 'pay',
              success(pay) {
                wx.getStorage({
                  key: 'shop',
                  success(shop) {
                    console.log(shop.data)
                    console.log(pay.data)
                    self.setData({
                      shop: shop.data,
                      userinfo: res.data,
                      buy: pay.data
                    }, () => {
                      wx.hideLoading()
                      self.setData({
                        allok:true,
                      })
                    })
                  }
                })
              }
            })
          }
        })
      },
      fail: err => {
        this.onShow();
      },
      complete: () => {
        
        // ...
      }
    })
  },
  /* onShow(e) {
    var self = this
    wx.showLoading({
      mask:true,
      title: '加载中...',
    })
    
  }, */
  /* 备注 */
  beizu(e) {
    this.setData({
      beizu: e.detail.value
    })
  },
  PickerChange(e) {
    console.log(e);
    
    console.log(e.detail.value);
    var oldindex = this.data.oldindex
    console.log("old:"+oldindex);
    if (oldindex <= e.detail.value) {
      console.log("更新")
      this.setData({
        index: e.detail.value
      })
    } else {
      wx.showToast({
        icon: "none",
        title: '不在规定时间内',
      })
    }


  },
  /* 地址设置 */
  location(e) {
    wx.navigateTo({
      url: '../userlocation/userlocation?pay=' + true,
    })
  },
  testpay(e) {
    wx.showLoading({
      mask: true,
      title: '正在调起支付...',
    })
    var self = this
    var shopdayin = self.data.dayin
    var shop_id = self.data.shop._id //商铺编号
    var shopid = self.data.shop.shopid //商铺编号
    var shopname = self.data.shop.name //商铺名称
    var totalprice = parseFloat(self.data.buy.totalprice).toFixed(2)
    var aaaa = totalprice.split(".")
    var price = aaaa[0] + aaaa[1]
    var outTradeNo = shopid + 'A' + price + "F" + new Date().getTime() //商户订单号
    var userinfo = self.data.userinfo
    var buy = self.data.buy.buy //商品内容
    var totalnumber = self.data.buy.totalnumber //商品数量
    //商品价格
    if (self.data.index > 1) {
      var day = dayjs().add(1, 'day').format('YYYY-MM-DD')
    } else {
      var day = dayjs().format('YYYY-MM-DD')
    }
    var yuyue = self.data.picker[self.data.index] //预约情况
    var beizu = self.data.beizu //备注
    var xxlocation = userinfo.userlocation.location + '-' + userinfo.userlocation.sushehao + '-' + userinfo.userlocation.name + '-' + userinfo.userlocation.tell
    if (userinfo.userlocation.tell) {
      var dingdan = {
        go: 0, //出单情况  0待出  1已出单
        day: day, //下单所属日期，预约明天天数加一
        upday: dayjs().format('YYYY-MM-DD'), //下单日期
        uptime: dayjs().format('HH:mm:ss'), //下单时间
        outTradeNo: outTradeNo, //商户订单号
        school: userinfo.userlocation.school, //地址
        location: userinfo.userlocation.location, //地址
        sushehao: userinfo.userlocation.sushehao,
        name: userinfo.userlocation.name,
        tell: userinfo.userlocation.tell,
        shopid: shopid, //商家id
        shopname: shopname, //商家名字
        buy: buy, //商品
        yuyue: yuyue, //预约情况
        beizu: beizu, //备注
        totalnumber: totalnumber, //总件数
        totalprice: parseFloat(parseFloat(totalprice).toFixed(2)), //总价
      }

      db.collection('dindan').add({
        data: dingdan,
        success: function (res) {
          wx.cloud.callFunction({
            // 要调用的云函数名称
            name: 'goodsyuenumber',
            // 传递给云函数的event参数
            data: {
              shopid: shop_id,
              buy: buy
            }
          }).then(res => {
            /* util.test(shopdayin,dingdan,shopname) */
            console.log(res)
          }).catch(err => {
            console.log(err)
          })

          /* wx.cloud.callFunction({
            // 要调用的云函数名称
            name: 'goodsdaynumber',
            // 传递给云函数的event参数
            data: {
              shopid: shop_id,
              buy: buy
            }
          }).then(res => {
            
          }).catch(err => {
            console.log(err)
          }) */
          wx.hideLoading()
          wx.reLaunch({
            url: '../shangpu/shangpu?shop_id=' + shop_id,
          })

        },
        fail: console.error,
        complete: console.log
      })

    } else {
      wx.showToast({
        icon: "none",
        title: '请添加送餐地址',
      })
    }
    console.log(dingdan)
  },
  pay(e) {
    wx.showLoading({
      mask: true,
      title: '正在调起支付...',
    })
    var self = this
    var num = self.createNonceStr()
    var shopdayin = self.data.dayin
    var shop_id = self.data.shop._id //商铺编号
    var shopid = self.data.shop.shopid //商铺编号
    var shopname = self.data.shop.name //商铺名称
    var totalprice = parseFloat(self.data.buy.totalprice).toFixed(2) //商品价格
    var aaaa = totalprice.split(".")
    var price = aaaa[0] + aaaa[1]
    var timeStamp = new Date().getTime()
    var outTradeNo = shopid + 'A' + price + "F" + num //商户订单号
    console.log()
    var userinfo = self.data.userinfo
    var buy = self.data.buy.buy //商品内容
    var totalnumber = self.data.buy.totalnumber //商品数量
    if (self.data.index > 1) {
      var day = dayjs().add(1, 'day').format('YYYY-MM-DD')
    } else {
      var day = dayjs().format('YYYY-MM-DD')
    }
    var yuyue = self.data.picker[self.data.index] //预约情况
    var beizu = self.data.beizu //备注
    var xxlocation = userinfo.userlocation.location + '-' + userinfo.userlocation.sushehao + '-' + userinfo.userlocation.name + '-' + userinfo.userlocation.tell
    console.log(userinfo.userlocation.tell)
    console.log(xxlocation.length)
    if (userinfo.userlocation.tell) {
      var dingdan = {
        go: 0, //出单情况  0待出  1已出单
        day: day, //下单所属日期，预约明天天数加一
        upday: dayjs().format('YYYY-MM-DD'), //下单日期
        uptime: dayjs().format('HH:mm:ss'), //下单时间
        outTradeNo: outTradeNo, //商户订单号
        school: userinfo.userlocation.school, //地址
        location: userinfo.userlocation.location, //地址
        sushehao: userinfo.userlocation.sushehao,
        name: userinfo.userlocation.name,
        tell: userinfo.userlocation.tell,
        shopid: shopid, //商家id
        shopname: shopname, //商家名字
        buy: buy, //商品
        yuyue: yuyue, //预约情况
        beizu: beizu, //备注
        totalnumber: totalnumber, //总件数
        totalprice: parseFloat(parseFloat(totalprice).toFixed(2)), //总价
      }

      wx.cloud.callFunction({
        name: 'pay',
        data: {
          beizu: beizu,
          yuyue: yuyue,
          buy: buy,
          shangpuname: shopname,
          outTradeNo: outTradeNo,
          price: price,
        },
        success: res => {
          wx.hideLoading()
          console.log('获取支付参数成功：', res)
          const payment = res.result.payment
          console.log('获取支付参数成功：', payment)
          wx.requestPayment({
            ...payment,
            success(res) {
              console.log('支付成功：', res)
              db.collection('dindan').add({
                data: dingdan,
                success: function (res) {
                  wx.cloud.callFunction({
                    // 要调用的云函数名称
                    name: 'goodsyuenumber',
                    // 传递给云函数的event参数
                    data: {
                      shopid: shop_id,
                      buy: buy
                    }
                  }).then(res => {
                    wx.showToast({
                      title: '成功',
                      icon: 'success',
                      duration: 2000
                    })
                    setTimeout(() => {
                      wx.reLaunch({
                        url: '../shangpu/shangpu?shop_id=' + shop_id,
                      })
                    }, 1500)
                    wx.hideLoading()
                  }).catch(err => {
                    console.log(err)
                  })
                  /* util.test(shopdayin,dingdan,shopname) */
                },
                fail: console.error,
                complete: console.log
              })
            },
            fail(err) {
              console.error('支付失败：', err)
            }
          })
        },
        fail: res => {
          console.log('获取支付参数失败：' + res)
        },
      })

    } else {
      wx.hideLoading()
      wx.showToast({
        icon: "none",
        title: '请添加送餐地址',
      })
    }

  },
  newpay(e) {
    wx.showLoading({
      mask: true,
      title: '正在调起支付...',
    })
    var self = this
    var num = self.createNonceStr()
    var shopdayin = self.data.dayin
    var shop_id = self.data.shop._id //商铺编号
    var shopid = self.data.shop.shopid //商铺编号
    var shopname = self.data.shop.name //商铺名称
    var totalprice = parseFloat(self.data.buy.totalprice).toFixed(2) //商品价格
    var aaaa = totalprice.split(".")
    var price = aaaa[0] + aaaa[1]
    var timeStamp = new Date().getTime()
    var outTradeNo = "A"+timeStamp+ "F" + num //商户订单号
    console.log(outTradeNo)
    var userinfo = self.data.userinfo
    var buy = self.data.buy.buy //商品内容
    var totalnumber = self.data.buy.totalnumber //商品数量
    if (self.data.index > 1) {
      var day = dayjs().add(1, 'day').format('YYYY-MM-DD')
    } else {
      var day = dayjs().format('YYYY-MM-DD')
    }
    var yuyue = self.data.picker[self.data.index] //预约情况
    var beizu = self.data.beizu //备注
    var xxlocation = userinfo.userlocation.location + '-' + userinfo.userlocation.sushehao + '-' + userinfo.userlocation.name + '-' + userinfo.userlocation.tell
    console.log(userinfo.userlocation.tell)
    console.log(xxlocation.length)
    if (userinfo.userlocation.tell) {
      var dingdan = {
        _id: outTradeNo,
        go: 0, //出单情况  0待出  1已出单
        day: day, //下单所属日期，预约明天天数加一
        upday: dayjs().format('YYYY-MM-DD'), //下单日期
        uptime: dayjs().format('HH:mm:ss'), //下单时间
        outTradeNo: outTradeNo, //商户订单号
        location: userinfo.userlocation.location, //地址
        school: userinfo.userlocation.school, 
        sushehao: userinfo.userlocation.sushehao,
        name: userinfo.userlocation.name,
        tell: userinfo.userlocation.tell,
        shopid: shopid, //商家id
        shopname: shopname, //商家名字
        buy: buy, //商品
        yuyue: yuyue, //预约情况
        beizu: beizu, //备注
        totalnumber: totalnumber, //总件数
        totalprice: parseFloat(parseFloat(totalprice).toFixed(2)), //总价
      }
      db.collection('zdindan').add({
        data: dingdan,
        success: function (res) {
          wx.cloud.callFunction({
            name: 'newpay',
            data: {
              buy: buy,
              dingdan: dingdan,
              shangpuname: shopname,
              outTradeNo: outTradeNo,
              price: price,
            },
            success: res => {
              wx.hideLoading()
              console.log('获取支付参数成功：', res)
              const payment = res.result.payment
              console.log('获取支付参数成功：', payment)
              wx.requestPayment({
                ...payment,
                success(res) {
                  console.log('支付成功：', res)
                  db.collection('dindan').where({
                    _id: outTradeNo,
                  }).count().then(res => {
                    console.log(res.total)
                    if (res.total == 0) {
                      db.collection('dindan').add({
                        data: dingdan,
                        success: function (res) {
                          wx.cloud.callFunction({
                            // 要调用的云函数名称
                            name: 'goodsyuenumber',
                            // 传递给云函数的event参数
                            data: {
                              shopid: shop_id,
                              buy: buy
                            }
                          }).then(res => {
                            wx.showToast({
                              title: '成功',
                              icon: 'success',
                              duration: 2000
                            })
                            setTimeout(() => {
                              wx.reLaunch({
                                url: '../shangpu/shangpu?shop_id=' + shop_id,
                              })
                            }, 1500)
                            wx.hideLoading()
                          }).catch(err => {
                            console.log(err)
                          })
                          /* util.test(shopdayin,dingdan,shopname) */
                        },
                        fail: console.error,
                        complete: console.log
                      })
                    }
                  })

                },
                fail(err) {
                  db.collection('zdindan').doc(outTradeNo).remove()
                    .then(console.log)
                    .catch(console.error)
                  wx.hideLoading()
                  console.error('支付失败：', err)
                }
              })
            },
            fail: res => {
              db.collection('zdindan').doc(outTradeNo).remove()
                .then(console.log)
                .catch(console.error)
              wx.hideLoading()
              console.log('获取支付参数失败：' + res)
            },
          })
        },
        fail: res => {
          wx.hideLoading()
          console.log('获取支付参数失败：' + res)
        },
        complete: console.log
      })
    } else {
      wx.hideLoading()
      wx.showToast({
        icon: "none",
        title: '请添加送餐地址',
      })
    }

  },

  createNonceStr: function () {
    var str = "",
      range = 7, //min
      arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

    // 随机产生
    /* if (true) {
      range = Math.round(Math.random() * (36 - 20)) + 20;
    } */
    for (var i = 0; i < range; i++) {
      var pos = Math.round(Math.random() * (arr.length - 1));
      str += arr[pos];
    }
    return str;
  },

})