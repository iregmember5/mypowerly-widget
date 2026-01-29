import { useState, useEffect } from 'react';

let toastId = 0;
const toastListeners = [];

export const toast = {
  push: (notification) => {
    const id = toastId++;
    toastListeners.forEach(listener => listener({ id, notification }));
  }
};

export const Notification = ({ type, children }) => {
  const colors = {
    success: { bg: '#10b981', text: '#fff' },
    danger: { bg: '#ef4444', text: '#fff' },
    info: { bg: '#3b82f6', text: '#fff' }
  };
  
  const color = colors[type] || colors.info;
  
  return (
    <div style={{
      padding: '12px 16px',
      borderRadius: '8px',
      backgroundColor: color.bg,
      color: color.text,
      fontSize: '14px',
      fontWeight: 500,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }}>
      {children}
    </div>
  );
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const listener = (toast) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 3000);
    };
    
    toastListeners.push(listener);
    return () => {
      const index = toastListeners.indexOf(listener);
      if (index > -1) toastListeners.splice(index, 1);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      {toasts.map(t => (
        <div key={t.id}>{t.notification}</div>
      ))}
    </div>
  );
};
