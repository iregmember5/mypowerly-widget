import WidgetFooter, { readFooterContent } from './components/WidgetFooter';
import WidgetHome from './components/WidgetHome';
import { WidgetBrandAvatar } from './components/PartnerLogos';
import { useState, useEffect, useRef, useCallback } from 'react';
import W9QuickRequest from './components/W9QuickRequest';
import { DemoAiChat, DemoService } from './components/DemoServices';
import { readPublicTaxChoices, taxSelectionPayload, deliveryConfirmed, publicMessage, selectionUnavailable } from './lib/publicTaxForms';
import { getEmbeddingOrigin } from './lib/embeddingOrigin';
import { Notification, toast } from './components/Toast';

class PublicWidgetError extends Error {}
const API_BASE_URLS = ['https://mypowerly.com/v1', 'https://esign-admin.signmary.com'];
const shortcutIcons = {
  chat: 'M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l1.6-4.1A8.5 8.5 0 1 1 21 11.5ZM8 12h.01M12 12h.01M16 12h.01',
  'email-us': 'M3 5h18v14H3zM3 6l9 7 9-7',
  'contact-us': 'M5 3h4l2 5-2.5 2a13 13 0 0 0 5.5 5.5l2-2.5 5 2v4a2 2 0 0 1-2 2C10.2 21 3 13.8 3 5a2 2 0 0 1 2-2Z',
  'pay-us': 'M3 5h18v14H3zM3 10h18M7 15h5',
  'schedule-an-appointment': 'M3 5h18v16H3zM7 3v4m10-4v4M3 10h18m-9 3v5m-2.5-2.5h5',
  'schedule-a-tour': 'M3 5h18v16H3zM7 3v4m10-4v4M3 10h18m-14 4h3m4 0h3m-10 3h3m4 0h3',
};

const shortcutButtonClass = 'widget-gradient-button pointer-events-auto grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-white text-white shadow-md transition-[filter,transform] duration-200 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white';

const panelHeight = 580;

const notifyResize = (width, height) => window.parent.postMessage({ type: 'WIDGET_RESIZE', width, height }, '*');

