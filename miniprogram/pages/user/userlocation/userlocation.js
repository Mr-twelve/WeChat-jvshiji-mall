const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    index: null,
    pickername: '',
    picker: ['男-文瀛苑', '男-文瀚苑', '男-文泽苑', '女-文澜苑', '女-文灏苑', '明学楼(一楼大厅自取)', '博学楼(一楼大厅自取)'],
    indexschool: null,
    pickernameschool: '',
    pickerschool: ['中北', '师范(目前东门自取)'],
    multiArray: [
      ['中北', '师范(目前东门自取)'],
      ['男-文瀛苑', '男-文瀚苑', '男-文泽苑', '女-文澜苑', '女-文灏苑', '明学楼(一楼大厅自取)', '博学楼(一楼大厅自取)']
    ],
    objectMultiArray: [
      [{
          id: 0,
          name: '中北'
        },
        {
          id: 1,
          name: '师范(目前东门自取)'
        }
      ],
      [{
          id: 0,
          name: '男-文瀛苑'
        },
        {
          id: 1,
          name: '男-文瀚苑'
        },
        {
          id: 2,
          name: '男-文泽苑'
        },
        {
          id: 3,
          name: '女-文澜苑'
        },
        {
          id: 4,
          name: '女-文灏苑'
        },
        {
          id: 5,
          name: '明学楼(一楼大厅自取)'
        },
        {
          id: 6,
          name: '博学楼(一楼大厅自取)'
        }
      ]
    ],
    multiIndex: [0, 0],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this
    if (options.pay == 'true') {
      self.setData({
        backpage: 'pay'
      })
    }
    console.log(options)
    var shop_id = options.shop_id
    wx.getStorage({
      key: 'userinfo',
      success(res) {
        if (res.data.havelocation) {
          if (res.data.userlocation.school == "中北") {
            switch (res.data.userlocation.location) {
              case '男-文瀛苑':
                var indextwo = 0
                break;
              case '男-文瀚苑':
                var indextwo = 1
                break;
              case '男-文泽苑':
                var indextwo = 2
                break;
              case '女-文澜苑':
                var indextwo = 3
                break;
              case '女-文灏苑':
                var indextwo = 4
                break;
              case '明学楼(一楼大厅自取)':
                var indextwo = 5
                break;
              case '博学楼(一楼大厅自取)':
                var indextwo = 5
                break;
            }
            self.setData({
              multiIndex: [0, indextwo],
            })
          }
          if (res.data.userlocation.school == "师范(目前东门自取)") {
            console.log("1111111")
            switch (res.data.userlocation.location) {
              case '1号楼':
                var indextwo = 0
                break;
              case '2号楼':
                var indextwo = 1
                break;
              case '3号楼':
                var indextwo = 2
                break;
              case '4号楼':
                var indextwo = 3
                break;
              case '5号楼':
                var indextwo = 4
                break;
              case '6号楼':
                var indextwo = 5
                break;
            }
            self.setData({
              multiArray: [
                ['中北', '师范(目前东门自取)'],
                ['1号楼', '2号楼', '3号楼', '4号楼', '5号楼', '6号楼']
              ],
              multiIndex: [1, indextwo],
            })
          }
          self.setData({
            shop_id:shop_id,
            pickername: res.data.userlocation.location
          })
        }
        console.log(res.data)
        self.setData({
          shop_id: shop_id,
          userinfo: res.data
        })
      }
    })
  },

  /*  PickerChange(e) {
     console.log(e);
     this.setData({
       pickername: this.data.picker[e.detail.value],
       index: e.detail.value
     })
   },
   PickerChangeschool(e) {
     console.log(e);
     this.setData({
       pickernameschool: this.data.pickerschool[e.detail.value],
       indexschool: e.detail.value
     })
   }, */
  bindMultiPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      multiIndex: e.detail.value
    })
  },
  bindMultiPickerColumnChange: function (e) {
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    switch (e.detail.column) {
      case 0:
        switch (data.multiIndex[0]) {
          case 0:
            data.multiArray[1] = ['男-文瀛苑', '男-文瀚苑', '男-文泽苑', '女-文澜苑', '女-文灏苑', '明学楼(一楼大厅自取)', '博学楼(一楼大厅自取)'];
            break;
          case 1:
            data.multiArray[1] = ['1号楼', '2号楼', '3号楼', '4号楼', '5号楼', '6号楼'];
            break;
        }
        data.multiIndex[1] = 0;
        break;
    }
    this.setData(data);
  },
  formSubmit(e) {
    console.log(e)
    var self = this
    var shop_id = self.data.shop_id
    console.log(shop_id)
    console.log(shop_id)
    var multiArray = self.data.multiArray
    var multiIndex = self.data.multiIndex
    var backpage = self.data.backpage
    var location = multiArray[1][multiIndex[1]]
    var school = multiArray[0][multiIndex[0]]
    var sushehao = e.detail.value.sushehao
    var name = e.detail.value.name
    var tell = e.detail.value.tell
    var userinfo = self.data.userinfo
    console.log(userinfo)
    console.log(location + sushehao + name + tell)
    if (location.length > 0 && sushehao.length > 0 && name.length > 0 && tell.length > 0&& school.length > 0) {
      if (tell.length == 11) {
        wx.showLoading({
          mask: true,
          title: '保存中...',
        })
        db.collection('userinfo').doc(userinfo._id).update({
          data: {
            userlocation: {
              school: school,
              location: location,
              sushehao: sushehao,
              name: name,
              tell: tell
            },
            havelocation: true
          },
          success: function (res) {
            console.log(res)
            wx.setStorage({
              key: "userinfo",
              data: {
                _id: userinfo._id,
                _openid: userinfo._openid,
                username: userinfo.username,
                usertximg: userinfo.usertximg,
                userlocation: {
                  school: school,
                  location: location,
                  sushehao: sushehao,
                  name: name,
                  tell: tell
                },
                havelocation: true
              }
            })
            if (backpage == 'pay') {
              wx.redirectTo({
                url: '../pay/pay'
              })
            } else {
              wx.reLaunch({
                url: '../shangpu/shangpu?shop_id=' + shop_id
              })
            }
          },
          fail: console.error
        })
      } else {
        wx.showToast({
          icon: "none",
          title: '请输入正确手机号',
        })
      }
    } else {
      wx.showToast({
        icon: "none",
        title: '请填写全部内容',
      })
    }
  },
})