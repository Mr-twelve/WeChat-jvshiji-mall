const app = getApp()
const db = wx.cloud.database()
const dayjs = require("./dayjs");
const $ = db.command.aggregate
const _ = db.command
const util = require("../util/dayin.js");
Page({


  data: {

  },
  /* 每个商铺每天出单量及收入 */
  /* 每个商铺每月 */
  onLoad: function (options) {
    var shop_id = "10000001"
    var day = '2020-08-30'
    var self = this
    if ((new Date().getDate()) < 10) {
      var date = '0' + new Date().getDate()
    } else {
      var date = new Date().getDate()
    }
    if ((new Date().getMonth() + 1) < 10) {
      var day = new Date().getFullYear() + '-0' + (new Date().getMonth() + 1) + '-' + date
      var yue = new Date().getFullYear() + '-0' + (new Date().getMonth() + 1)
      var oneyue = new Date().getFullYear() + '-0' + (new Date().getMonth() + 1) + '-01'
    } else {
      var day = new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + date
      var yue = new Date().getFullYear() + '-' + (new Date().getMonth() + 1)
      var oneyue = new Date().getFullYear() + '-0' + (new Date().getMonth() + 1) + '-01'
    }
    const $ = db.command.aggregate
    var yue = []
    var pricetotal = []
    var dindantotal = []
    var yuenum = 0
    var yueprice = 0
    /* db.collection('dindan').aggregate()
      .match({
        day: _.and(_.gte(oneyue), _.lte(day))
      })
      .group({
        _id: '$shopid',
        num: $.sum(1),
      price: $.sum('$totalprice')
      })
      .sort({
        num: -1
      })
      .limit(999)
      .end()
      .then(res => {
        console.log(res)
        
        dindantotal = res.list
        db.collection('dindan').aggregate()
          .match({
            day: _.and(_.gte(oneyue), _.lte(day))
          })
          .group({
            _id: '$shopid',
            price: $.sum('$totalprice')
          })
          .sort({
            num: -1
          })
          .limit(999)
          .end()
          .then(res => {
            pricetotal = res.list
            pricetotal.forEach(function (item, index) {
              for (var i = 0; i < dindantotal.length; i++) {
                if (dindantotal[i]._id == item._id) {
                  var newdindantotal = dindantotal[i].num
                  break;
                }
              }
              var newyue = {
                _id: item._id,
                num: newdindantotal,
                price: item.price
              }
              yue.push(newyue)
            })
            yue.forEach(function (item, index) {
              yuenum += item.num
              yueprice += item.price
            })
            console.log(yuenum + '-' + yueprice)
            console.log(yue)
          })
       })*/


    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'Totalyue',
      // 传递给云函数的event参数
      data: {}
    }).then(res => {
      console.log(res)
    }).catch(err => {
      console.log(err)
    })
    /* 商铺某一天每件商品销量 */
    /* self.daygoods(shop_id, day) */
    /* 全平台商品某一天出单量和总金额 */
    /* self.daytotal(day) */
  },
  /* 商铺某一天每件商品销量 */
  daygoods(shopid, day) {
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
          console.log(goodsres.list)
          self.setData({

          })
          wx.hideLoading()
        },
        fail: function (err) {
          wx.hideLoading()
          console.error(err)
        }
      })
  },
  /* 全平台商品某一天出单量和总金额 */
  daytotal(day) {
    var self = this
    db.collection('dindan').aggregate()
      .match({
        day: day
      })
      .project({
        _id: 0,
        shopid: 1,
        shopname: 1,
        totalprice: 1,
      })
      .group({
        _id: '$shopid',
        num: $.sum(1),
        price: $.sum('$totalprice')
      })
      .limit(9999)
      .end({
        success: function (shopres) {
          console.log(shopres.list)
          var num = 0
          var price = 0
          for (var i = 0; i <= shopres.list.length; i++) {
            if (i == shopres.list.length) {
              var TJ = {
                day: day,
                look: false,
                num: num,
                price: price,
                TJ: shopres.list
              }
              self.yuetotal(day, TJ)
              console.log(TJ)
            } else {
              num += shopres.list[i].num
              price += shopres.list[i].price
            }
          }
          wx.hideLoading()
        },
        fail: function (err) {
          wx.hideLoading()
          console.error(err)
        }
      })
  },
  /* 将今天的加在这月上 */
  yuetotal(day, dayTJ) {
    var yue = dayjs(day).format('YYYY-MM')
    db.collection('TJyue').where({
      day: yue
    }).get().then(res => {
      console.log(res.data[0])
      console.log(dayTJ)
      var yueTJ = res.data[0]
      var num = 0
      var price = 0
      num = dayTJ.num + yueTJ.num
      console.log(num)
      price = dayTJ.price + yueTJ.price
      console.log(price)
      dayTJ.TJ.forEach(function (dayitem, dayindex) {
        try {
          yueTJ.TJ.forEach(function (yueitem, yueindex) {
            console.log(yueitem.id)
            console.log(dayitem._id)
            if (yueitem.id == dayitem._id) {
              yueitem.num = yueitem.num + dayitem.num
              yueitem.price = yueitem.price + dayitem.price
              throw 'add'
            }
            if (yueitem.id != dayitem._id && yueindex == yueTJ.TJ.length - 1) {
              console.log('xxxxxxxxxx')
              yueTJ.TJ.push({
                "id": dayitem._id,
                "num": dayitem.num,
                "price": dayitem.price
              })
            }
          })
        } catch (e) {
          console.log(e)
        }
      })
      console.log(yueTJ)
    })
  },
  /* 商铺某月收入 */
  yueshopprice(yue, shopid) {
    db.collection('TJyue').aggregate()

      .unwind('$TJ')
      /* .group({
        _id: '$buy.name',
        num: $.sum('$buy.number')
      }) */
      .limit(9999)
      .end({
        success: function (res) {
          console.log(res)
          self.setData({

          })
          wx.hideLoading()
        },
        fail: function (err) {
          wx.hideLoading()
          console.error(err)
        }
      })
  },
  test: function (e) {
    var USER = "1173919359@qq.com";
    var UKEY = "WVWRwtdUjnL7L7jU";
    var SN = '921555060';
    //以下URL参数不需要修改
    var HOST = "api.feieyun.cn"; //域名
    var PATH = "/Api/Open/"; //接口路径
    var STIME = new Date().getTime(); //请求时间,当前时间的秒数
    var SIG = hex_sha1(USER + UKEY + STIME); //获取签名
    //标签说明：
    //单标签:
    //"<BR>"为换行,"<CUT>"为切刀指令(主动切纸,仅限切刀打印机使用才有效果)
    //"<LOGO>"为打印LOGO指令(前提是预先在机器内置LOGO图片),"<PLUGIN>"为钱箱或者外置音响指令
    //成对标签：
    //"<CB></CB>"为居中放大一倍,"<B></B>"为放大一倍,"<C></C>"为居中,<L></L>字体变高一倍
    //<W></W>字体变宽一倍,"<QR></QR>"为二维码,"<BOLD></BOLD>"为字体加粗,"<RIGHT></RIGHT>"为右对齐
    //拼凑订单内容时可参考如下格式
    //根据打印纸张的宽度，自行调整内容的格式，可参考下面的样例格式
    var orderInfo;
    orderInfo = '<CB>聚食集</CB><BR>';
    orderInfo += '名称　　　　　 单价  数量 金额<BR>';
    orderInfo += '--------------------------------<BR>';
    orderInfo += '饭　　　　　 　10.0   10  10.0<BR>';
    orderInfo += '炒饭　　　　　 10.0   10  10.0<BR>';
    orderInfo += '蛋炒饭　　　　 10.0   100 100.0<BR>';
    orderInfo += '鸡蛋炒饭　　　 100.0  100 100.0<BR>';
    orderInfo += '西红柿炒饭　　 1000.0 1   100.0<BR>';
    orderInfo += '西红柿蛋炒饭　 100.0  100 100.0<BR>';
    orderInfo += '西红柿鸡蛋炒饭是的撒大苏打实打实大苏打撒旦 15.0   1   15.0<BR>';
    orderInfo += '备注：加辣<BR>';
    orderInfo += '--------------------------------<BR>';
    orderInfo += '合计：xx.0元<BR>';
    orderInfo += '送货地点：广州市南沙区xx路xx号<BR>';
    orderInfo += '联系电话：13888888888888<BR>';
    orderInfo += '订餐时间：2014-08-08 08:08:08<BR>';

    //***接口返回值说明***
    //正确例子：{"msg":"ok","ret":0,"data":"123456789_20160823165104_1853029628","serverExecutedTime":6}
    //错误：{"msg":"错误信息.","ret":非零错误码,"data":null,"serverExecutedTime":5}
    // console.log(orderInfo);
    //打开注释可测试
    print_r(SN, orderInfo, 1);

    var hexcase = 0;
    var chrsz = 8;

    function hex_sha1(s) {
      return binb2hex(core_sha1(AlignSHA1(s)));
    }

    function core_sha1(blockArray) {
      var x = blockArray;
      var w = Array(80);
      var a = 1732584193;
      var b = -271733879;
      var c = -1732584194;
      var d = 271733878;
      var e = -1009589776;
      for (var i = 0; i < x.length; i += 16) {
        var olda = a;
        var oldb = b;
        var oldc = c;
        var oldd = d;
        var olde = e;
        for (var j = 0; j < 80; j++) {
          if (j < 16)
            w[j] = x[i + j];
          else
            w[j] = rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
          var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)), safe_add(safe_add(e, w[j]), sha1_kt(j)));
          e = d;
          d = c;
          c = rol(b, 30);
          b = a;
          a = t;
        }
        a = safe_add(a, olda);
        b = safe_add(b, oldb);
        c = safe_add(c, oldc);
        d = safe_add(d, oldd);
        e = safe_add(e, olde);
      }
      return new Array(a, b, c, d, e);
    }

    function sha1_ft(t, b, c, d) {
      if (t < 20)
        return (b & c) | ((~b) & d);
      if (t < 40)
        return b ^ c ^ d;
      if (t < 60)
        return (b & c) | (b & d) | (c & d);
      return b ^ c ^ d;
    }

    function sha1_kt(t) {
      return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 : (t < 60) ? -1894007588 : -899497514;
    }

    function safe_add(x, y) {
      var lsw = (x & 0xFFFF) + (y & 0xFFFF);
      var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
      return (msw << 16) | (lsw & 0xFFFF);
    }

    function rol(num, cnt) {
      return (num << cnt) | (num >>> (32 - cnt));
    }

    function AlignSHA1(str) {
      var nblk = ((str.length + 8) >> 6) + 1,
        blks = new Array(nblk * 16);
      for (var i = 0; i < nblk * 16; i++)
        blks[i] = 0;
      for (i = 0; i < str.length; i++)
        blks[i >> 2] |= str.charCodeAt(i) << (24 - (i & 3) * 8);
      blks[i >> 2] |= 0x80 << (24 - (i & 3) * 8);
      blks[nblk * 16 - 1] = str.length * 8;
      return blks;
    }

    function binb2hex(binarray) {
      var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
      var str = "";
      for (var i = 0; i < binarray.length * 4; i++) {
        str += hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) +
          hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF);
      }
      return str;
    }

    /*
     *  打印订单方法：Open_printMsg
     */
    function print_r(SN, orderInfo, TIMES) {
      wx.request({
        url: 'https://' + HOST + PATH,
        data: {
          user: USER, //账号
          stime: STIME, //当前时间的秒数，请求时间
          sig: SIG, //签名
          apiname: "Open_printMsg", //不需要修改
          sn: SN, //打印机编号
          content: orderInfo, //打印内容
          times: TIMES, //打印联数,默认为1
        },
        method: "POST",
        header: {
          "content-type": "application/x-www-form-urlencoded"
        },
        success: function (res) {
          console.log(res.data)
        }
      })
    }
  }
})