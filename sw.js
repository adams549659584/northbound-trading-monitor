// 引入workbox 框架
importScripts('./js/sw/workbox-sw.js');

const SW_VERSION = '1.0.0';
const DATE_NOW = new Date();
const DATE_NOW_NUM = +`${DATE_NOW.getHours()}${DATE_NOW.getMinutes().toString().padStart(2, '0')}`;
const IS_TRADING_TIME = DATE_NOW_NUM >= 930 && DATE_NOW_NUM <= 1500;

// todo debugger
// workbox.setConfig({ debug: true });

workbox.core.setCacheNameDetails({
  prefix: 'northbound-trading-monitor',
});

// Updating SW lifecycle to update the app after user triggered refresh
workbox.core.skipWaiting();
workbox.core.clientsClaim();

// 注册成功后要立即缓存的资源列表
workbox.precaching.precacheAndRoute([
  // css
  {
    url: './css/style.css',
    revision: '2022.07.23',
  },
  // js
  {
    url: './js/index.js',
    revision: '2022.07.23',
  },
  {
    url: './js/api/api.js',
    revision: '2022.07.23',
  },
  {
    url: './js/echarts/echarts.esm.min.js',
    revision: '2022.07.23',
  },
  {
    url: './js/echarts/use-northbound-trading-chart.js',
    revision: '2022.07.23',
  },
  {
    url: './js/petite-vue/petite-vue.es.js',
    revision: '2022.07.23',
  },
  {
    url: './js/sw/use-workbox.js',
    revision: '2022.07.23',
  },
  {
    url: './js/sw/workbox-sw.js',
    revision: '2022.07.23',
  },
  {
    url: './js/sw/workbox-window.prod.js',
    revision: '2022.07.23',
  },
  {
    url: './js/utils/use-notify.js',
    revision: '2022.07.23',
  },
  // html
  {
    url: './',
    revision: '2022.07.23',
  },
  // ico
  {
    url: './favicon.ico',
    revision: '2022.07.23',
  },
]);

workbox.precaching.cleanupOutdatedCaches();

// image
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'northbound-trading-monitor-image',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60, // 60 个
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 天
      }),
    ],
  })
);
// css
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'style',
  new workbox.strategies.CacheFirst({
    cacheName: 'northbound-trading-monitor-css',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60, // 60 个
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 天
      }),
    ],
  })
);
// js
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'script',
  new workbox.strategies.CacheFirst({
    cacheName: 'northbound-trading-monitor-js',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60, // 60 个
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 天
      }),
    ],
  })
);

const apiCacheName = 'northbound-trading-monitor-api';
/**
 * @type [import('workbox-core').WorkboxPlugin[]]
 */
const apiCachePlugins = [
  new workbox.cacheableResponse.CacheableResponsePlugin({
    statues: [0, 200],
  }),
  new workbox.expiration.ExpirationPlugin({
    maxEntries: 10, // 2 个
    maxAgeSeconds: 7 * 24 * 60 * 60, // 7 天
  }),
  {
    cacheKeyWillBeUsed: async ({ request, mode, params, event, state }) => {
      // `request` is the `Request` object that would otherwise be used as the cache key.
      // `mode` is either 'read' or 'write'.
      // Return either a string, or a `Request` whose `url` property will be used as the cache key.
      // Returning the original `request` will make this a no-op.
      // 北向资金接口缓存 key 不要时间戳
      if (request.url.includes('/api/qt/kamtbs.rtmin/get') || request.url.includes('/api/qt/kamt.rtmin/get')) {
        return request.url.substr(0, request.url.lastIndexOf('&_='));
      }
      return request;
    },
  },
];
workbox.routing.registerRoute(
  ({ request }) => request.url.includes('/api/qt'),
  IS_TRADING_TIME
    ? new workbox.strategies.NetworkFirst({
        cacheName: apiCacheName,
        plugins: apiCachePlugins,
      })
    : new workbox.strategies.CacheFirst({
        cacheName: apiCacheName,
        plugins: apiCachePlugins,
      })
);

// service worker通过message和主线程通讯
self.addEventListener('message', event => {
  const replyPort = event.ports[0];
  const message = event.data;
  console.log(`sw message : `, message);
  if (replyPort && message && message.type === 'GET_VERSION') {
    replyPort.postMessage(SW_VERSION);
  }
});
