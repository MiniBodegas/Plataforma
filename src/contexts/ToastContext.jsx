// contexts/ToastContext.jsx
import { createContext, useContext, useState } from 'react';

const ToastContext = createContext({});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = ({ type = 'info', message, duration = 5000 }) => {
    const id = Date.now() + Math.random();
    const toast = { id, type, message, duration };
    
    setToasts(prev => [...prev, toast]);

    // Auto-remove después de duration
    setTimeout(() => {
      removeToast(id);
    }, duration);

    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message, duration) => {
    return showToast({ type: 'success', message, duration });
  };

  const showError = (message, duration) => {
    return showToast({ type: 'error', message, duration });
  };

  const showWarning = (message, duration) => {
    return showToast({ type: 'warning', message, duration });
  };

  const showInfo = (message, duration) => {
    return showToast({ type: 'info', message, duration });
  };

  const value = {
    toasts,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast debe ser usado dentro de ToastProvider');
  }
  return context;
};

// Componente para mostrar los toasts
function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast 
          key={toast.id} 
          toast={toast} 
          onRemove={removeToast} 
        />
      ))}
    </div>
  );
}

function Toast({ toast, onRemove }) {
  const getToastStyles = (type) => {
    const baseStyles = "px-4 py-3 rounded-lg shadow-lg border-l-4 max-w-sm";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-400 text-green-800`;
      case 'error':
        return `${baseStyles} bg-red-50 border-red-400 text-red-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-400 text-yellow-800`;
      default:
        return `${baseStyles} bg-blue-50 border-blue-400 text-blue-800`;
    }
  };

  return (
    <div className={getToastStyles(toast.type)}>
      <div className="flex justify-between items-start">
        <p className="text-sm font-medium">{toast.message}</p>
        <button
          onClick={() => onRemove(toast.id)}
          className="ml-2 text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
    </div>
  );
}