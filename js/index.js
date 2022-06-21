import { createApp } from './petite-vue/petite-vue.es.js';
import { useNorthBoundTradingChart } from './echarts/use-northbound-trading-chart.js';
import { useNotify } from './utils/use-notify.js';

const refreshConfigs = [
  {
    time: 3 * 1000,
    desc: '3秒',
  },
  {
    time: 10 * 1000,
    desc: '10秒',
  },
  {
    time: 30 * 1000,
    desc: '30秒',
  },
  {
    time: 1 * 1000,
    desc: '1秒',
  },
  {
    time: -1,
    desc: '不刷新',
  },
];
const northboundDataConfigs = [
  {
    type: 1,
    desc: '净流入',
  },
  {
    type: 2,
    desc: '净买入',
  },
];
const trendsConfigs = [
  {
    secid: '1.000300',
    desc: '沪深300',
  },
  {
    secid: '1.000905',
    desc: '中证500',
  },
  {
    secid: '0.399303',
    desc: '国证2000',
  },
  {
    secid: '0.399006',
    desc: '创业板指',
  },
  {
    secid: '1.000001',
    desc: '上证指数',
  },
  {
    secid: '1.000016',
    desc: '上证50',
  },
  {
    secid: '0.399001',
    desc: '深证成指',
  },
];
const appConfig = {
  isLoaded: false,
  githubLink: 'https://github.com/adams549659584/northbound-trading-monitor',
  trendsTitle: `北向-${trendsConfigs[0].desc}叠加`,
  refreshConfigs,
  /**
   * 定时刷新时间间隔
   */
  refreshTime: refreshConfigs[0].time,
  refreshTimer: null,
  changeRefreshTime() {
    const that = this;
    that.refreshChart();
  },
  northboundDataConfigs,
  /**
   * 1: 净流入 2: 净买入
   */
  northboundDataType: northboundDataConfigs[0].type,
  changeNorthboundData() {
    const that = this;
    that.refreshChart();
  },
  trendsConfigs,
  secid: trendsConfigs[0].secid,
  changeTrends() {
    const that = this;
    const trends = trendsConfigs.find(x => x.secid === that.secid);
    that.trendsTitle = `北向-${trends.desc}叠加`;
    that.refreshChart();
  },
  /**
   * 刷新图表
   * @param { HTMLElement } chartEle 不为空则初始化图表
   * @returns
   */
  refreshChart(chartEle) {
    const that = this;
    clearTimeout(that.refreshTimer);
    const { refreshTradingChart } = useNorthBoundTradingChart(chartEle);
    refreshTradingChart(that.secid, that.northboundDataType);
    if (that.refreshTime > 0) {
      that.refreshTimer = setTimeout(that.refreshChart, that.refreshTime);
    }
  },
  /**
   *
   * @param { HTMLElement } el
   */
  async initTrendsEcharts(el) {
    const that = this;
    that.isLoaded = true;
    const dateNow = new Date();
    // 9:30-15:00 不刷新
    const dateNowNum = +`${dateNow.getHours()}${dateNow.getMinutes().toString().padStart(2, '0')}`;
    if (dateNowNum < 930 || dateNowNum > 1500) {
      that.refreshTime = -1;
    }
    // 9:30-14:50 净流入，其它看净买入
    if (dateNowNum < 930 || dateNowNum >= 1450) {
      that.northboundDataType = 2;
    } else {
      that.northboundDataType = 1;
      // 14:50 切换净买入
      const northboundDataBSTime = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate(), 14, 50, 0);
      const timeDiff = northboundDataBSTime.getTime() - dateNow.getTime();
      if (timeDiff > 0) {
        setTimeout(() => {
          that.northboundDataType = 2;
        }, timeDiff);
      }
    }
    that.refreshChart(el);
    const { initWebNotifyPermission } = useNotify();
    initWebNotifyPermission();
  },
};

createApp(appConfig).mount();