const W9Widget = () => {
  const [email, setEmail] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [chatTab, setChatTab] = useState(null);
  const [demoService, setDemoService] = useState(null);
  const [hasOpenedLiveChat, setHasOpenedLiveChat] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [shortcutMenuMounted, setShortcutMenuMounted] = useState(false);
  const [shortcutTooltip, setShortcutTooltip] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [w9ChaserEnabled, setW9ChaserEnabled] = useState(false);
  const [w9SentTo, setW9SentTo] = useState('');
  const [formDefinitions, setFormDefinitions] = useState([]);
  const [formDefinitionId, setFormDefinitionId] = useState('');
  const [sentFormCode, setSentFormCode] = useState('');
  const [sentMessage, setSentMessage] = useState('');
  const [taxError, setTaxError] = useState('');
  const [choicesNotice, setChoicesNotice] = useState('');
  const [refreshingChoices, setRefreshingChoices] = useState(false);
  const [vendorTypes, setVendorTypes] = useState([]);
  const [compliancePackets, setCompliancePackets] = useState([]);
  const [vendorType, setVendorType] = useState('');
  const [compliancePacketId, setCompliancePacketId] = useState('');
  const frontendOriginRef = useRef(null);

  const resetW9Options = () => {
    setFormDefinitionId(formDefinitions[0]?.key || '');
    setVendorType(vendorTypes[0]?.value || '');
    setCompliancePacketId('');
    setTaxError('');
    setChoicesNotice('');
  };

  const selectVendorType = (value) => {
    setVendorType(value);
  };
  const submittingRef = useRef(false);
  const [availableServices, setAvailableServices] = useState({
    aiChatbot: true,
    liveChat: true
  });
  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState(null);
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(false);
  const [chatWidgetUrl, setChatWidgetUrl] = useState(null);
  const [apiBaseUrl, setApiBaseUrl] = useState(null);
  const [showExclamation, setShowExclamation] = useState(true);
  const [siteName, setSiteName] = useState('MyPowerly');
  const [siteDomain, setSiteDomain] = useState('');
  const [footerContent, setFooterContent] = useState(() => readFooterContent({}, 'MyPowerly'));
  const contentRef = useRef(null);
  const launcherDrag = useRef(null);
  const suppressLauncherClick = useRef(false);

  const postDrag = (type, event, start) => {
    window.parent.postMessage({ type, deltaX: event.screenX - start.x, deltaY: event.screenY - start.y }, '*');
  };

  const startLauncherDrag = (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    suppressLauncherClick.current = false;
    launcherDrag.current = { id: event.pointerId, x: event.screenX, y: event.screenY, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.style.cursor = 'grabbing';
    postDrag('WIDGET_DRAG_START', event, launcherDrag.current);
  };

  const moveLauncherDrag = (event) => {
    const start = launcherDrag.current;
    if (!start || start.id !== event.pointerId) return;
    if (Math.hypot(event.screenX - start.x, event.screenY - start.y) > 5) start.moved = true;
    if (start.moved) postDrag('WIDGET_DRAG_MOVE', event, start);
  };

  const endLauncherDrag = (event) => {
    const start = launcherDrag.current;
    if (!start || start.id !== event.pointerId) return;
    suppressLauncherClick.current = start.moved;
    launcherDrag.current = null;
    event.currentTarget.style.cursor = 'grab';
    postDrag('WIDGET_DRAG_END', event, start);
  };

  useEffect(() => {
    const showHideExclamation = () => {
      setShowExclamation(true);
      setTimeout(() => setShowExclamation(false), 3000);
    };
    showHideExclamation();
    const interval = setInterval(showHideExclamation, 120000);
    return () => clearInterval(interval);
  }, []);

  const chatTabs = [
    ...(availableServices.aiChatbot ? [{ id: 'ai', label: 'AI Chat' }] : []),
    ...(availableServices.liveChat ? [{ id: 'live', label: 'Live Chat' }] : []),
  ];
  const serviceOptions = [
    { value: '', label: 'Choose a service...' },
    { value: 'email-us', label: 'Email Us' },
    { value: 'contact-us', label: 'Contact Us' },
    { value: 'pay-us', label: 'Pay Us' },
    ...(w9ChaserEnabled ? [{ value: 'w9-request', label: 'W9 - Vendor Compliance' }] : []),
    { value: 'schedule-an-appointment', label: 'Schedule and Appointment' },
    ...(chatTabs.length ? [{ value: 'chat', label: 'Chat' }] : []),
    { value: 'schedule-a-tour', label: 'Schedule a Tour' },
  ];

  const urlParams = new URLSearchParams(window.location.search);
  const widgetId = urlParams.get('id');
  const canShowShortcuts = Boolean(widgetId && apiBaseUrl && !isDevelopmentMode && !validationError);
  const shortcutCount = serviceOptions.length - 1;

  useEffect(() => {
    if (isValidating) return;
    if (isOpen) {
      const frameHeight = panelHeight + 20 + (canShowShortcuts ? 72 : 0);
      notifyResize(canShowShortcuts ? 444 : 380, frameHeight);
      return;
    }
    const expanded = canShowShortcuts && shortcutMenuMounted;
    notifyResize(expanded ? 246 : canShowShortcuts ? 152 : 80, expanded ? 80 + shortcutCount * 52 : 80);
  }, [isOpen, isValidating, canShowShortcuts, shortcutMenuMounted, shortcutCount]);
  useEffect(() => {
    if (shortcutsOpen || !shortcutMenuMounted) return;
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 330;
    const timer = setTimeout(() => setShortcutMenuMounted(false), delay);
    return () => clearTimeout(timer);
  }, [shortcutsOpen, shortcutMenuMounted]);
  const devMode = urlParams.get('dev') === 'true';
  const devDomain = urlParams.get('devDomain') || 'https://test.com';

  const applyWidgetSettings = useCallback((data, domain, requireSelection = false) => {
    setValidationError(null);
    setSiteName(data.site_name || new URL(domain).hostname);
    setSiteDomain(new URL(domain).hostname);
    const settings = data.widget_settings;
    const choices = readPublicTaxChoices(settings);
    setW9ChaserEnabled(choices.enabled);
    setFormDefinitions(choices.forms);
    setFormDefinitionId(requireSelection ? '' : choices.forms[0]?.key || '');
    setVendorTypes(choices.vendors);
    setVendorType(requireSelection ? '' : choices.vendors[0]?.value || '');
    setCompliancePackets(choices.packets);
    setCompliancePacketId('');
    setAvailableServices({
      aiChatbot: settings.ai_chatbot_enabled,
      liveChat: settings.live_chat_enabled
    });
    setChatWidgetUrl(settings.live_chat_url || null);
    setFooterContent(readFooterContent(settings));
  }, []);

  useEffect(() => { 
    const validateWidget = async () => {
      if (!widgetId) {
        setValidationError('Widget ID is missing');
        setIsValidating(false);
        return;
      }

      try {
        setApiBaseUrl(null);
        let currentUrl = await getEmbeddingOrigin();
        const isLocalhost = currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1');
        if (isLocalhost) {
          if (!devMode) {
            setIsDevelopmentMode(true);
            setApiBaseUrl(API_BASE_URLS[0]);
            setValidationError(null);
            setIsValidating(false);
            if (window.parent) {
              window.parent.postMessage({ type: 'WIDGET_READY' }, '*');
            }
            return;
          }
          currentUrl = devDomain;
        }
        
        const domain = new URL(currentUrl).origin;
        frontendOriginRef.current = domain;
        const validationPath = '/blogs/api/v2/widget-settings/validate-frontend-url/';

        let lastUnregisteredResponse = null;

        for (const baseUrl of API_BASE_URLS) {
          const validationUrl = `${baseUrl}${validationPath}`;
          const response = await fetch(validationUrl, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            mode: 'cors',
            credentials: 'omit',
            body: JSON.stringify({ frontend_url: domain, workspace_id: widgetId })
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new PublicWidgetError(publicMessage(data, 'Unable to validate this widget. Please try again.'));
          }
          
          if (data.success !== false && data.registered && data.widget_settings) {
            setApiBaseUrl(baseUrl);
            applyWidgetSettings(data, domain);

            lastUnregisteredResponse = null;
            break;
          }

          const isFrontendNotRegistered = data?.registered === false
            && data?.message === 'Frontend URL is not registered';

          if (isFrontendNotRegistered) {
            lastUnregisteredResponse = data;
            continue;
          }

          setValidationError(data.message || 'Domain not registered in MyPowerly Widget settings');
          lastUnregisteredResponse = null;
          break;
        }

        if (lastUnregisteredResponse) {
          setValidationError(lastUnregisteredResponse.message || 'Domain not registered in MyPowerly Widget settings');
        }
      } catch (error) {
        setValidationError(error instanceof PublicWidgetError ? error.message : 'Unable to validate this widget. Please try again.');
      } finally {
        setIsValidating(false);
        if (window.parent) {
          window.parent.postMessage({ type: 'WIDGET_READY' }, '*');
        }
      }
    };

    validateWidget();
  }, [widgetId, devMode, devDomain, applyWidgetSettings]);

  useEffect(() => {
    document.body.style.backgroundColor = 'transparent';
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';
    const root = document.getElementById('root');
    if (root) {
      root.style.backgroundColor = 'transparent';
    }
    
    const style = document.createElement('style');
    style.innerHTML = `
      .toast-notification-container {
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        top: auto !important;
        z-index: 10000 !important;
      }
      
      html, body {
        overflow: hidden !important;
        position: fixed !important;
        width: 100% !important;
        height: 100% !important;
      }

      @keyframes spin { 
        0% { transform: rotate(0deg); } 
        100% { transform: rotate(360deg); } 
      }
    `;
    document.head.appendChild(style);
  }, []);

  const siteOrigin = () => {
    if (frontendOriginRef.current) return frontendOriginRef.current;
    let currentUrl = document.referrer || window.location.href;
    const hostname = new URL(currentUrl).hostname;
    if ((hostname === 'localhost' || hostname === '127.0.0.1') && devMode) currentUrl = devDomain;
    return new URL(currentUrl).origin;
  };

  const refreshPublicChoices = async () => {
    if (!apiBaseUrl || refreshingChoices) return;
    setRefreshingChoices(true);
    setFormDefinitionId('');
    setFormDefinitions([]);
    setCompliancePacketId('');
    setCompliancePackets([]);
    setVendorType('');
    setVendorTypes([]);
    setChoicesNotice('Refreshing available forms and packets…');
    try {
      const domain = siteOrigin();
      const response = await fetch(`${apiBaseUrl}/blogs/api/v2/widget-settings/validate-frontend-url/`, {
        method: 'POST', credentials: 'omit',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ frontend_url: domain, workspace_id: widgetId })
      });
      const data = await response.json();
      if (!response.ok || data.success === false || !data.registered || !data.widget_settings) {
        throw new PublicWidgetError(publicMessage(data, 'Unable to refresh available choices. Please try again.'));
      }
      applyWidgetSettings(data, domain, true);
      setChoicesNotice('Choices refreshed. Please select your tax form and optional packet again.');
    } catch (error) {
      setChoicesNotice('');
      setTaxError(error instanceof PublicWidgetError ? error.message : 'Unable to refresh available choices. Please try again.');
    } finally {
      setRefreshingChoices(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current || refreshingChoices) return;
    setTaxError('');
    if (!name.trim() || !email.trim()) {
      toast.push(<Notification type="danger">Please fill all required fields</Notification>);
      return;
    }
    if (!widgetId || !apiBaseUrl || !w9ChaserEnabled) {
      setTaxError('Tax form requests are unavailable for this website.');
      toast.push(<Notification type="danger">Invalid widget configuration</Notification>);
      return;
    }
    let taxSelection;
    try {
      taxSelection = taxSelectionPayload({ forms: formDefinitions, vendors: vendorTypes, packets: compliancePackets }, formDefinitionId, vendorType, compliancePacketId);
    } catch (error) {
      setTaxError(error.message);
      return;
    }
    submittingRef.current = true;
    setLoading(true);
    try {
      const payload = {
        frontend_url: siteOrigin(), workspace_id: widgetId,
        form_ids: [],
        name: name.trim(), email: email.trim(), phone: phone.trim(),
        reference_id: referenceId.trim(), note: '', ...taxSelection
      };
      const response = await fetch(`${apiBaseUrl}/api/widgets/submit-form/`, {
        method: 'POST', credentials: 'omit', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok && deliveryConfirmed(data)) {
        const message = publicMessage(data, 'Your request was sent. Check your email.');
        toast.push(<Notification type="success">{message}</Notification>);
        setSentFormCode(formDefinitions.find(form => form.key === formDefinitionId)?.code || 'tax form');
        setSentMessage(message);
        setW9SentTo(email.trim());
        setTimeout(() => contentRef.current?.scrollTo({ top: 0 }), 0);
        setName(''); setEmail(''); setPhone(''); setReferenceId('');
      } else {
        const message = data.success === true && response.ok
          ? 'Your request was accepted, but email delivery has not been confirmed. Please check your inbox before sending again.'
          : publicMessage(data, 'Unable to send your request. Please try again.');
        setTaxError(message);
        toast.push(<Notification type="danger">{message}</Notification>);
        if (selectionUnavailable(data)) {
          await refreshPublicChoices();
          setTimeout(() => contentRef.current?.scrollTo({ top: 0 }), 0);
        }
      }
    } catch {
      const message = 'Unable to send your request. Please try again.';
      setTaxError(message);
      toast.push(<Notification type="danger">{message}</Notification>);
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  const selectChatTab = (tab) => {
    setChatTab(tab);
    if (tab === 'live') setHasOpenedLiveChat(true);
  };

  const resetChat = () => {
    setChatTab(null);
    setHasOpenedLiveChat(false);
    setIframeLoading(true);
  };

  const handleOpen = () => {
    setShortcutTooltip(null);
    setIsOpen(true);
    setShowServiceForm(false);
    setDemoService(null);
    resetChat();
    setSelectedService('');
    setName('');
    setEmail('');
    setPhone('');
    setReferenceId('');
    setW9SentTo('');
    resetW9Options();
    setTimeout(() => contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  const handleClose = () => {
    setShortcutTooltip(null);
    setIsOpen(false);
    setShowServiceForm(false);
    setDemoService(null);
    resetChat();
    setSelectedService('');
    setName('');
    setEmail('');
    setPhone('');
    setReferenceId('');
    setW9SentTo('');
    resetW9Options();
  };

  const handleServiceSelect = (service) => {
    if (!service) {
      toast.push(<Notification type="danger">Please select a service</Notification>);
      return;
    }
    if (service === 'w9-request') {
      if (!w9ChaserEnabled) return;
      setShowServiceForm(true);
      setTimeout(() => contentRef.current?.scrollTo({ top: 0 }), 0);
    } else if (service === 'chat') {
      if (!chatTabs.length) return;
      selectChatTab(chatTabs[0].id);
      contentRef.current?.scrollTo({ top: 0 });
    } else {
      setDemoService(service);
      contentRef.current?.scrollTo({ top: 0 });
    }
  };

  const activeService = showServiceForm ? 'w9-request' : chatTab ? 'chat' : demoService;
  const headerTitle = activeService ? serviceOptions.find(option => option.value === activeService)?.label || 'Chat' : siteDomain || siteName;

  const showShortcutTooltip = (button, label) => {
    const rect = button.getBoundingClientRect();
    setShortcutTooltip({ label, top: rect.top + rect.height / 2, right: window.innerWidth - rect.left + 9 });
  };

  const handleShortcutClick = (service) => {
    setShortcutTooltip(null);
    if (loading) return;
    if (isOpen && activeService === service) {
      handleClose();
      return;
    }
    handleOpen();
    setSelectedService(service);
    handleServiceSelect(service);
  };

  const handleBackButton = () => {
    setShowServiceForm(false);
    setDemoService(null);
    resetChat();
    setW9SentTo('');
    resetW9Options();
    setSelectedService('');
    setTimeout(() => contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  };

  return (
    <div style={{ 
      fontFamily: "'Poppins', system-ui, -apple-system, sans-serif",
      position: 'fixed',
      bottom: '-5px',
      right: '-5px',
      zIndex: 9999,
      background: 'transparent',
      padding: '15px',
      paddingBottom: isOpen && canShowShortcuts ? '87px' : '15px',
      paddingRight: isOpen && canShowShortcuts ? '79px' : '15px',
      display: isValidating ? 'none' : 'block',
      pointerEvents: isOpen ? 'auto' : 'none'
    }}>
      {(!isOpen || canShowShortcuts) && (
        <div className="flex items-end gap-2" style={isOpen ? { position: 'absolute', right: 15, bottom: 15 } : undefined}>
          <button
            aria-label={isOpen ? 'Close widget' : 'Open widget — drag to move'}
            aria-expanded={isOpen}
            title={isOpen ? 'Click to close, or drag to move' : 'Click to open, or drag to move'}
            onPointerDown={startLauncherDrag}
            onPointerMove={moveLauncherDrag}
            onPointerUp={endLauncherDrag}
            onPointerCancel={endLauncherDrag}
            onLostPointerCapture={endLauncherDrag}
            onClick={(event) => {
              if (loading || (suppressLauncherClick.current && event.detail !== 0)) return;
              if (isOpen) handleClose();
              else handleOpen();
            }}
            style={{
              touchAction: 'none',
              userSelect: 'none',
              width: '70px',
              height: '70px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'grab',
              transition: 'transform 0.2s',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              pointerEvents: 'auto'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {showExclamation && (
              <div style={{
                position: 'absolute',
                top: '-45px',
                right: '-10px',
                backgroundColor: 'white',
                color: '#2b5a7d',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                whiteSpace: 'nowrap',
                animation: 'fadeIn 0.3s ease-in'
              }}>
                We're here! 👋
                <div style={{
                  position: 'absolute',
                  bottom: '-6px',
                  right: '20px',
                  width: '0',
                  height: '0',
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: '6px solid white'
                }}></div>
              </div>
            )}
            <img draggable={false} src="/parrot.svg" alt="Chat" style={{ width: '70px', height: '70px', position: 'relative', zIndex: 1 }} />
            <style>{`
              @keyframes shortcut-pop {
                from { opacity: 0; transform: translateY(var(--shortcut-rise)) scale(0.55); }
                to { opacity: 1; transform: translateY(0) scale(1); }
              }
              @keyframes shortcut-pop-out {
                from { opacity: 1; transform: translateY(0) scale(1); }
                to { opacity: 0; transform: translateY(var(--shortcut-rise)) scale(0.55); }
              }
              @keyframes fadeIn {
                0% { opacity: 0; transform: translateY(5px); }
                100% { opacity: 1; transform: translateY(0); }
              }
            `}</style>
          </button>
          {canShowShortcuts && (
            <div className="relative">
              <button
                type="button"
                className={shortcutButtonClass}
                style={{ width: 52, height: 52, background: shortcutsOpen ? '#f5a623' : undefined, color: shortcutsOpen ? '#0b1d51' : '#fff' }}
                aria-label={shortcutsOpen ? 'Hide service shortcuts' : 'Show service shortcuts'}
                aria-expanded={shortcutsOpen}
                aria-controls="widget-service-shortcuts"
                onClick={() => {
                  setShortcutTooltip(null);
                  if (!shortcutsOpen) setShortcutMenuMounted(true);
                  setShortcutsOpen(open => !open);
                }}
              >
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="5" cy="12" r="2.2" />
                  <circle cx="12" cy="12" r="2.2" />
                  <circle cx="19" cy="12" r="2.2" />
                </svg>
              </button>
              {shortcutMenuMounted && (
                <div
                  id="widget-service-shortcuts"
                  role="group"
                  aria-label="Service shortcuts"
                  aria-hidden={!shortcutsOpen}
                  inert={!shortcutsOpen}
                  onScroll={() => setShortcutTooltip(null)}
                  className={(shortcutsOpen ? 'pointer-events-auto' : 'pointer-events-none') + ' absolute bottom-full right-0 mb-2 max-h-[calc(100dvh-76px)] overflow-y-auto [scrollbar-width:none]'}
                >
                  <div className="flex flex-col gap-2">
                    {serviceOptions.filter(option => option.value).map((option, index) => (
                      <button
                        key={option.value}
                        type="button"
                        className={shortcutButtonClass + (shortcutsOpen ? ' motion-safe:animate-[shortcut-pop_240ms_ease-out_both]' : ' motion-safe:animate-[shortcut-pop-out_170ms_ease-in_both]')}
                        style={{ '--shortcut-rise': ((shortcutCount - index) * 52 + 4) + 'px', animationDelay: ((shortcutsOpen ? shortcutCount - index - 1 : index) * 30) + 'ms' }}
                        aria-label={option.label}
                        disabled={!shortcutsOpen}
                        onPointerEnter={event => {
                          if (event.pointerType === 'mouse') showShortcutTooltip(event.currentTarget, option.label);
                        }}
                        onPointerLeave={event => {
                          if (!event.currentTarget.matches(':focus-visible')) setShortcutTooltip(null);
                        }}
                        onFocus={event => {
                          if (event.currentTarget.matches(':focus-visible')) showShortcutTooltip(event.currentTarget, option.label);
                        }}
                        onBlur={() => setShortcutTooltip(null)}
                        aria-pressed={isOpen && activeService === option.value}
                        onClick={() => handleShortcutClick(option.value)}
                      >
                        {option.value === 'w9-request' ? (
                          <span aria-hidden="true" className="text-sm font-bold">W9</span>
                        ) : (
                          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <path d={shortcutIcons[option.value]} />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {shortcutsOpen && shortcutTooltip && (
        <div
          aria-hidden="true"
          style={{ top: shortcutTooltip.top, right: shortcutTooltip.right }}
          className="pointer-events-none fixed z-50 -translate-y-1/2 whitespace-nowrap rounded-md bg-gray-950 px-2.5 py-1.5 text-xs font-medium text-white shadow-md"
        >
          {shortcutTooltip.label}
          <span className="absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-gray-950" />
        </div>
      )}

      {isOpen && (
        <div style={{
          width: canShowShortcuts ? 'min(360px, calc(100vw - 88px))' : 'min(360px, calc(100vw - 24px))',
          maxHeight: canShowShortcuts ? 'calc(100dvh - 96px)' : 'calc(100dvh - 24px)',
          height: panelHeight,
          backgroundColor: 'white',
          borderRadius: '20px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          transition: 'height 0.3s ease'
        }}>
          <div style={{
            background: 'linear-gradient(100deg, #06153c, #071f52)',
            color: 'white',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
              {!showServiceForm && !chatTab && !demoService && <WidgetBrandAvatar className="h-10 w-10 p-1" />}
              {(showServiceForm || chatTab || demoService) && (
                <button
                  type="button"
                  onClick={handleBackButton}
                  disabled={loading}
                  aria-label="Back to services"
                  className="shrink-0 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white hover:opacity-75 disabled:opacity-50"
                  style={{ width: 36, height: 40, padding: 0, background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 5-7 7 7 7" />
                  </svg>
                </button>
              )}
              <h3 title={headerTitle} style={{ margin: 0, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '19px', fontWeight: 600, color: 'white' }}>{headerTitle}</h3>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
                flexShrink: 0,
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            >
              ×
            </button>
          </div>
          <div ref={contentRef} style={{ 
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: chatTab ? '0' : '10px',
            paddingBottom: '14px',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overscrollBehavior: 'contain'
          }}>
            {isValidating ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '300px',
                gap: '16px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid #e5e7eb',
                  borderTop: '4px solid #2b5a7d',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Validating widget...</p>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              </div>
            ) : isDevelopmentMode ? (
              <div style={{
                padding: '24px',
                backgroundColor: '#fff7ed',
                border: '2px solid #fed7aa',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔧</div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 700, color: '#ea580c' }}>Development Preview</h3>
                <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
                  You're viewing this widget on localhost. Full functionality is only available when embedded on a registered live website.
                </p>
              </div>
            ) : validationError ? (
              <div style={{
                padding: '24px',
                backgroundColor: '#fee',
                border: '2px solid #fcc',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                  {validationError.includes('Widget ID') || validationError.includes('valid UUID') || validationError.includes('Internal Server Error') ? '⚙️' : '🚫'}
                </div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 700, color: '#c00' }}>
                  {validationError.includes('Widget ID') || validationError.includes('valid UUID') || validationError.includes('Internal Server Error') ? 'Invalid Widget ID' : 'Site Not Registered'}
                </h3>
                {validationError.includes('Widget ID') || validationError.includes('valid UUID') || validationError.includes('Internal Server Error') ? (
                  <>
                    <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
                      The Widget ID is missing or invalid. Please check your embed code.
                    </p>
                    <p style={{ margin: '0', color: '#888', fontSize: '12px', fontStyle: 'italic' }}>
                      Go back to <a href="https://mypowerly.com" target="_blank" rel="noopener noreferrer" style={{ color: '#2b5a7d', textDecoration: 'none', fontWeight: 'bold' }}>mypowerly.com</a>, regenerate the embed code and replace it.
                    </p>
                  </>
                ) : (
                  <>
                    <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
                      Your website is not registered with MyPowerly. To use this widget:
                    </p>
                    <div style={{ textAlign: 'left', backgroundColor: '#fff', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                      <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#555', lineHeight: '1.6' }}>
                        <li>Go to <u><a href="https://mypowerly.com" target="_blank" rel="noopener noreferrer" style={{ color: '#2b5a7d', textDecoration: 'none', fontWeight: 'bold' }}>mypowerly.com</a></u></li>
                        <li>Navigate to <strong>Widgets</strong> from sidebar</li>
                        <li>Select <strong>MyPowerly Widget</strong></li>
                        <li>Register your domain/website</li>
                      </ol>
                    </div>
                    <p style={{ margin: 0, color: '#888', fontSize: '12px', fontStyle: 'italic' }}>
                      Widget can only be embedded on registered sites. After registration, regenerate and replace your embed code.
                    </p>
                  </>
                )}
              </div>
            ) : !widgetId ? (
              <div style={{
                padding: '20px',
                backgroundColor: '#fee',
                border: '1px solid #fcc',
                borderRadius: '8px',
                color: '#c00',
                textAlign: 'center'
              }}>
                Invalid widget configuration. Widget ID is required.
              </div>
            ) : chatTab ? (
              <div className="flex min-h-0 flex-1 flex-col">
                <div role="tablist" aria-label="Chat type" className="flex shrink-0 border-b border-gray-200">
                  {chatTabs.map((tab, index) => (
                    <button
                      key={tab.id}
                      id={`chat-tab-${tab.id}`}
                      type="button"
                      role="tab"
                      aria-selected={chatTab === tab.id}
                      aria-controls={`chat-panel-${tab.id}`}
                      tabIndex={chatTab === tab.id ? 0 : -1}
                      onClick={() => selectChatTab(tab.id)}
                      onKeyDown={(event) => {
                        const last = chatTabs.length - 1;
                        let next;
                        switch (event.key) {
                          case 'ArrowRight': next = (index + 1) % chatTabs.length; break;
                          case 'ArrowLeft': next = (index + last) % chatTabs.length; break;
                          case 'Home': next = 0; break;
                          case 'End': next = last; break;
                          default: return;
                        }
                        event.preventDefault();
                        const nextTab = chatTabs[next].id;
                        selectChatTab(nextTab);
                        document.getElementById(`chat-tab-${nextTab}`)?.focus();
                      }}
                      className={`min-h-7 flex-1 border-b-2 px-2 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#2b5a7d] ${chatTab === tab.id ? 'border-[#2b5a7d] text-[#2b5a7d]' : 'border-transparent text-gray-600'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                {availableServices.aiChatbot && (
                  <div id="chat-panel-ai" role="tabpanel" aria-labelledby="chat-tab-ai" tabIndex={0} hidden={chatTab !== 'ai'} className="min-h-0 flex-1">
                    <DemoAiChat siteName={siteName} />
                  </div>
                )}
                {availableServices.liveChat && (
                  <div id="chat-panel-live" role="tabpanel" aria-labelledby="chat-tab-live" tabIndex={0} hidden={chatTab !== 'live'} className="relative min-h-0 flex-1 overflow-hidden">
                    {!chatWidgetUrl ? (
                      <p className="p-4 text-center text-sm text-gray-600">Live chat is currently unavailable.</p>
                    ) : hasOpenedLiveChat && (
                      <>
                        {iframeLoading && (
                          <p role="status" className="absolute inset-0 grid place-content-center bg-white text-sm text-gray-600">Loading chat…</p>
                        )}
                        <iframe
                          src={chatWidgetUrl}
                          onLoad={() => setIframeLoading(false)}
                          style={{ width: '100%', height: 'calc(100% + 30px)', border: 'none', display: 'block', marginTop: '-30px' }}
                          title="Live Chat"
                        />
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : demoService ? (
              <DemoService key={demoService} service={demoService} />
            ) : !showServiceForm ? (
              <WidgetHome
                siteName={siteName}
                options={serviceOptions}
                selectedService={selectedService}
                onServiceChange={value => { setSelectedService(value); setW9SentTo(''); }}
                onContinue={() => handleServiceSelect(selectedService)}
                scrollContainerRef={contentRef}
              />
            ) : (
              <W9QuickRequest
                name={name} setName={setName} email={email} setEmail={setEmail}
                phone={phone} setPhone={setPhone} referenceId={referenceId} setReferenceId={setReferenceId}
                vendorTypes={vendorTypes} vendorType={vendorType} onVendorTypeChange={selectVendorType}
                compliancePackets={compliancePackets} compliancePacketId={compliancePacketId}
                onCompliancePacketChange={setCompliancePacketId}
                formDefinitions={formDefinitions} formDefinitionId={formDefinitionId} onFormDefinitionChange={(value) => { setFormDefinitionId(value); setTaxError(''); setChoicesNotice(''); }}
                sentFormCode={sentFormCode} sentMessage={sentMessage} requestError={taxError} choicesNotice={choicesNotice}
                refreshing={refreshingChoices} onRefresh={refreshPublicChoices} enabled={w9ChaserEnabled}
                loading={loading} onSubmit={handleSubmit} sentTo={w9SentTo} onReset={() => { setW9SentTo(''); resetW9Options(); }}
              />
            )}
          </div>

          <WidgetFooter content={footerContent} />
        </div>
      )}
    </div>
  );
};

export default W9Widget;
