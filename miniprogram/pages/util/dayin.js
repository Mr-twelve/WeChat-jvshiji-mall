function test(SN, buy, shopname) {
  console.log(buy)
  console.log("text调用成功" + SN)
  var USER = "1173919359@qq.com";
  var UKEY = "WVWRwtdUjnL7L7jU";
  var SN = SN;
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
  orderInfo += '<CB>' + shopname + '</CB><BR>';
  orderInfo += '名称            单价  数量  金额';
  orderInfo += '--------------------------------<BR>';
  buy.buy.forEach(function (item, index) {
    var name = item.name
    var price = (item.nowprice * 1).toFixed(2)
    var number = item.number
    var totalprice = (price * number).toFixed(2)
    var aa = GetLength(name)
    var bb = price.length
    var cc = (number.toString()).length
    var dd = totalprice.length

    if (aa < 14) {
      var kong = ''
      for (var i = 0; i < 15 - aa; i++) {
        kong += ' '
      }
    }
    if (bb < 6) {
      for (var i = 0; i < 6 - bb; i++) {
        price = ' ' + price
      }
    }
    if (cc < 3) {
      for (var i = 0; i < 3 - cc; i++) {
        number = ' ' + number
      }
    }
    if (dd < 6) {
      for (var i = 0; i < 6 - dd; i++) {
        totalprice = ' ' + totalprice
      }
    }
    var end =   price + ' ' + number + ' ' + totalprice + '<BR>'
    if (aa < 14) {
      orderInfo += item.name + kong  + end;
    } else {
      orderInfo += item.name + '<BR>               ' + end;
    }

  })
  orderInfo += '备注:'+buy.beizu+'<BR>';
  orderInfo += '--------------------------------<BR>';
  orderInfo += '<RIGHT>合计:'+buy.totalprice+'元</RIGHT><BR>';
  orderInfo += '学校:'+buy.school+'<BR>';
  orderInfo += '地址:'+buy.location+'-'+buy.sushehao+'<BR>';
  orderInfo += '电话:'+buy.tell+'<BR>';
  orderInfo += '下单时间:'+buy.upday+' '+buy.uptime+'<BR>';
  orderInfo += '预约情况:'+buy.yuyue+'<BR>';

  //***接口返回值说明***
  //正确例子：{"msg":"ok","ret":0,"data":"123456789_20160823165104_1853029628","serverExecutedTime":6}
  //错误：{"msg":"错误信息.","ret":非零错误码,"data":null,"serverExecutedTime":5}
  console.log(orderInfo);
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

  function GetLength(str) {
    ///<summary>获得字符串实际长度，中文2，英文1</summary>
    ///<param name="str">要获得长度的字符串</param>
    var realLength = 0,
      len = str.length,
      charCode = -1;
    for (var i = 0; i < len; i++) {
      charCode = str.charCodeAt(i);
      if (charCode >= 0 && charCode <= 128) realLength += 1;
      else realLength += 2;
    }
    return realLength;
  };
}


module.exports = {
  test: test
};