import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }}>
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.9 }}
                            layout
                            style={{
                                background: toast.type === 'success' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                                backdropFilter: 'blur(8px)',
                                color: 'white',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                minWidth: '250px',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                            <span style={{ fontSize: '0.9rem', flex: 1 }}>{toast.message}</span>
                            <button
                                onClick={() => removeToast(toast.id)}
                                style={{ background: 'none', border: 'none', color: 'white', opacity: 0.8, cursor: 'pointer' }}
                            >
                                <X size={14} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
