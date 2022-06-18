// b4777e09a0311f6e0734ff19d481afb5
// b2884a393a59ad64002292a3e90d46a5
// f057cbcbce2a86e2866ab8877db1d059
const ut = 'f057cbcbce2a86e2866ab8877db1d059';

/**
 * https://data.eastmoney.com/hsgtcg/gzcglist.html
 * 获取沪深港通(北向)数据
 * @param {1|2} type 1:净流入 2:净买入
 * @returns {Promise}
 */
export const getHSGT = (type = 1) => {
  let url = '';
  switch (type) {
    case 1:
      url = `https://push2.eastmoney.com/api/qt/kamt.rtmin/get?fields1=f1,f3&fields2=f51,f52,f54,f56&ut=${ut}&_=${Date.now()}`;
      break;
    case 2:
      url = `https://push2.eastmoney.com/api/qt/kamtbs.rtmin/get?dpt=app.hsgt&fields1=f1,f3&fields2=f51,f54,f58,f62&ut=${ut}&_=${Date.now()}`;
      break;
    default:
      throw new Error('type must be 1 or 2');
  }
  return fetch(url, {
    headers: {
      accept: 'application/json, text/plain, */*',
    },
    method: 'GET',
  }).then(res => res.json());
};

/**
 * 获取交易数据
 * @param {string} secid 证券代码
 * @returns {Promise}
 */
export const getTrends2 = (secid = '1.000300') => {
  return fetch(`https://push2his.eastmoney.com/api/qt/stock/trends2/get?secid=${secid}&fields1=f1,f2,f5&fields2=f51,f53&iscr=0&iscca=0&ut=${ut}&ndays=1`, {
    headers: {
      accept: 'application/json, text/plain, */*',
    },
    method: 'GET',
  }).then(res => res.json());
};
