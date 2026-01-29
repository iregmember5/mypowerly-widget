import { useState, useEffect, useRef } from 'react';
import Button from './components/Button';
import Input from './components/Input';
import { Notification, toast } from './components/Toast';

const W9Widget = () => {
  const [email, setEmail] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showAIChatbot, setShowAIChatbot] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [note, setNote] = useState('');
  const [selectedForms, setSelectedForms] = useState([]);
  const [availableForms, setAvailableForms] = useState([]);
  const [availableServices, setAvailableServices] = useState({
    serviceRequest: true,
    aiChatbot: true,
    liveChat: true
  });
  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState(null);
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(false);
  const [chatWidgetUrl, setChatWidgetUrl] = useState(null);
  const [showExclamation, setShowExclamation] = useState(true);
  const [siteName, setSiteName] = useState('MyPowerly');
  const contentRef = useRef(null);

  useEffect(() => {
    const showHideExclamation = () => {
      setShowExclamation(true);
      setTimeout(() => setShowExclamation(false), 3000);
    };
    showHideExclamation();
    const interval = setInterval(showHideExclamation, 120000);
    return () => clearInterval(interval);
  }, []);

  const serviceOptions = [
    { value: '', label: 'Choose a service...' },
    ...(availableServices.serviceRequest ? [{ value: 'service-request', label: 'Service Request' }] : []),
    ...(availableServices.aiChatbot ? [{ value: 'ai-chatbot', label: 'AI Chatbot' }] : []),
    ...(availableServices.liveChat ? [{ value: 'live-chat', label: 'Live Chat' }] : [])
  ];

  const urlParams = new URLSearchParams(window.location.search);
  const widgetId = urlParams.get('id');
  const apiUrl = 'https://esign-admin.signmary.com';

  useEffect(() => {
    const validateWidget = async () => {
      if (!widgetId) {
        setValidationError('Widget ID is missing');
        setIsValidating(false);
        return;
      }

      try {
        let currentUrl = document.referrer;
        if (!currentUrl || currentUrl === '') {
          currentUrl = window.location.href;
        }
        
        const isLocalhost = currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1');
        if (isLocalhost) {
          setIsDevelopmentMode(true);
          setValidationError(null);
          setIsValidating(false);
          if (window.parent) {
            window.parent.postMessage({ type: 'WIDGET_READY' }, '*');
          }
          return;
        }
        
        const domain = new URL(currentUrl).origin;
        const validationUrl = `${apiUrl}/blogs/api/v2/widget-settings/validate-frontend-url/`;
        
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
          throw new Error(data.details || data.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        if (data.registered && data.widget_settings) {
          setValidationError(null);
          setSiteName(data.site_name || new URL(domain).hostname);
          
          const settings = data.widget_settings;
          setAvailableServices({
            serviceRequest: settings.service_request_enabled,
            aiChatbot: settings.ai_chatbot_enabled,
            liveChat: settings.live_chat_enabled
          });
          
          if (settings.enabled_forms_details) {
            setAvailableForms(settings.enabled_forms_details);
          }
          
          if (settings.chat_widget_url) {
            setChatWidgetUrl(settings.chat_widget_url);
          }
        } else {
          setValidationError(data.message || 'Domain not registered in MyPowerly Widget settings');
        }
      } catch (error) {
        setValidationError(error.message || 'Failed to validate widget');
      } finally {
        setIsValidating(false);
        if (window.parent) {
          window.parent.postMessage({ type: 'WIDGET_READY' }, '*');
        }
      }
    };

    validateWidget();
  }, [widgetId]);

  useEffect(() => {
    const handleClickOutside = () => setServiceDropdownOpen(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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
    `;
    document.head.appendChild(style);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !phone || selectedForms.length === 0) {
      toast.push(<Notification type="danger">Please fill all required fields</Notification>);
      return;
    }

    if (!widgetId) {
      toast.push(<Notification type="danger">Invalid widget configuration</Notification>);
      return;
    }

    setLoading(true);

    try {
      const currentUrl = document.referrer || window.location.href;
      const domain = new URL(currentUrl).origin;
      
      const payload = {
        frontend_url: domain,
        workspace_id: widgetId,
        form_ids: selectedForms.map(id => parseInt(id)),
        name,
        email,
        phone,
        reference_id: referenceId,
        note
      };

      const response = await fetch('https://esign-admin.signmary.com/api/widgets/submit-form/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        toast.push(<Notification type="success">{data.message || 'Request submitted! Forms will be sent to your email.'}</Notification>);
        setName('');
        setEmail('');
        setPhone('');
        setReferenceId('');
        setNote('');
        setSelectedForms([]);
        setIsOpen(false);
      } else {
        const errorMsg = data.message || data.error || data.details || 'Failed to submit form. Please try again.';
        toast.push(<Notification type="danger">{errorMsg}</Notification>);
      }
    } catch (error) {
      toast.push(<Notification type="danger">Failed to submit form. Please try again.</Notification>);
    } finally {
      setLoading(false);
    }
  };

  const notifyResize = (width, height) => {
    if (window.parent) {
      window.parent.postMessage({ type: 'WIDGET_RESIZE', width, height }, '*');
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setShowServiceForm(false);
    setShowAIChatbot(false);
    setSelectedService('');
    setServiceDropdownOpen(false);
    setName('');
    setEmail('');
    setPhone('');
    setReferenceId('');
    setNote('');
    setSelectedForms([]);
    notifyResize(380, 500);
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowServiceForm(false);
    setShowAIChatbot(false);
    setSelectedService('');
    setServiceDropdownOpen(false);
    setName('');
    setEmail('');
    setPhone('');
    setReferenceId('');
    setNote('');
    setSelectedForms([]);
    notifyResize(80, 80);
  };

  const handleServiceSelect = () => {
    if (!selectedService) {
      toast.push(<Notification type="danger">Please select a service</Notification>);
      return;
    }
    if (selectedService === 'service-request') {
      if (selectedForms.length === 0) {
        toast.push(<Notification type="danger">Please select at least one form type</Notification>);
        return;
      }
      setShowServiceForm(true);
      notifyResize(380, 600);
      setTimeout(() => contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 0);
    } else if (selectedService === 'ai-chatbot') {
      setShowAIChatbot(true);
      notifyResize(380, 500);
    } else if (selectedService === 'live-chat') {
      if (chatWidgetUrl) {
        setShowLiveChat(true);
        notifyResize(380, 600);
      } else {
        toast.push(<Notification type="danger">Live chat not available</Notification>);
      }
    } else {
      toast.push(<Notification type="info">{selectedService} coming soon!</Notification>);
    }
  };

  const handleBackButton = () => {
    setShowServiceForm(false);
    setShowAIChatbot(false);
    setShowLiveChat(false);
    setIframeLoading(true);
    setSelectedService('');
    setServiceDropdownOpen(false);
    notifyResize(380, 500);
  };

  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'fixed',
      bottom: '-5px',
      right: '-5px',
      zIndex: 9999,
      background: 'transparent',
      padding: '15px',
      display: isValidating ? 'none' : 'block',
      pointerEvents: isOpen ? 'auto' : 'none'
    }}>
      <button
        onClick={handleOpen}
        style={{
          width: '70px',
          height: '70px',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          transition: 'transform 0.2s',
          padding: 0,
          display: (isOpen || isValidating) ? 'none' : 'flex',
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
        <img src="/parrot.svg" alt="Chat" style={{ width: '70px', height: '70px', position: 'relative', zIndex: 1 }} />
        <style>{`
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(5px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </button>

      {isOpen && (
        <div style={{
          width: '360px',
          height: showServiceForm ? '580px' : showLiveChat ? '592px' : '480px',
          backgroundColor: 'white',
          borderRadius: '16px',
          border: '2px solid #d1d5db',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          transition: 'height 0.3s ease'
        }}>
          <div style={{
            background: '#2b5a7d',
            color: 'white',
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {(showServiceForm || showAIChatbot || showLiveChat) && (
                <button
                  onClick={handleBackButton}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: 'white',
                    fontSize: '18px',
                    cursor: 'pointer',
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
                  ←
                </button>
              )}
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'white' }}>{siteName}</h3>
            </div>
            <button
              onClick={handleClose}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
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
            overflowY: showLiveChat ? 'hidden' : 'auto',
            overflowX: 'hidden',
            padding: showLiveChat ? '0' : '24px',
            minHeight: 0,
            display: showLiveChat ? 'block' : 'flex',
            flexDirection: 'column'
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
            ) : showAIChatbot ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                minHeight: '300px'
              }}>
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6b7280',
                  fontSize: '14px'
                }}>
                  AI Chatbot - Coming Soon
                </div>
              </div>
            ) : showLiveChat ? (
              <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
                {iframeLoading && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    backgroundColor: 'white'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      border: '4px solid #e5e7eb',
                      borderTop: '4px solid #2b5a7d',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Loading chat...</p>
                  </div>
                )}
                <iframe
                  src={chatWidgetUrl || ''}
                  onLoad={() => setIframeLoading(false)}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    display: 'block',
                    margin: '-30px 0 0 0'
                  }}
                  title="Live Chat"
                />
              </div>

            ) : !showServiceForm ? (
              <>
                <div style={{
                  background: 'linear-gradient(135deg, #2b5a7d 0%, #1e4a63 100%)',
                  margin: '-24px -24px 0 -24px',
                  padding: '32px 24px',
                  textAlign: 'center',
                  color: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <img src="/parrot.svg" alt="Parrot" style={{ width: '48px', height: '48px', marginBottom: '12px', transform: 'scaleX(-1)' }} />
                  <h2 style={{
                    margin: '0 0 8px 0',
                    fontSize: '24px',
                    fontWeight: 600,
                    color: 'white'
                  }}>
                    Welcome to {siteName}
                  </h2>
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
                    Select a service below. We're here to help 24x7.
                  </p>
                </div>

                <div style={{ padding: '20px 0' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#374151'
                  }}>
                    Select a service
                  </label>
                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setServiceDropdownOpen(!serviceDropdownOpen);
                        if (!serviceDropdownOpen) {
                          setTimeout(() => {
                            contentRef.current?.scrollTo({ top: contentRef.current.scrollHeight, behavior: 'smooth' });
                          }, 100);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '10px',
                        fontSize: '14px',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        outline: 'none',
                        transition: 'border 0.2s',
                        color: selectedService ? '#374151' : '#9ca3af'
                      }}
                    >
                      <span>{serviceOptions.find(opt => opt.value === selectedService)?.label || 'Choose a service...'}</span>
                      <span style={{ 
                        transform: serviceDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s'
                      }}>▼</span>
                    </button>
                    {serviceDropdownOpen && (
                      <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        backgroundColor: 'white',
                        border: '2px solid #e5e7eb',
                        borderRadius: '10px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        zIndex: 1000,
                        overflow: 'hidden'
                      }}>
                        {serviceOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedService(option.value);
                              setServiceDropdownOpen(false);
                            }}
                            disabled={!option.value}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              border: 'none',
                              backgroundColor: selectedService === option.value ? '#f0f9ff' : 'white',
                              textAlign: 'left',
                              cursor: option.value ? 'pointer' : 'default',
                              fontSize: '14px',
                              color: option.value ? '#374151' : '#9ca3af',
                              transition: 'background 0.15s'
                            }}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {selectedService === 'service-request' && availableForms.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '12px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#374151'
                    }}>
                      Select form types
                    </label>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}>
                      {availableForms.map((form) => (
                        <button
                          key={form.id}
                          type="button"
                          onClick={() => setSelectedForms([form.id.toString()])}
                          style={{
                            padding: '8px 14px',
                            border: selectedForms.includes(form.id.toString()) ? '2px solid #2b5a7d' : '2px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 600,
                            backgroundColor: selectedForms.includes(form.id.toString()) ? '#f0f9ff' : 'white',
                            color: selectedForms.includes(form.id.toString()) ? '#2b5a7d' : '#374151',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.2s',
                            outline: 'none'
                          }}
                        >
                          {form.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleServiceSelect}
                  disabled={!selectedService || (selectedService === 'service-request' && selectedForms.length === 0)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: (selectedService && (selectedService !== 'service-request' || selectedForms.length > 0)) ? '#2b5a7d' : '#cbd5e1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: (selectedService && (selectedService !== 'service-request' || selectedForms.length > 0)) ? 'pointer' : 'not-allowed',
                    fontSize: '15px',
                    fontWeight: 600,
                    boxShadow: (selectedService && (selectedService !== 'service-request' || selectedForms.length > 0)) ? '0 4px 12px rgba(43, 90, 125, 0.4)' : 'none',
                    transition: 'all 0.2s',
                    opacity: (selectedService && (selectedService !== 'service-request' || selectedForms.length > 0)) ? 1 : 0.6
                  }}
                >
                  Continue →
                </button>
                </div>
              </>

            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  padding: '20px',
                  borderRadius: '12px',
                  marginBottom: '8px',
                  textAlign: 'center'
                }}>
                  <h2 style={{
                    margin: 0,
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#2b5a7d'
                  }}>
                    Request for {selectedForms.map(f => availableForms.find(form => form.id.toString() === f)?.title).join(', ')}
                  </h2>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                    Name *
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    disabled={loading}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={loading}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                    Phone Number *
                  </label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone"
                    disabled={loading}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                    Reference ID
                  </label>
                  <Input
                    type="text"
                    value={referenceId}
                    onChange={(e) => setReferenceId(e.target.value)}
                    placeholder="Enter reference ID"
                    disabled={loading}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                    Note (Optional)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add a note..."
                    disabled={loading}
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'none',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => !loading && (e.currentTarget.style.borderColor = '#2b5a7d')}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                  />
                </div>

                <Button
                  type="submit"
                  variant="solid"
                  loading={loading}
                  style={{ 
                    width: '100%', 
                    backgroundColor: '#2b5a7d', 
                    color: 'white',
                    marginTop: '8px'
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
              </form>
            )}
          </div>

          <div style={{
            padding: '8px',
            textAlign: 'center',
            fontSize: '11px',
            color: '#9ca3af',
            borderTop: '1px solid #e5e7eb'
          }}>
            Powered by <a href="https://mypowerly.com" target="_blank" rel="noopener noreferrer" style={{ color: '#2b5a7d', textDecoration: 'none', fontWeight: 600 }}>MyPowerly</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default W9Widget;
