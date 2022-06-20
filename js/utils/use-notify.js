/**
 * 发送浏览器 Notification 桌面推送通知
 * @param {string} title 标题
 * @param {string} body 内容
 * @returns
 */
const sendWebNotify = async (title, body) => {
  if (!('Notification' in window)) {
    console.warn('该浏览器不支持桌面通知');
    return;
  }
  if (Notification.permission === 'denied') {
    console.error('用户拒绝了桌面通知');
    return;
  }
  if (Notification.permission === 'default') {
    const webNotifyPermission = await Notification.requestPermission();
    return sendWebNotify(title, body);
  }
  const notification = new Notification(title, {
    body,
    icon: '/favicon.ico',
    timestamp: Date.now(),
  });
  return notification;
};

export function useNotify() {
  return {
    sendWebNotify,
  };
}
