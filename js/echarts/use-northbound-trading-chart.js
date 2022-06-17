import * as echarts from './echarts.esm.min.js';
import { getHSGT, getTrends2 } from '../api/api.js';

const HSGT_LEGEND_NAME = '北向资金';
let tradingChart;
const tradingChartOption = {
  tooltip: {
    show: true,
    trigger: 'axis',
  },
  legend: {
    data: [HSGT_LEGEND_NAME, '沪深300'],
  },
  dataZoom: [
    {
      show: true,
      type: 'slider',
      start: 0,
      end: 100,
    },
  ],
  xAxis: {
    type: 'category',
    data: ['9:30'],
  },
  yAxis: [
    {
      type: 'value',
      name: `${HSGT_LEGEND_NAME}(单位/亿)`,
      position: 'left',
      min: 0,
      max: 1,
    },
    {
      type: 'value',
      name: '沪深300',
      position: 'right',
      min: 0,
      max: 1,
    },
  ],
  series: [
    {
      name: HSGT_LEGEND_NAME,
      type: 'line',
      markPoint: {
        data: [
          {
            type: 'max',
            name: '最大值',
          },
          {
            type: 'min',
            name: '最小值',
          },
        ],
      },
      data: [0],
    },
    {
      name: '沪深300',
      type: 'line',
      markPoint: {
        data: [
          {
            type: 'max',
            name: '最大值',
          },
          {
            type: 'min',
            name: '最小值',
          },
        ],
      },
      data: [0],
      yAxisIndex: 1,
    },
  ],
};
const refreshTradingChart = async (secids = '1.000300') => {
  const [hsgtRes, ...trendsResArr] = await Promise.all([getHSGT(), ...secids.split(',').map(secid => getTrends2(secid))]);
  if (hsgtRes.data.s2n && hsgtRes.data.s2n.length > 0) {
    const hsgtDataArr = hsgtRes.data.s2n.map(x => x.split(','));
    const hsgtDataTimes = hsgtDataArr.map(x => x[0]);
    const hsgtData = hsgtDataArr.filter(x => x[3] !== '-').map(x => +(+x[3] / 10000).toFixed(2));
    tradingChartOption.dataZoom[0].end = Math.ceil((hsgtData.length / hsgtDataTimes.length) * 100);
    tradingChartOption.xAxis.data = hsgtDataTimes;
    tradingChartOption.yAxis[0].min = Math.round(Math.min(...hsgtData));
    tradingChartOption.yAxis[0].max = Math.ceil(Math.max(...hsgtData));
    tradingChartOption.series[0] = {
      name: HSGT_LEGEND_NAME,
      type: 'line',
      markPoint: {
        data: [
          { type: 'max', name: '最大值' },
          { type: 'min', name: '最小值' },
        ],
      },
      data: hsgtData,
    };
  }
  if (trendsResArr.length > 0) {
    for (let i = 0; i < trendsResArr.length; i++) {
      const trendsRes = trendsResArr[i];
      const trendsData = trendsRes.data.trends.map(x => +x.split(',')[1]);
      const legendName = `${trendsRes.data.name}`;
      tradingChartOption.legend.data[i + 1] = legendName;
      tradingChartOption.yAxis[i + 1] = {
        type: 'value',
        name: `                 ${legendName}`,
        position: 'right',
        offset: i * 80,
        min: Math.round(Math.min(...trendsData) / 10) * 10,
        max: Math.ceil(Math.max(...trendsData) / 10) * 10,
      };
      tradingChartOption.series[i + 1] = {
        name: legendName,
        type: 'line',
        markPoint: {
          data: [
            { type: 'max', name: '最大值' },
            { type: 'min', name: '最小值' },
          ],
        },
        data: trendsData,
        yAxisIndex: i + 1,
      };
    }
  }
  tradingChart && tradingChart.setOption(tradingChartOption);
};

/**
 * 北向资金图表 hook
 * @param { HTMLElement } dom 不为空则初始化图表
 * @returns
 */
export function useNorthBoundTradingChart(dom) {
  if (dom) {
    tradingChart = echarts.init(dom, null, {
      renderer: 'canvas',
      useDirtyRect: false,
    });
    window.addEventListener('resize', tradingChart.resize);
  }
  return {
    refreshTradingChart,
  };
}
