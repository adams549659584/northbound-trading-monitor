// 引入workbox 框架
importScripts('./js/sw/workbox-sw.js');

const SW_VERSION = '1.0.0';

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
  /\.(?:png|jpg|jpeg|svg|gif)$/,
  new workbox.strategies.CacheFirst({
    cacheName: 'northbound-trading-monitor-image',
  })
);
// css
workbox.routing.registerRoute(
  /\.css$/,
  new workbox.strategies.CacheFirst({
    cacheName: 'northbound-trading-monitor-css',
  })
);
// js
workbox.routing.registerRoute(
  /\.js$/,
  new workbox.strategies.CacheFirst({
    cacheName: 'northbound-trading-monitor-js',
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
