import * as echarts from './echarts.esm.min.js';
import { getHSGT, getTrends2 } from '../api/api.js';
import { useNotify } from '../utils/use-notify.js';

const HSGT_LEGEND_NAME = '北向资金';
let tradingChart;
const dataZoomConfig = {
  start: 0,
  end: 100,
};
const tradingChartOption = {
  textStyle: {
    fontSize: 16,
  },
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
      start: dataZoomConfig.start,
      end: dataZoomConfig.end,
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
let LAST_SEND_WEB_NOTIFY_HSGT_LENGTH = 2;
/**
 * 刷新图表
 * @param {string} secids 多个股票代码，用逗号分隔
 * @param {1|2} type 1: 净流入 2: 净买入
 */
const refreshTradingChart = async (secids = '1.000300', type = 1) => {
  const { sendWebNotify } = useNotify();
  const [hsgtRes, ...trendsResArr] = await Promise.all([getHSGT(type), ...secids.split(',').map(secid => getTrends2(secid))]);
  if (hsgtRes.data.s2n && hsgtRes.data.s2n.length > 0) {
    const hsgtDataArr = hsgtRes.data.s2n.map(x => x.split(','));
    const hsgtDataTimes = hsgtDataArr.map(x => x[0]);
    const hsgtData = hsgtDataArr.filter(x => x[3] !== '-').map(x => +(+x[3] / 10000).toFixed(2));
    // 北向资金异动通知
    if (hsgtData.length > LAST_SEND_WEB_NOTIFY_HSGT_LENGTH) {
      const lastHsgtData = hsgtData[hsgtData.length - 1];
      const last2HsgtData = hsgtData[hsgtData.length - 2];
      const diffHsgtAmt = lastHsgtData - last2HsgtData;
      const notifyAmt = 10;
      if (Math.abs(diffHsgtAmt) > notifyAmt) {
        LAST_SEND_WEB_NOTIFY_HSGT_LENGTH = hsgtData.length;
        sendWebNotify('北向资金大笔' + (diffHsgtAmt > 0 ? '流入' : '流出'), `一分钟内，北向资金异动超${diffHsgtAmt.toFixed(2)}亿，请及时关注`);
      }
    }
    // 滑动条
    tradingChartOption.dataZoom[0].start = dataZoomConfig.start;
    const dataZoomEnd = Math.ceil((hsgtData.length / hsgtDataTimes.length) * 100);
    if (Math.abs(dataZoomConfig.end - dataZoomEnd) > 2) {
      tradingChartOption.dataZoom[0].end = dataZoomConfig.end;
    } else {
      tradingChartOption.dataZoom[0].end = dataZoomEnd;
    }

    tradingChartOption.xAxis.data = hsgtDataTimes;
    const min = Math.round(Math.min(...hsgtData));
    const max = Math.ceil(Math.max(...hsgtData));
    const diff = Math.ceil((max - min) * 0.1);
    tradingChartOption.yAxis[0].min = min - diff;
    tradingChartOption.yAxis[0].max = max + diff;
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
      const min = Math.round(Math.min(...trendsData) / 10) * 10;
      const max = Math.ceil(Math.max(...trendsData) / 10) * 10;
      const diff = Math.ceil((max - min) * 0.1);
      tradingChartOption.yAxis[i + 1] = {
        type: 'value',
        name: `                 ${legendName}`,
        position: 'right',
        offset: i * 80,
        min: min - diff,
        max: max + diff,
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
    tradingChart.on('datazoom', function (params) {
      dataZoomConfig.start = params.start;
      dataZoomConfig.end = params.end;
    });
    window.addEventListener('resize', tradingChart.resize);
  }
  return {
    refreshTradingChart,
  };
}
