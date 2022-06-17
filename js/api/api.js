/**
 * 获取沪深港通(北向)数据
 * @returns {Promise}
 */
export const getHSGT = () => {
  return fetch('https://push2.eastmoney.com/api/qt/kamtbs.rtmin/get?dpt=app.hsgt&fields1=f1,f3&fields2=f51,f54,f58,f62&ut=b4777e09a0311f6e0734ff19d481afb5', {
    headers: {
      accept: 'application/json, text/plain, */*',
    },
    referrer: 'https://emrnweb.eastmoney.com/',
    method: 'GET',
  }).then(res => res.json());
};

/**
 * 获取交易数据
 * @param {string} secid 证券代码
 * @returns {Promise}
 */
export const getTrends2 = (secid = '1.000300') => {
  return fetch(
    `https://push2his.eastmoney.com/api/qt/stock/trends2/get?secid=${secid}&fields1=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13,f14&fields2=f51,f53,f54,f55,f56,f57,f58&iscr=0&iscca=0&ut=f057cbcbce2a86e2866ab8877db1d059&ndays=1`,
    {
      headers: {
        accept: 'application/json, text/plain, */*',
      },
      referrer: 'https://emrnweb.eastmoney.com/',
      method: 'GET',
    }
  ).then(res => res.json());
};
