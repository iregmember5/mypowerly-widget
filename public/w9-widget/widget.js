(function() {
  // ============ TESTING CONFIG ============
  const DEV_MODE = false;                                          // Set to true for local testing
  const DEV_WIDGET_URL = 'http://localhost:5174/';                // Local widget URL when DEV_MODE is true
  const DEV_DOMAIN = 'https://test.com';                          // Registered Domain to use for API calls when DEV_MODE is true
  const PROD_WIDGET_URL = 'https://mypowerlywidget.mypowerly.com'; // Live widget URL
  // =========================================

  const widgetId = document.currentScript.getAttribute('id');
  const widgetUrl = DEV_MODE ? DEV_WIDGET_URL : PROD_WIDGET_URL;
  const devParams = DEV_MODE ? `&dev=true&devDomain=${encodeURIComponent(DEV_DOMAIN)}` : '';
  
  if (!widgetId) {
    console.error('Widget ID is required. Add data-widget-id attribute to the script tag.');
    return;
  }

  loadWidget();

  function loadWidget() {
    const existingIframe = document.getElementById('powerly-widget-iframe');
    if (existingIframe) {
      console.log('Widget already loaded');
      return;
    }

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

    const loader = document.createElement('div');
    loader.id = 'powerly-widget-loader';
    loader.innerHTML = '<div style="width:24px;height:24px;border:3px solid #f3f4f6;border-top-color:#6366f1;border-radius:50%;animation:spin 0.8s linear infinite"></div><style>@keyframes spin{to{transform:rotate(360deg)}}</style>';
    loader.style.cssText = `position:fixed;${isMobile ? 'bottom:10px;right:10px' : 'bottom:20px;right:20px'};width:60px;height:60px;background:white;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:flex;align-items:center;justify-content:center;z-index:999999`;
    
    if (document.body) {
      document.body.appendChild(loader);
    } else {
      document.addEventListener('DOMContentLoaded', () => document.body.appendChild(loader));
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'powerly-widget-iframe';
    const cacheBust = DEV_MODE ? '' : '&v=' + Date.now();
    iframe.src = `${widgetUrl}?id=${encodeURIComponent(widgetId)}${devParams}${cacheBust}`;
    
    const baseStyles = {
      position: 'fixed',
      border: 'none',
      zIndex: '999999',
      background: 'transparent',
      transition: 'opacity 0.3s ease',
      opacity: '0',
      pointerEvents: 'none'
    };

    const mobileStyles = {
      bottom: '10px',
      right: '10px',
      width: '100%',
      maxWidth: 'calc(100vw - 20px)',
      height: '100%',
      maxHeight: 'calc(100vh - 20px)'
    };

    const desktopStyles = {
      bottom: '20px',
      right: '20px',
      width: '400px',
      height: '600px'
    };

    const styles = isMobile ? { ...baseStyles, ...mobileStyles } : { ...baseStyles, ...desktopStyles };
    iframe.style.cssText = Object.entries(styles).map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssKey}:${value}`;
    }).join(';');

    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allow', 'clipboard-write');
    
    let widgetReady = false;
    // Keep the visitor's launcher position when the larger panel opens/closes.
    const inset = () => window.innerWidth < 768 ? 10 : 20;
    let position = { right: inset(), bottom: inset() };
    let dragStart = null;
    let requestedSize = { width: 80, height: 80 };
    const widgetOrigin = new URL(widgetUrl).origin;

    function layoutWidget() {
      const margin = 10;
      const width = Math.min(requestedSize.width, Math.max(0, window.innerWidth - margin * 2));
      const height = Math.min(requestedSize.height, Math.max(0, window.innerHeight - margin * 2));
      iframe.style.width = width + 'px';
      iframe.style.height = height + 'px';
      iframe.style.right = Math.min(Math.max(margin, position.right), Math.max(margin, window.innerWidth - width - margin)) + 'px';
      iframe.style.bottom = Math.min(Math.max(margin, position.bottom), Math.max(margin, window.innerHeight - height - margin)) + 'px';
    }

    window.addEventListener('message', function(event) {
      if (event.source !== iframe.contentWindow || event.origin !== widgetOrigin || !event.data) return;
      if (event.data.type === 'WIDGET_DRAG_START') {
        const rect = iframe.getBoundingClientRect();
        dragStart = { right: window.innerWidth - rect.right, bottom: window.innerHeight - rect.bottom };
      } else if (event.data.type === 'WIDGET_DRAG_MOVE' && dragStart) {
        if (!Number.isFinite(event.data.deltaX) || !Number.isFinite(event.data.deltaY)) return;
        position = {
          right: Math.max(10, Math.min(window.innerWidth - iframe.offsetWidth - 10, dragStart.right - event.data.deltaX)),
          bottom: Math.max(10, Math.min(window.innerHeight - iframe.offsetHeight - 10, dragStart.bottom - event.data.deltaY))
        };
        layoutWidget();
      } else if (event.data.type === 'WIDGET_DRAG_END') {
        dragStart = null;
      } else if (event.data.type === 'WIDGET_RESIZE') {
        const width = event.data.width;
        const height = event.data.height;
        
        iframe.style.opacity = '1';
        iframe.style.pointerEvents = 'auto';
        
        if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return;
        requestedSize = { width, height };
        layoutWidget();
      } else if (event.data.type === 'WIDGET_READY') {
        widgetReady = true;
        clearTimeout(errorTimeout);
        iframe.style.opacity = '1';
        iframe.style.pointerEvents = 'auto';
        const loader = document.getElementById('powerly-widget-loader');
        if (loader) loader.remove();
      }
    });

    // Error handling - show error if widget doesn't send WIDGET_READY within 15 seconds
    const errorTimeout = setTimeout(() => {
      if (!widgetReady) {
        const loader = document.getElementById('powerly-widget-loader');
        if (loader) {
          loader.innerHTML = `
            <div style="padding:8px;text-align:center;font-size:11px;color:#dc2626;font-family:system-ui,sans-serif">
              <div style="margin-bottom:4px;font-weight:600">⚠️ Widget Error</div>
              <div>Failed to load</div>
            </div>
          `;
          loader.style.width = '120px';
          loader.style.height = '60px';
          loader.style.cursor = 'pointer';
          loader.onclick = () => location.reload();
        }
      }
    }, 30000);
    
    // Handle iframe loading errors
    iframe.onerror = () => {
      clearTimeout(errorTimeout);
      const loader = document.getElementById('powerly-widget-loader');
      if (loader) {
        loader.innerHTML = `
          <div style="padding:8px;text-align:center;font-size:11px;color:#dc2626;font-family:system-ui,sans-serif">
            <div style="margin-bottom:4px;font-weight:600">⚠️ Connection Error</div>
            <div>Click to retry</div>
          </div>
        `;
        loader.style.width = '120px';
        loader.style.height = '60px';
        loader.style.cursor = 'pointer';
        loader.onclick = () => location.reload();
      }
    };

    let resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        // Clamp the launcher too so it stays reachable after viewport changes.
        position.right = Math.max(10, Math.min(position.right, window.innerWidth - 90));
        position.bottom = Math.max(10, Math.min(position.bottom, window.innerHeight - 90));
        layoutWidget();
      }, 250);
    });
    
    if (document.body) {
      document.body.appendChild(iframe);
    } else {
      document.addEventListener('DOMContentLoaded', function() {
        document.body.appendChild(iframe);
      });
    }
  }
})();
