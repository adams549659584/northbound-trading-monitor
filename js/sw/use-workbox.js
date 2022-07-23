export async function useWorkbox() {
  let swRegistration;
  if ('serviceWorker' in navigator) {
    const { Workbox } = await import('./workbox-window.prod.js');

    const wb = new Workbox('sw.js');
    wb.addEventListener('activated', event => {
      console.log(`离线就绪 : `);
      console.log(`activated : `, event);
      console.log(`activated isUpdate : `, event.isUpdate);
      if (event.isUpdate) {
        // 更新
        console.log(`sw 有更新，reload() `);
        // Refresh current page to use the updated HTML and other assets after SW has skiped waiting
        wb.messageSkipWaiting();
        window.location.reload(true);
      }
    });
    wb.addEventListener('waiting', event => {
      console.log(`waiting : `, event);
    });
    wb.addEventListener('externalwaiting', event => {
      console.log(`externalwaiting : `, event);
    });
    swRegistration = await wb.register({ immediate: false });
    // .then(registration => {
    //   console.log(`sw 注册完毕 ： `, registration);
    //   return registration;
    // })
    // .catch(event => {
    //   console.error('sw 注册错误:', event);
    //   return Promise.reject(event);
    // });

    const swVersion = await wb.messageSW({ type: 'GET_VERSION' });
    console.log('Service Worker version:', swVersion);
  }

  return {
    swRegistration,
  };
}
