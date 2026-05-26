import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  const toast = useCallback({
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
    warn: (msg) => addToast(msg, 'warn'),
  }, [addToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={S.container}>
        {toasts.map((t) => (
          <div key={t.id} style={{ ...S.toast, ...S[t.type] }}>
            <span style={S.icon}>{t.type === 'success' ? '\u2713' : t.type === 'error' ? '\u2717' : t.type === 'warn' ? '!' : 'i'}</span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const S = {
  container: {
    position: 'fixed',
    top: 16,
    right: 16,
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    pointerEvents: 'none',
    maxWidth: 380,
  },
  toast: {
    padding: '0.7rem 1rem',
    borderRadius: 10,
    fontSize: '0.88rem',
    fontWeight: 500,
    lineHeight: 1.4,
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    pointerEvents: 'auto',
    animation: 'slideUp 0.3s ease',
    backdropFilter: 'blur(8px)',
  },
  icon: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.72rem',
    fontWeight: 700,
    flexShrink: 0,
  },
  success: { background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' },
  error:   { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' },
  warn:    { background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a' },
  info:    { background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' },
};
