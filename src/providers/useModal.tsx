import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ModalVariant = "success" | "danger" | "warn" | "info" | "default";

export interface ModalButton {
  text: string;
  onPress?: () => void;
  style?: "cancel" | "default" | "destructive";
  className?: string; // Custom button container styles
  textClassName?: string; // Custom text styles
}

export interface ModalOptions {
  title?: string;
  message?: string;
  variant?: ModalVariant;
  buttons?: ModalButton[];
  cancelable?: boolean;
  onDismiss?: () => void;
  className?: string; // Inner card styles 
  containerClassName?: string; // Outer overlay styles
}

interface ModalContextType {
  isOpen: boolean;
  options: ModalOptions | null;
  showModal: (options: ModalOptions) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ModalOptions | null>(null);

  const showModal = (newOptions: ModalOptions) => {
    setOptions(newOptions);
    setIsOpen(true);
  };

  const hideModal = () => {
    setIsOpen(false);
    // Don't clear options immediately to allow for smooth exit animations in the UI
    setTimeout(() => {
      setOptions(prev => {
        if (prev?.onDismiss) prev.onDismiss();
        return null; // completely drop state after exit animation ends
      });
    }, 400); // Wait for transition out
  };

  return (
    <ModalContext.Provider value={{ isOpen, options, showModal, hideModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
