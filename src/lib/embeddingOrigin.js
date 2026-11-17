export const getEmbeddingOrigin = ({
  ownWindow = window,
  parentWindow = window.parent,
  referrer = document.referrer,
  timeoutMs = 1500,
} = {}) => new Promise((resolve) => {
  const fallback = () => {
    try {
      return new URL(referrer || ownWindow.location.href).origin;
    } catch {
      return ownWindow.location.origin;
    }
  };

  if (parentWindow === ownWindow) {
    resolve(fallback());
    return;
  }

  let timer;
  const onMessage = (event) => {
    if (event.source !== parentWindow || event.data?.type !== 'WIDGET_ORIGIN_RESPONSE') return;
    clearTimeout(timer);
    ownWindow.removeEventListener('message', onMessage);
    resolve(event.origin);
  };

  ownWindow.addEventListener('message', onMessage);
  timer = setTimeout(() => {
    ownWindow.removeEventListener('message', onMessage);
    resolve(fallback());
  }, timeoutMs);
  parentWindow.postMessage({ type: 'WIDGET_ORIGIN_REQUEST' }, '*');
});
