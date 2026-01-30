(function() {
  const widgetId = document.currentScript.getAttribute('id');
  const widgetUrl = 'https://mypowerlywidget.mypowerly.com'; // will be replaced with live widget link
  
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
    iframe.src = `${widgetUrl}?id=${encodeURIComponent(widgetId)}`;
    
    const baseStyles = {
      position: 'fixed',
      border: 'none',
      zIndex: '999999',
      background: 'transparent',
      transition: 'all 0.3s ease',
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

    window.addEventListener('message', function(event) {
      if (event.data.type === 'WIDGET_RESIZE') {
        const width = event.data.width;
        const height = event.data.height;
        
        iframe.style.opacity = '1';
        iframe.style.pointerEvents = 'auto';
        
        if (isMobile) {
          iframe.style.width = Math.min(width, window.innerWidth - 20) + 'px';
          iframe.style.height = Math.min(height, window.innerHeight - 20) + 'px';
        } else {
          iframe.style.width = width + 'px';
          iframe.style.height = height + 'px';
        }
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
        const newIsMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
        
        if (newIsMobile) {
          iframe.style.maxWidth = 'calc(100vw - 20px)';
          iframe.style.maxHeight = 'calc(100vh - 20px)';
          iframe.style.bottom = '10px';
          iframe.style.right = '10px';
        } else {
          iframe.style.maxWidth = 'none';
          iframe.style.maxHeight = 'none';
          iframe.style.bottom = '20px';
          iframe.style.right = '20px';
        }
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
