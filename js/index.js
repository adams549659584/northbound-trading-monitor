import { createApp } from './petite-vue/petite-vue.es.js';
import { useNorthBoundTradingChart } from './echarts/use-northbound-trading-chart.js';

const refreshConfigs = [
  {
    time: 10 * 1000,
    desc: '10秒',
  },
  {
    time: 30 * 1000,
    desc: '30秒',
  },
  {
    time: 3 * 1000,
    desc: '3秒',
  },
  {
    time: 0,
    desc: '不刷新',
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
];
const appConfig = {
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
    refreshTradingChart(that.secid);
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
    that.refreshChart(el);
  },
};

createApp(appConfig).mount();
