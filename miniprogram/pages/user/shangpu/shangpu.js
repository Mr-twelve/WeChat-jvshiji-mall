const app = getApp()
const db = wx.cloud.database()
const dayjs = require("./dayjs");
Page({
  data: {
    weihu: false,
    guige: false,
    guigeindex: '0',
    guigeindex2: '0',
    shopyesno: true,
    mydingdan: [], //订单
    mydindantotal: 0,
    skip: 0, //订单跳过前几条
    newuser: true,
    /* --------------------- */
    buy: [], //购物车
    totalprice: 0,
    totalnumber: 0,
    /* ---------------------- */
    tabbar: true,
    havelocation: false,
    /* --------------------- */
    modalName: false, //购物车弹出
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    TabCur: 0,
    MainCur: 0,
    VerticalNavTop: 0,
    list: [],
    load: true
  },
  onLoad(option) {
    console.log(option)
    var shop_id = option.shop_id

    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    var self = this

    db.collection('shop').doc(shop_id).get().then(res => {
      wx.setStorage({
        key: "shop",
        data: res.data
      })
      self.setData({
        shop_id: shop_id,
        caidan: res.data.caidan,
        goods: res.data.goods,
        goprice: res.data.goprice * 1,
        shopyesno: res.data.shopyesno,
        shopyesnoing: res.data.shopyesno,
        shopname: res.data.name,
        shopid: res.data.shopid,
      }, () => {
        var nowtime = dayjs().format('HH:mm')
        /* if (nowtime >= "23:50" && nowtime <= "23:59") {
          self.setData({
            weihu: true,
            shopyesno: false,
          })
        } */
        // 调用云函数获取用户openid
        wx.cloud.callFunction({
          name: 'login',
          data: {},
          success: loginres => {
            console.log('[云函数] [login] user openid: ', loginres.result.openid)
            app.globalData.openid = loginres.result.openid
            db.collection('userinfo').where({
              _openid: loginres.result.openid
            }).get().then(userinfores => {
              if (userinfores.data.length > 0) {
                wx.setStorage({
                  key: "userinfo",
                  data: userinfores.data[0]
                })
                self.setData({
                  newuser: false,
                  username: userinfores.data[0].username,
                  usertximg: userinfores.data[0].usertximg,
                  userlocation: userinfores.data[0].userlocation,
                  havelocation: userinfores.data[0].havelocation
                }, () => {
                  self.onShow()
                  self.caidanxuanran(res.data.caidan)
                })
              } else {
                self.caidanxuanran(res.data.caidan)
              }
            })
          },
          fail: err => {
            console.error('[云函数] [login] 调用失败', err)
          }
        })
      })
      console.log(res.data)
    })

  },
  onShow(e) {
    var self = this
    var skip = self.data.skip
    if(!self.data.newuser){
      db.collection('dindan').where({
        _openid: app.globalData.openid
      }).count().then(totalres => {
        if (totalres.total > 20) {
          skip = totalres.total - 20
        }
        db.collection('dindan')
          .where({
            _openid: app.globalData.openid
          })
          .skip(skip)
          .limit(20)
          .get()
          .then(res => {
            self.setData({
              mydindantotal: totalres.total,
              mydingdan: res.data.reverse()
            })
            wx.hideNavigationBarLoading()
            wx.stopPullDownRefresh()
            console.log(res.data)
          })
          .catch(err => {
            wx.hideNavigationBarLoading()
            wx.stopPullDownRefresh()
            console.error(err)
          })
      })
    }
    

    wx.hideHomeButton();
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
    this.setData({
      list: list,
      listCur: list[0]
    }, () => {
      wx.hideLoading()
    })
  },
  onReady() {

  },
  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      MainCur: e.currentTarget.dataset.id,
      VerticalNavTop: (e.currentTarget.dataset.id - 1) * 50
    })
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
  /* 第一次添加购物车 */
  oneaddgoods(e) {
    var self = this
    var newuser = self.data.newuser
    if (newuser) {
      wx.showToast({
        title: '成功',
        icon: 'success',
        duration: 1000
      })
    } else {
      var index = e.currentTarget.id
      var goodsnumber = self.data.goods[index].number
      var goodsdata = "goods[" + index + "].number"
      var buy = this.data.buy
      var goods = {
        guige: false,
        id: self.data.goods[index].id,
        img: self.data.goods[index].img,
        name: self.data.goods[index].name,
        price: self.data.goods[index].price,
        zhekou: self.data.goods[index].zhekou,
        zhekouprice: self.data.goods[index].zhekouprice,
        nowprice: self.data.goods[index].nowprice,
        shangpu: self.data.goods[index].shangpu, //所属商铺
        shopid: self.data.goods[index].shopid,
        number: 1, //用户购物车数量
        index: index, //在goods列表里的index
      }
      buy.push(goods)
      self.setData({
        buy: buy,
        [goodsdata]: goodsnumber + 1
      }, () => {
        self.buy(buy)
      })
    }
  },
  /* 购物车+1 */
  addgoods(e) {
    var self = this
    var index = e.currentTarget.id
    var goodsnumber = self.data.goods[index].number
    var buy = self.data.buy

    if (!self.data.goods[index].guige) {
      for (var i = 0; i < buy.length; i++) {
        if (buy[i].id == self.data.goods[index].id) {
          buy[i].number++;
        }
      }
      var goodsdata = "goods[" + index + "].number"
      self.setData({
        buy: buy,
        [goodsdata]: goodsnumber + 1
      }, () => {
        self.buy(buy)
      })
    } else {

    }


  },
  /* 购物车-1 */
  reducenumber(e) {
    var self = this
    var index = e.currentTarget.id
    var goodsnumber = self.data.goods[index].number
    var goodsdata = 'goods[' + index + '].number'
    var buy = self.data.buy
    for (var i = 0; i < buy.length; i++) {
      if (buy[i].id == self.data.goods[index].id) {
        if (buy[i].number == 1) {
          buy.splice(i, 1)
        } else {
          buy[i].number--;
          break;
        }
      }
    }
    if (goodsnumber > 0) {
      console.log(buy)
      self.setData({
        buy: buy,
        [goodsdata]: goodsnumber - 1
      }, () => {
        self.buy(buy)
      })

    }
  },
  /* 购物车规格+1 */
  guigeaddgoods(e) {
    var self = this
    var index = e.currentTarget.id
    var goods = self.data.goods
    var buy = self.data.buy
    for (var i = 0; i < goods.length; i++) {
      if (buy[index].id == goods[i].id) {
        var goodsnumber = goods[i].number
        var goodsdata = "goods[" + i + "].number"
        break;
      }
    }
    buy[index].number++;
    self.setData({
      buy: buy,
      [goodsdata]: goodsnumber + 1
    }, () => {
      self.buy(buy)
    })
  },
  /* 购物车规格-1 */
  guigereducenumber(e) {
    var self = this
    var index = e.currentTarget.id
    var goods = self.data.goods
    var buy = self.data.buy
    for (var i = 0; i < goods.length; i++) {
      if (buy[index].id == goods[i].id) {
        var goodsnumber = self.data.goods[i].number
        var goodsdata = 'goods[' + i + '].number'
        if (buy[index].number == 1) {
          buy.splice(index, 1)
          break;
        } else {
          buy[index].number--;
          break;
        }
      }
    }
    if (goodsnumber > 0) {
      console.log(buy)
      self.setData({
        buy: buy,
        [goodsdata]: goodsnumber - 1
      }, () => {
        self.buy(buy)
      })
    }
  },

  buy(buy) {
    var totalprice = 0
    var totalnumber = 0
    for (var i = 0; i < buy.length; i++) {
      if(buy[i].zhekou){
        totalprice = totalprice + buy[i].number * buy[i].zhekouprice
      }else{
        totalprice = totalprice + buy[i].number * buy[i].nowprice
      }
      
      totalnumber = totalnumber + buy[i].number
    }
    if (totalnumber == 0) {
      this.setData({
        modalName: false
      })
    }
    this.setData({
      totalprice: totalprice.toFixed(2),
      totalnumber: totalnumber,
    })
  },
  /* 购物车弹出 */
  showModal(e) {
    if (this.data.buy.length != 0) {
      this.setData({
        modalName: !this.data.modalName
      })
    }
  },
  hideModal(e) {
    this.setData({
      modalName: false
    })
  },
  /* 商铺 */
  tabbarshop(e) {
    this.setData({
      tabbar: true
    })
  },
  /* 个人 */
  tabbaruser(e) {
    this.setData({
      tabbar: false
    })
  },
  /* 地址设置 */
  userlocation(e) {
    var shop_id=this.data.shop_id
    console.log(shop_id)
    wx.navigateTo({
      url: '../userlocation/userlocation?shop_id='+shop_id,
    })
  },
  /* 跳转支付 */
  pay(e) {
    var self = this
    var buy = self.data.buy
    wx.setStorage({
      key: "pay",
      data: {
        buy: buy,
        totalnumber: self.data.totalnumber,
        totalprice: self.data.totalprice,
      }
    })
    wx.navigateTo({
      url: '../pay/pay',
    })
  },
  /* 用户授权 */
  onGetUserInfo: function (e) {
    console.log(e)
    var self = this
    var openid = app.globalData.openid
    if (self.data.newuser && e.detail.userInfo) {
      wx.showLoading({
        mask: 'none',
        title: '用户信息建立中...',
      })
      db.collection('userinfo').add({
        // data 字段表示需新增的 JSON 数据
        data: {
          username: e.detail.userInfo.nickName,
          usertximg: e.detail.userInfo.avatarUrl,
          userlocation: {},
          havelocation: false
        },
        success: function (res) {
          wx.setStorage({
            key: "userinfo",
            data: {
              _id: res._id,
              _openid: openid,
              username: e.detail.userInfo.nickName,
              usertximg: e.detail.userInfo.avatarUrl,
              userlocation: {},
              havelocation: false
            }
          })
          self.setData({
            newuser: false,
            username: e.detail.userInfo.nickName,
            usertximg: e.detail.userInfo.avatarUrl,
            userlocation: {},
            havelocation: false
          })
          console.log(res)
        },
        fail: console.error,
        complete: function (res) {
          wx.hideLoading()
        },
      })
    }
  },
  /* 下拉刷新 */
  onPullDownRefresh: function () {
    if (!this.data.tabbar) {
      wx.showNavigationBarLoading()
      this.onShow()
    } else {
      wx.hideNavigationBarLoading()
      wx.stopPullDownRefresh()
    }
  },
  /* 选规格弹窗开启 */
  xuanguige(e) {
    var self = this
    var index = e.currentTarget.id
    var goodsname = self.data.goods[index].name
    var goodsguigekouwei = self.data.goods[index].guigekouwei
    var goodsguigekouwei2=self.data.goods[index].guigekouwei2
    self.setData({
      xuanguigegoodsindex: index,
      goodsname: goodsname,
      goodsguigekouwei: goodsguigekouwei,
      goodsguige2:self.data.goods[index].guige2,
      goodsguigekouwei2:goodsguigekouwei2,
      guige: true
    })
  },
  /* 选规格弹窗隐藏 */
  hidexuanguige(e) {
    var self = this
    self.setData({
      guige: false
    })
  },
  /* 选规格-口味 */
  guigekouwei(e) {
    this.setData({
      guigeindex: e.currentTarget.id
    })
  },
  guigekouwei2(e) {
    this.setData({
      guigeindex2: e.currentTarget.id
    })
  },
  /* 选规格加购物车 */
  guigeoneaddgoods(e) {
    var self = this
    var index = self.data.xuanguigegoodsindex
    var goodsnumber = self.data.goods[index].number
    var goodsdata = "goods[" + index + "].number"
    var buy = this.data.buy
    if(self.data.goodsguige2){
      var name= self.data.goods[index].name + "(" + self.data.goodsguigekouwei[self.data.guigeindex] + ")"+ "(" + self.data.goodsguigekouwei2[self.data.guigeindex2] + ")"
    }else{
      var name= self.data.goods[index].name + "(" + self.data.goodsguigekouwei[self.data.guigeindex] + ")"
    }
    
    var goods = {
      guige: true,
      id: self.data.goods[index].id,
      img: self.data.goods[index].img,
      name: name,
      price: self.data.goods[index].price,
      zhekou: self.data.goods[index].zhekou,
      zhekouprice: self.data.goods[index].zhekouprice,
      nowprice: self.data.goods[index].nowprice,
      shangpu: self.data.goods[index].shangpu, //所属商铺
      shopid: self.data.goods[index].shopid,
      number: 1, //用户购物车数量
      index: index, //在goods列表里的index
    }
    buy.push(goods)
    self.setData({
      guige: false,
      buy: buy,
      [goodsdata]: goodsnumber + 1
    }, () => {
      self.buy(buy)
    })
  },
})