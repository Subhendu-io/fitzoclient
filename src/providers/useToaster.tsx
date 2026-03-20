import React, { createContext, useContext, useState, ReactNode, useCallback, useRef } from 'react';

export type ToasterVariant = "success" | "danger" | "warn" | "info" | "default";

export interface ToasterOptions {
  title?: string;
  message: string;
  variant?: ToasterVariant;
  duration?: number;
  className?: string;
}

export interface ToasterState extends ToasterOptions {
  id: string; // Forces re-render on identical consecutive toasts
  visible: boolean;
}

interface ToasterContextType {
  toast: ToasterState | null;
  showToast: (options: ToasterOptions) => void;
  hideToast: () => void;
}

const ToasterContext = createContext<ToasterContextType | undefined>(undefined);

export const ToasterProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToasterState | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const hideToast = useCallback(() => {
    setToast((prev) => prev ? { ...prev, visible: false } : null);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  const showToast = useCallback((options: ToasterOptions) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    const id = Date.now().toString();
    setToast({ ...options, id, visible: true });

    const duration = options.duration || 3000;
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    }
  }, [hideToast]);

  return (
    <ToasterContext.Provider value={{ toast, showToast, hideToast }}>
      {children}
    </ToasterContext.Provider>
  );
};

export const useToaster = () => {
  const context = useContext(ToasterContext);
  if (!context) {
    throw new Error('useToaster must be used within a ToasterProvider');
  }
  return context;
};
