import { useState, useCallback } from 'react';

export function useToast(duration = 3000) {
  const [toast, setToast] = useState({ 
    msg: '', 
    type: '', 
    visible: false 
  });

  // Clear toast
  const clearToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  // Show toast with message and type
  const showToast = useCallback((msg, type) => {
    // Clear any existing timeout
    if (toast.visible) {
      clearToast();
    }

    setToast({ msg, type, visible: true });

    // Set timeout to clear toast
    const timer = setTimeout(clearToast, duration);

    // Cleanup timeout on unmount or when showing new toast
    return () => clearTimeout(timer);
  }, [duration, toast.visible, clearToast]);

  const showOk = useCallback((msg) => showToast(msg, 'success'), [showToast]);
  const showError = useCallback((msg) => showToast(msg, 'error'), [showToast]);

  return {
    toast,
    showOk,
    showError,
    clearToast
  };
}