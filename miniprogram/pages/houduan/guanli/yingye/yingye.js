import * as echarts from '../../../util/ec-canvas/echarts';
const dayjs = require("./dayjs");
const db = wx.cloud.database()


const app = getApp();

function initChart(canvas, width, height, dpr) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(chart);

  var option = {
    backgroundColor: "#ffffff",
    color: ["#37A2DA", "#32C5E9", "#67E0E3", "#91F2DE", "#FFDB5C", "#FF9F7F"],
    series: [{
      label: {
        normal: {
          fontSize: 14
        }
      },
      type: 'pie',
      center: ['50%', '50%'],
      radius: ['40%', '60%'],
      data: [{
        value: 2,
        name: '北京'
      }, {
        value: 2,
        name: '武汉'
      }, {
        value: 2,
        name: '杭州'
      }, {
        value: 2,
        name: '广州'
      }, {
        value: 2,
        name: '上海'
      }]
    }]
  };

  chart.setOption(option);
  return chart;
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ec: {
      onInit: initChart
    },
    dayjs_yue: [],
    dayjs_day: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this
    db.collection('TJyue').where({}).get().then(res => {
      db.collection('shop').doc('9aa177b05f0d42350001958b692cd84f').get().then(shopTJ => {
        self.setData({
          TJ: res.data.reverse(),
          todayyue: dayjs().add(1, 'month').format('YYYY-MM'),
          shopTJ: shopTJ.data.LSshopid
        })
      })
    })

  },
  /* 月份查看 */
  lookyue(e) {
    console.log(e.currentTarget.id)
    var self = this
    var dayjsyue = 'TJ[' + e.currentTarget.id + '].look'
    self.setData({
      [dayjsyue]: !self.data.TJ[e.currentTarget.id].look
    })
  },
  /* 月详情查看 */
  lookyuexq(e) {
    console.log(e.currentTarget.id)
    wx.navigateTo({
      url: 'yue-xq/yue-xq?yue=' + e.currentTarget.id,
    })
  },
})