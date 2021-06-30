const app = getApp()
const db = wx.cloud.database()
const dayjs = require("./dayjs");
Page({
  data: {
    guigekouweiname: '',
    guigekouwei: [],
    guige: false,
    guigekouweiname2: '',
    guigekouwei2: [],
    guige2: false,
    dayxiaoliang: false,
    daynumber: 0,
    zhekou: false,
    zhekouprice: 0,
    tanchuangtabbar: true,
    cWidth: 0,
    cHeight: 0,
    addgoodsimg: '',
    /* --------------------- */
    shopyesno: true, //商铺是否营业
    shopyesnoing: true, //商铺是否营业

    /* ---------------------- */
    tabbar: true,
    /* --------------------- */
    addpickercaidanindex: 0,
    genguosetting: false, //更多设置
    settingcaidan: false, //菜单设置
    caitantanchuang: false, //菜单弹窗
    caitanindex: null, //菜单弹窗编号
    caitanname: null, //菜单弹窗名字
    goodstanchuang: false, //添加商品弹窗
    settinggoods: false, //商品设置弹窗
    goodsname: null, //设置商品的名字
    goodsprice: null, //设置商品的价格
    goodsimg: null, //设置商品的图片
    goodcaidan: null, //设置商品的菜单
    goodsid: null, //设置商品的编号
    goodsindex: null, //设置商品的本地排序
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    TabCur: 0,
    MainCur: 0,
    VerticalNavTop: 0,
    list: [],
    load: true
  },
  onLoad(options) {
    var shop_id = options.shopid
    /* shop_id='10000001' */
    var self = this
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    db.collection('shop').where({
      shopid: shop_id
    }).get().then(res => {
      self.setData({
        shop_id: res.data[0]._id,
        caidan: res.data[0].caidan,
        goods: res.data[0].goods,
        goprice: res.data[0].goprice,
        shopyesno: res.data[0].shopyesno,
        shopyesnoing: res.data[0].shopyesno,
        shopname: res.data[0].name,
        shopid: shop_id,
      }, () => {
        self.caidanxuanran(res.data[0].caidan)
      })
      console.log(res.data)
    })
  },
  /* 菜单渲染 */
  caidanxuanran(e) {
    var caidan = e
    let list = [{}];
    for (let i = 0; i < caidan.length; i++) {
      list[i] = {};
      list[i].name = caidan[i].name;
      list[i].id = i;
      list[i].myid = caidan[i].myid;
    }
    wx.hideLoading({})
    this.setData({
      list: list,
      listCur: list[0]
    })
  },
  onReady() {
    wx.hideLoading()
  },
  tabSelect(e) {
    var self = this
    var index = e.currentTarget.dataset.id
    var settingcaidan = self.data.settingcaidan
    if (!settingcaidan) {
      self.setData({
        TabCur: e.currentTarget.dataset.id,
        MainCur: e.currentTarget.dataset.id,
        VerticalNavTop: (e.currentTarget.dataset.id - 1) * 50
      })
    } else {
      self.setData({
        caitanindex: index,
        caitanname: this.data.caidan[index].name,
        caitantanchuang: true,
        tanchuangtabbar: false,
      })
    }
  },
  VerticalMain(e) {
    let that = this;
    let list = this.data.list;
    let tabHeight = 0;
    if (this.data.load) {
      for (let i = 0; i < list.length; i++) {
        let view = wx.createSelectorQuery().select("#main-" + list[i].id);
        view.fields({
          size: true
        }, data => {
          list[i].top = tabHeight;
          tabHeight = tabHeight + data.height;
          list[i].bottom = tabHeight;
        }).exec();
      }
      that.setData({
        load: false,
        list: list
      })
    }
    let scrollTop = e.detail.scrollTop + 20;
    for (let i = 0; i < list.length; i++) {
      if (scrollTop > list[i].top && scrollTop < list[i].bottom) {
        that.setData({
          VerticalNavTop: (list[i].id - 1) * 50,
          TabCur: list[i].id
        })
        return false
      }
    }
  },

  /* 个人 */
  tabbaruser(e) {
    wx.navigateTo({
      url: '../shangpu-dingdan/shangpu-dingdan?shopid=' + this.data.shopid,
    })
  },
  /* 菜单设置 */
  settingcaidan(e) {
    this.setData({
      settingcaidan: !this.data.settingcaidan
    })
  },
  /* 菜单弹窗关闭 */
  hidecaitantanchuang(e) {
    this.setData({
      tanchuangtabbar: true,
      caitantanchuang: false
    })
  },
  /* 添加菜单 */
  addcaidan(e) {
    var self = this
    wx.showLoading({
      title: '正在更新...',
      mask: true
    })
    var caidan = self.data.caidan
    var newcaidan = {
      name: "新建菜单",
      myid: (Math.floor(Math.random() * 1000000)).toString()
    }
    caidan.push(newcaidan)
    var shop_id = self.data.shop_id
    db.collection('shop').doc(shop_id).update({
      data: {
        caidan: caidan
      },
      success: function (res) {
        self.setData({
          caidan: caidan
        }, () => {
          self.caidanxuanran(caidan)
        })
      },
      fail: function (res) {
        wx.showModal({
          title: '提示',
          content: '数据更新失败请重新尝试',
          success(res) {
            if (res.confirm) {
              console.log('用户点击确定')
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }
    })
  },
  /* 菜单设置 */
  caidansetting(e) {
    var self = this
    var caidanname = e.detail.value.caidanname
    if (caidanname.length > 0) {
      wx.showLoading({
        title: '正在更新...',
        mask: true
      })
      var shop_id = self.data.shop_id
      var caidan = self.data.caidan
      var caitanindex = this.data.caitanindex
      caidan[caitanindex].name = caidanname
      db.collection('shop').doc(shop_id).update({
        data: {
          caidan: caidan
        },
        success: function (res) {
          self.setData({
            caidan: caidan,
            tanchuangtabbar: true,
            caitantanchuang: false
          }, () => {
            self.caidanxuanran(caidan)
          })
        },
        fail: function (res) {
          wx.showModal({
            title: '提示',
            content: '数据更新失败请重新尝试',
            success(res) {
              if (res.confirm) {
                console.log('用户点击确定')
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }
      })
    } else {
      wx.showToast({
        icon: "none",
        title: '请输入菜单名称',
      })
    }
  },
  /* 删除菜单 */
  dellcaidan(e) {
    var self = this
    var caitanindex = self.data.caitanindex
    var caidanid = self.data.caidan[caitanindex].myid
    var goods = self.data.goods
    for (var i = 0; i <= goods.length; i++) {
      if (i < goods.length) {
        if (goods[i].caidan == caidanid) {
          wx.showToast({
            title: '请先删除该菜单内菜品',
            icon: 'none',
            mask: true,
            duration: 2000
          })
          break;
        }
      }
      if (i == goods.length) {
        wx.showLoading({
          title: '正在更新...',
          mask: true
        })
        var shop_id = self.data.shop_id
        var caidan = self.data.caidan
        caidan.splice(parseInt(caitanindex), 1);
        db.collection('shop').doc(shop_id).update({
          data: {
            caidan: caidan
          },
          success: function (res) {
            self.setData({
              caidan: caidan,
              tanchuangtabbar: true,
              caitantanchuang: false
            }, () => {
              self.caidanxuanran(caidan)
            })
          },
          fail: function (res) {
            wx.showModal({
              title: '提示',
              content: '数据更新失败请重新尝试',
              success(res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                } else if (res.cancel) {
                  console.log('用户点击取消')
                }
              }
            })
          }
        })
      }
    }
  },

  /* 添加商品弹窗 */
  settingoodstanchuang(e) {
    this.setData({
      tanchuangtabbar: false,
      goodstanchuang: true
    })
  },
  /* 添加商品弹窗关闭 */
  hidegoodstanchuang(e) {
    this.setData({
      tanchuangtabbar: true,
      goodstanchuang: false
    })
  },
  /* 添加商品 */
  addgoods(e) {
    var self = this
    if (e.detail.value.goodsname.length > 0 && e.detail.value.goodsprice.length > 0) {
      wx.showLoading({
        title: '正在更新...',
        mask: true
      })
      var num = self.createNonceStr()
      var shopname = self.data.shopname
      var shop_id = self.data.shop_id
      var shopid = self.data.shopid
      var goods = self.data.goods
      var addgoodsimg = self.data.addgoodsimg
      wx.cloud.uploadFile({
        cloudPath: '商品图片/' + shopname + '/' + e.detail.value.goodsname + '_' + num + '.jpg',
        filePath: addgoodsimg,
        success: res => {
          var newgoods = {
            "id": num,
            "img": res.fileID,
            "name": e.detail.value.goodsname,
            "price": e.detail.value.goodsprice,
            "nowprice": e.detail.value.goodsprice,
            "zhekou": false,
            "zhekouprice": 0,
            "dayxiaoliang": false,
            "daynumber": 0,
            "yuenumber": 0,
            "guigekouwei2": [],
            "guige2": false,
            "guigekouwei": [],
            "guige": false,
            "shangpu": shopname,
            "shopid": shopid,
            "caidan": self.data.caidan[self.data.addpickercaidanindex].myid,
            "number": 0
          }
          goods.push(newgoods)
          const _ = db.command
          db.collection('shop').doc(shop_id).update({
            data: {
              goods: _.push(newgoods)
            },
            success: function (res) {
              console.log(res)
              self.setData({
                addgoodsimg: '',
                tanchuangtabbar: true,
                goodstanchuang: false,
                goods: goods
              }, () => {
                wx.hideLoading()
              })
            },
            fail: function (res) {
              wx.showModal({
                title: '提示',
                content: '数据更新失败请重新尝试',
                success(res) {
                  if (res.confirm) {
                    console.log('用户点击确定')
                  } else if (res.cancel) {
                    console.log('用户点击取消')
                  }
                }
              })
            }
          })
        },
        fail: err => {
          wx.showToast({
            icon: "none",
            title: '图片上传失败,请重新尝试',
          })
        }
      })
    } else {
      wx.showToast({
        icon: "none",
        title: '请填入菜品名称和价格',
      })
    }
  },

  /* 商品弹窗 */
  settinggoods(e) {
    var self = this
    var caidan = self.data.caidan
    var goodsindex = e.currentTarget.id
    var goodsid = self.data.goods[e.currentTarget.id].id
    var goodsname = self.data.goods[e.currentTarget.id].name
    var goodsprice = self.data.goods[e.currentTarget.id].price
    var goodsimg = self.data.goods[e.currentTarget.id].img
    var goodcaidan = self.data.goods[e.currentTarget.id].caidan
    for (var i = 0; i < caidan.length; i++) {
      if (goodcaidan == caidan[i].myid) {
        var pickercaidanindex = i
      }
    }
    console.log(pickercaidanindex)
    self.setData({
      guigekouweiname: '',
      guigekouweiname2: '',
      nowbuy: self.data.goods[e.currentTarget.id].nowbuy,
      guige: self.data.goods[e.currentTarget.id].guige,
      guigekouwei: self.data.goods[e.currentTarget.id].guigekouwei,
      guige2: self.data.goods[e.currentTarget.id].guige2,
      guigekouwei2: self.data.goods[e.currentTarget.id].guigekouwei2,
      zhekou: self.data.goods[e.currentTarget.id].zhekou,
      zhekouprice: self.data.goods[e.currentTarget.id].zhekouprice,
      dayxiaoliang: self.data.goods[e.currentTarget.id].dayxiaoliang,
      daynumber: self.data.goods[e.currentTarget.id].daynumber,
      addgoodsimg: goodsimg,
      goodsindex: goodsindex,
      goodsid: goodsid,
      pickercaidanindex: pickercaidanindex,
      goodsname: goodsname,
      goodsprice: goodsprice,
      goodsimg: goodsimg,
      goodcaidan: goodcaidan,
      tanchuangtabbar: false,
      settinggoods: true
    })
  },
  /* 商品设置-菜单选择 */
  PickerChange(e) {
    console.log(e);
    this.setData({
      pickercaidanindex: e.detail.value
    })
  },
  /* 添加商品设置-菜单选择 */
  addPickerChange(e) {
    console.log(e);
    this.setData({
      addpickercaidanindex: e.detail.value
    })
  },
  /* 商品弹窗关闭 */
  hidesettinggoods(e) {
    this.setData({
      tanchuangtabbar: true,
      settinggoods: false
    })
  },
  /* 商品信息保存 */
  settinggoodsok(e) {
    console.log(e)
    var self = this
    var shop_id = self.data.shop_id
    var goods = self.data.goods
    var addgoodsimg = self.data.addgoodsimg
    var goodsid = self.data.goodsid
    var shopname = self.data.shopname
    var goodsimg = self.data.goodsimg
    var goodsname = e.detail.value.goodsname
    var goodsprice = e.detail.value.goodsprice
    var nowbuy = self.data.nowbuy
    var zhekou = self.data.zhekou

    var daynumber = self.data.daynumber
    var dayxiaoliang = self.data.dayxiaoliang

    var guige = self.data.guige
    var guigekouwei = self.data.guigekouwei

    var guige2 = self.data.guige2
    var guigekouwei2 = self.data.guigekouwei2

    var goodcaidan = self.data.caidan[self.data.pickercaidanindex].myid
    var goodsindex = self.data.goodsindex
    if (!zhekou || (zhekou && e.detail.value.zhekouprice > 0)) {
      if (!guige2 || (guige2 && guigekouwei2.length > 0)) {
        if (!guige || (guige && guigekouwei.length > 0)) {
          if (goodsname.length > 0 && goodsprice.length > 0) {
            wx.showLoading({
              title: '正在更新...',
              mask: true
            })
            if (addgoodsimg.indexOf('cloud') == 0) {
              goods[goodsindex].name = goodsname
              goods[goodsindex].price = goodsprice
              goods[goodsindex].caidan = goodcaidan

              goods[goodsindex].zhekou = zhekou
              if (zhekou) {
                var goodsnowprice = zhekouprice
                var zhekouprice = e.detail.value.zhekouprice
                var goodszhekouprice = zhekouprice
                goods[goodsindex].nowprice = zhekouprice
                goods[goodsindex].zhekouprice = zhekouprice
              } else {
                var goodsnowprice = goodsprice
                goods[goodsindex].nowprice = goodsprice
              }

              /* goods[goodsindex].dayxiaoliang = dayxiaoliang
              if (dayxiaoliang) {
                var daynumber = parseInt(e.detail.value.daynumber)
                var goodsdaynumber = daynumber
                goods[goodsindex].daynumber = daynumber
              } else {
                var goodsdaynumber = 9999
              } */

              goods[goodsindex].guige = guige
              if (guige) {
                goods[goodsindex].guigekouwei = guigekouwei
              }

              var newgoodsguige = 'goods[' + goodsindex + '].guige'
              var newgoodsguigekouwei = 'goods[' + goodsindex + '].guigekouwei'

              goods[goodsindex].guige2 = guige2
              if (guige2) {
                goods[goodsindex].guigekouwei2 = guigekouwei2
              }

              var newgoodsguige2 = 'goods[' + goodsindex + '].guige2'
              var newgoodsguigekouwei2 = 'goods[' + goodsindex + '].guigekouwei2'

              var newgoodsnowprice = 'goods[' + goodsindex + '].nowprice'
              var newgoodszhekouprice = 'goods[' + goodsindex + '].zhekouprice'
              var newgoodszhekou = 'goods[' + goodsindex + '].zhekou'

              var newgoodsname = 'goods[' + goodsindex + '].name'
              var newgoodsprice = 'goods[' + goodsindex + '].price'
              var newgoodcaidan = 'goods[' + goodsindex + '].caidan'
              goods[goodsindex].nowbuy = nowbuy
              var newnowbuy = 'goods[' + goodsindex + '].nowbuy'

              db.collection('shop').doc(shop_id).update({
                data: {
                  goods: goods
                },
                success: function (res) {
                  self.setData({
                    [newnowbuy]: nowbuy,
                    [newgoodsguige]: guige,
                    [newgoodsguigekouwei]: guigekouwei,

                    [newgoodsguige2]: guige2,
                    [newgoodsguigekouwei2]: guigekouwei2,

                    [newgoodsnowprice]: goodsnowprice,
                    [newgoodszhekouprice]: goodszhekouprice,
                    [newgoodszhekou]: zhekou,
                    [newgoodsname]: goodsname,
                    [newgoodsprice]: goodsprice,
                    [newgoodcaidan]: goodcaidan,
                    tanchuangtabbar: true,
                    settinggoods: false,
                    addgoodsimg: ''
                  }, () => {
                    wx.hideLoading()
                  })
                },
                fail: function (res) {
                  wx.showModal({
                    title: '提示',
                    content: '数据更新失败请重新尝试',
                    success(res) {
                      if (res.confirm) {
                        console.log('用户点击确定')
                      } else if (res.cancel) {
                        console.log('用户点击取消')
                      }
                    }
                  })
                }
              })
            } else {
              wx.cloud.uploadFile({
                cloudPath: '商品图片/' + shopname + '/' + goodsname + '_' + goodsid + "_" + parseInt(Math.random() * 100000) + '.jpg',
                filePath: addgoodsimg,
                success: imgres => {
                  goods[goodsindex].img = imgres.fileID
                  goods[goodsindex].name = goodsname
                  goods[goodsindex].price = goodsprice
                  goods[goodsindex].caidan = goodcaidan
                  var newgoodsimg = 'goods[' + goodsindex + '].img'
                  var newgoodsname = 'goods[' + goodsindex + '].name'
                  var newgoodsprice = 'goods[' + goodsindex + '].price'
                  var newgoodcaidan = 'goods[' + goodsindex + '].caidan'

                  goods[goodsindex].zhekou = zhekou
                  if (zhekou) {

                    var goodsnowprice = zhekouprice
                    var zhekouprice = e.detail.value.zhekouprice
                    var goodszhekouprice = zhekouprice
                    goods[goodsindex].nowprice = zhekouprice
                    goods[goodsindex].zhekouprice = zhekouprice
                  } else {
                    var goodsnowprice = goodsprice
                    goods[goodsindex].nowprice = goodsprice
                  }

                  /* goods[goodsindex].dayxiaoliang = dayxiaoliang
                  if (dayxiaoliang) {
                    var daynumber = parseInt(e.detail.value.daynumber)
                    var goodsdaynumber = daynumber
                    goods[goodsindex].daynumber = daynumber
                  } else {
                    var goodsdaynumber = 9999
                  } */

                  goods[goodsindex].guige = guige
                  if (guige) {
                    goods[goodsindex].guigekouwei = guigekouwei
                  }

                  var newgoodsguige = 'goods[' + goodsindex + '].guige'
                  var newgoodsguigekouwei = 'goods[' + goodsindex + '].guigekouwei'


                  goods[goodsindex].guige2 = guige2
                  if (guige2) {
                    goods[goodsindex].guigekouwei2 = guigekouwei2
                  }

                  var newgoodsguige2 = 'goods[' + goodsindex + '].guige2'
                  var newgoodsguigekouwei2 = 'goods[' + goodsindex + '].guigekouwei2'
                  /* var newgoodsdayxiaoliang = 'goods[' + goodsindex + '].dayxiaoliang'
                  var newgoodsdaynumber = 'goods[' + goodsindex + '].daynumber'
 */
                  var newgoodsnowprice = 'goods[' + goodsindex + '].nowprice'
                  var newgoodszhekouprice = 'goods[' + goodsindex + '].zhekouprice'
                  var newgoodszhekou = 'goods[' + goodsindex + '].zhekou'

                  goods[goodsindex].nowbuy = nowbuy
                  var newnowbuy = 'goods[' + goodsindex + '].nowbuy'

                  db.collection('shop').doc(shop_id).update({
                    data: {
                      goods: goods
                    },
                    success: function (res) {
                      self.setData({
                        [newnowbuy]: nowbuy,
                        [newgoodsguige]: guige,
                        [newgoodsguigekouwei]: guigekouwei,
                        [newgoodsguige2]: guige2,
                        [newgoodsguigekouwei2]: guigekouwei2,
                        /* [newgoodsdayxiaoliang]: dayxiaoliang,
                        [newgoodsdaynumber]: goodsdaynumber, */
                        [newgoodsnowprice]: goodsnowprice,
                        [newgoodszhekouprice]: goodszhekouprice,
                        [newgoodszhekou]: zhekou,
                        [newgoodsimg]: imgres.fileID,
                        [newgoodsname]: goodsname,
                        [newgoodsprice]: goodsprice,
                        [newgoodcaidan]: goodcaidan,
                        tanchuangtabbar: true,
                        settinggoods: false,
                        addgoodsimg: ''
                      }, () => {
                        wx.hideLoading()
                      })
                    },
                    fail: function (res) {
                      wx.showModal({
                        title: '提示',
                        content: '数据更新失败请重新尝试',
                        success(res) {
                          if (res.confirm) {
                            console.log('用户点击确定')
                          } else if (res.cancel) {
                            console.log('用户点击取消')
                          }
                        }
                      })
                    }
                  })
                },
                fail: function (res) {
                  wx.hideLoading()
                  wx.showToast({
                    icon: "none",
                    title: '图片上传失败...',
                    duration: 2000
                  })
                }
              })
            }
          } else {
            wx.showToast({
              icon: "none",
              title: '请输入菜单名字和价格',
            })
          }
        } else {
          wx.showToast({
            icon: "none",
            title: '请添加口味标签',
          })
        }
      } else {
        wx.showToast({
          icon: "none",
          title: '请添加口味标签2',
        })
      }
    } else {
      wx.showToast({
        icon: "none",
        title: '请输入打折后价格',
      })
    }
  },
  /* 删除菜品 */
  dellgoods(e) {
    var self = this
    var goodsid = self.data.goodsid
    var goodsindex = self.data.goodsindex
    console.log(goodsid)
    console.log(goodsindex)
    var goods = self.data.goods
    wx.showModal({
      title: '提示',
      content: '确定删除该菜品？',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '正在更新...',
            mask: true
          })
          var shop_id = self.data.shop_id
          goods.splice(goodsindex, 1)
          db.collection('shop').doc(shop_id).update({
            data: {
              goods: goods
            },
            success: function (res) {
              self.setData({
                tanchuangtabbar: true,
                settinggoods: false,
                goods: goods
              }, () => {
                wx.hideLoading()
              })
            },
            fail: function (res) {
              wx.showModal({
                title: '提示',
                content: '数据更新失败请重新尝试',
                success(res) {
                  if (res.confirm) {
                    console.log('用户点击确定')
                  } else if (res.cancel) {
                    console.log('用户点击取消')
                  }
                }
              })
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  /* 更多设置 */
  /* 添加商品弹窗 */
  genguosetting(e) {
    this.setData({
      shopyesnoing: this.data.shopyesno,
      genguosetting: true
    })
  },
  /* 添加商品弹窗关闭 */
  hidegenguosetting(e) {
    this.setData({
      genguosetting: false
    })
  },
  /* 商铺是否营业 */
  shopyesno(e) {
    var self = this
    var shopyesno = self.data.shopyesnoing
    if (shopyesno) {
      wx.showModal({
        title: '提示',
        content: '您将停止商铺营业',
        success(res) {
          if (res.confirm) {
            shopyesno = false
            self.setData({
              shopyesnoing: false
            })
          } else if (res.cancel) {}
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '您将开始商铺营业',
        success(res) {
          if (res.confirm) {
            shopyesno = true
            self.setData({
              shopyesnoing: true
            })
          } else if (res.cancel) {}
        }
      })
    }
  },
  gengduosetting(e) {
    var self = this
    if (e.detail.value.goprice.length > 0) {
      wx.showLoading({
        title: '正在更新...',
        mask: true
      })
      var shop_id = self.data.shop_id
      db.collection('shop').doc(shop_id).update({
        data: {
          goprice: e.detail.value.goprice,
          shopyesno: self.data.shopyesnoing
        },
        success: function (res) {
          self.setData({
            goprice: e.detail.value.goprice,
            shopyesno: self.data.shopyesnoing,
            genguosetting: false
          }, () => {
            wx.hideLoading()
          })
        },
        fail: function (res) {
          wx.showModal({
            title: '提示',
            content: '数据更新失败请重新尝试',
            success(res) {
              if (res.confirm) {
                console.log('用户点击确定')
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }
      })
    } else {
      wx.showToast({
        icon: "none",
        title: '请输入起送价',
      })
    }

  },
  /* 选择图片 */
  chooseImage: function (e) {
    var that = this
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 指定只能为压缩图，首先进行一次默认压缩
      sourceType: ['album'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (photo) {
        console.log(photo.tempFiles[0].size)
        wx.showLoading({
          mask: true,
          title: '图片读取中...',
        })
        if (photo.tempFiles[0].size < 1048576 && photo.tempFiles[0].size > 40960) {
          //-----返回选定照片的本地文件路径列表，获取照片信息-----------
          wx.getImageInfo({
            src: photo.tempFilePaths[0],
            success: function (res) {
              //---------利用canvas压缩图片--------------
              var ratio = 2;
              var canvasWidth = res.width //图片原始长宽
              var canvasHeight = res.height
              while (canvasWidth > 200 || canvasHeight > 200) { // 保证宽高在400以内
                canvasWidth = Math.trunc(res.width / ratio)
                canvasHeight = Math.trunc(res.height / ratio)
                ratio++;
              }
              that.setData({
                cWidth: canvasWidth,
                cHeight: canvasHeight
              })

              //----------绘制图形并取出图片路径--------------
              var ctx = wx.createCanvasContext('canvas')
              ctx.drawImage(res.path, 0, 0, canvasWidth, canvasHeight)
              ctx.draw(false, setTimeout(function () {
                wx.canvasToTempFilePath({
                  canvasId: 'canvas',
                  destWidth: canvasWidth,
                  destHeight: canvasHeight,
                  success: function (res) {
                    that.setData({
                      addgoodsimg: res.tempFilePath
                    })
                    wx.hideLoading()
                  },
                  fail: function (res) {
                    console.log(res.errMsg)
                  }
                })
              }, 100)) //留一定的时间绘制canvas

            },
            fail: function (res) {
              wx.hideLoading()
              wx.showToast({
                icon: "none",
                title: '图片读取失败',
              })
              console.log(res.errMsg)
            },
          })
        } else {
          if (photo.tempFiles[0].size < 40960) {
            wx.hideLoading()
            that.setData({
              addgoodsimg: photo.tempFilePaths[0]
            })
          } else {
            wx.hideLoading()
            wx.showToast({
              icon: "none",
              title: '请上传图片大小在1M内',
            })
          }

        }
      }
    })
  },
  //商品折扣开关
  zhekou(e) {
    this.setData({
      zhekou: !this.data.zhekou
    })
  },
  //商品规格开关
  guige(e) {
    this.setData({
      guige: !this.data.guige
    })
  },
  //商品规格-口味名称输入
  guigekouweiname(e) {
    this.setData({
      guigekouweiname: e.detail.value
    })
  },
  //商品规格-口味添加
  addguigekouwei(e) {
    var self = this
    var guigekouweiname = self.data.guigekouweiname
    if (guigekouweiname.length > 0) {
      var guigekouwei = self.data.guigekouwei
      guigekouwei.push(guigekouweiname)
      self.setData({
        guigekouwei: guigekouwei,
        guigekouweiname: ''
      })
    } else {
      wx.showToast({
        icon: "none",
        title: '请输入标签名称',
      })
    }
  },
  //商品规格-口味删除
  dellkouwei(e) {
    console.log(e.currentTarget.id)
    var self = this
    var guigekouwei = self.data.guigekouwei
    wx.showModal({
      title: '提示',
      content: '确定删除' + guigekouwei[e.currentTarget.id] + '标签？',
      success(res) {
        if (res.confirm) {
          guigekouwei.splice(e.currentTarget.id, 1)
          self.setData({
            guigekouwei: guigekouwei
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },


  //商品规格开关2
  guige2(e) {
    this.setData({
      guige2: !this.data.guige2
    })
  },
  //商品规格-口味名称输入2
  guigekouweiname2(e) {
    this.setData({
      guigekouweiname2: e.detail.value
    })
  },
  //商品规格-口味添加2
  addguigekouwei2(e) {
    var self = this
    var guigekouweiname = self.data.guigekouweiname2
    if (guigekouweiname.length > 0) {
      var guigekouwei = self.data.guigekouwei2
      guigekouwei.push(guigekouweiname)
      self.setData({
        guigekouwei2: guigekouwei,
        guigekouweiname2: ''
      })
    } else {
      wx.showToast({
        icon: "none",
        title: '请输入标签名称',
      })
    }
  },
  //商品规格-口味删除
  dellkouwei2(e) {
    console.log(e.currentTarget.id)
    var self = this
    var guigekouwei = self.data.guigekouwei2
    wx.showModal({
      title: '提示',
      content: '确定删除' + guigekouwei[e.currentTarget.id] + '标签？',
      success(res) {
        if (res.confirm) {
          guigekouwei.splice(e.currentTarget.id, 1)
          self.setData({
            guigekouwei2: guigekouwei
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  //商品暂停销售开关
  nowbuy(e) {
    this.setData({
      nowbuy: !this.data.nowbuy
    })
  },
  //生成随机数
  createNonceStr: function () {
    var str = "",
      range = 9, //min
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

  //限制输入数字价格
  numberprice: function (e) {
    let price = e.detail.value;
    if (price.indexOf('.') == 0) {
      price = '0.'
    }
    price = price.replace(/[^\d.]/g, ""); //清除“数字”和“.”以外的字符
    price = price.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的
    price = price.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
    price = price.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3'); //只能输入两个小数
    if (price.indexOf(".") < 0 && price != "") { //以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额
      price = parseFloat(price);
    }
    return {
      value: price
    }
  }
})