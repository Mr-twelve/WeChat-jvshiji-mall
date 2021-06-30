const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    elements: [{
      title: '营业统计',
      name: 'Turnover ',
      color: 'cyan',
      icon: 'newsfill',
      bindtap:'goyingye'
    },
    {
      title: '菜品统计',
      name: 'Goods',
      color: 'blue',
      icon: 'colorlens',
      bindtap:'gogoods'
    },
    {
      title: '商铺订单查询',
      name: 'Inquire',
      color: 'purple',
      icon: 'font',
      bindtap:'golookdindan'
    },
    {
      title: '平台下单查询 ',
      name: 'Platform',
      color: 'mauve',
      icon: 'icon',
      bindtap:'golookpintaidindan'
    },
    {
      title: '订单搜索',
      name: 'Search',
      color: 'pink',
      icon: 'btn',
      bindtap:'golooksousuo'
    },
    {
      title: '商铺管理',
      name: 'Shop',
      color: 'brown',
      icon: 'tagfill',
      bindtap:'goshop'
    },
    {
      title: '用户',
      name: 'User',
      color: 'red',
      icon: 'loading2',
      bindtap:'gouser'
    },
    {
      title: '待开发',
      name: 'loading',
      color: 'orange',
      icon: 'loading2',
      bindtap:''
    },
    {
      title: '待开发',
      name: 'loading',
      color: 'olive',
      icon: 'loading2',
      bindtap:''
    },
    {
      title: '待开发',
      name: 'loading',
      color: 'green',
      icon: 'loading2',
      bindtap:''
    },
  ],
  myimage:'data:image/png;base64,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'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: loginres => {
        console.log('[云函数] [login] user openid: ', loginres.result.openid)
        app.globalData.openid = loginres.result.openid
        self.setData({
          openid: loginres.result.openid
        })
        if (loginres.result.openid == 'ooqHY5ZrpVu_KH6v2Ml7KlGlT-no' || loginres.result.openid == 'ooqHY5VPsNzi80qnH0-RNU0S0lBA11' || loginres.result.openid == 'ooqHY5arIyp2vyz0PkM5NxBmFu-8') {
          self.setData({
            openid: loginres.result.openid
          })
        } else {
          db.collection('worker').where({
            _openid: loginres.result.openid
          }).get().then(res => {
            console.log(res.data)
            if (res.data.length > 0) {
              console.log(res.data[0])
              self.setData({
                worker: res.data[0]
              })
            }
          })
        }

      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },

  goyingye(e) {
    wx.navigateTo({
      url: 'yingye/yingye',
    })
  },
  gopeople(e) {
    wx.navigateTo({
      url: 'people/people',
    })
  },
  goshop(e) {
    wx.navigateTo({
      url: 'shop/shop',
    })
  },
  gogoods(e) {
    wx.navigateTo({
      url: 'goods/goods',
    })
  },
  golookdindan(e){
    wx.navigateTo({
      url: 'lookdindan/lookdindan',
    })
  },
  golookpintaidindan(e){
    wx.navigateTo({
      url: 'lookpintaidindan/lookpintaidindan',
    })
  },
  golooksousuo(e){
    wx.navigateTo({
      url: 'looksousuo/looksousuo',
    })
  },
  gouser(e) {
    wx.navigateTo({
      url: 'usershop/usershop',
    }) 
    /* var shop_id = 'info_10'
    wx.navigateTo({
      url: '../../user/shangpu/shangpu?shop_id=' + shop_id,
    }) */
  }
})