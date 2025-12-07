import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36);
    setToasts(prev => [...prev, { ...toast, id }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => removeToast(id), 5000);
  }, [removeToast]);

  const showSuccess = useCallback((title: string, message?: string) => {
    showToast({ type: 'success', title, message });
  }, [showToast]);

  const showError = useCallback((title: string, message?: string) => {
    showToast({ type: 'error', title, message });
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string) => {
    showToast({ type: 'warning', title, message });
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string) => {
    showToast({ type: 'info', title, message });
  }, [showToast]);

  const toastConfig = {
    success: { icon: CheckCircle, bg: 'bg-green-500', border: 'border-green-600' },
    error: { icon: XCircle, bg: 'bg-red-500', border: 'border-red-600' },
    warning: { icon: AlertTriangle, bg: 'bg-amber-500', border: 'border-amber-600' },
    info: { icon: Info, bg: 'bg-blue-500', border: 'border-blue-600' }
  };

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning, showInfo }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-md pointer-events-none">
        {toasts.map((toast) => {
          const config = toastConfig[toast.type];
          const Icon = config.icon;
          
          return (
            <div
              key={toast.id}
              className="pointer-events-auto bg-white rounded-xl shadow-2xl border-3 border-stone-300 overflow-hidden animate-slideInRight"
            >
              <div className={`flex items-start gap-3 p-4 border-l-4 ${config.border}`}>
                <div className={`${config.bg} p-2 rounded-lg flex-shrink-0`}>
                  <Icon className="text-white" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-stone-900 text-base">{toast.title}</h4>
                  {toast.message && (
                    <p className="text-sm text-stone-600 mt-1">{toast.message}</p>
                  )}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="flex-shrink-0 p-1 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  <X size={18} className="text-stone-600" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
