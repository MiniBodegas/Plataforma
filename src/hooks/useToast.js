import { useState } from 'react';

export function useToast(duration = 5000) {
  const [toast, setToast] = useState({ 
    msg: '', 
    type: '', 
    visible: false 
  });

  // Clear toast
  const clearToast = () => {
    setToast({ msg: '', type: '', visible: false });
  };

  // Show toast with message and type
  const showToast = (msg, type) => {
    setToast({ msg, type, visible: true });

    // Set timeout to clear toast
    setTimeout(() => {
      setToast(prev => {
        // Solo limpiar si es el mismo mensaje (evita conflictos)
        if (prev.msg === msg && prev.type === type) {
          return { msg: '', type: '', visible: false };
        }
        return prev;
      });
    }, duration);
  };

  const showOk = (msg) => showToast(msg, 'success');
  const showError = (msg) => showToast(msg, 'error');

  return {
    toast,
    showOk,
    showError,
    clearToast
  };
}