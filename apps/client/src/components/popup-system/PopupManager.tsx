import React, { useEffect } from 'react';
import { PopupStack } from './PopupStack';
import { usePopupContext } from '@/context/PopupContext';

interface PopupManagerProps {
  position?: 'top' | 'bottom' | 'center';
  maxVisible?: number;
  autoCloseDelay?: number; // Auto close after X milliseconds
}

export const PopupManager: React.FC<PopupManagerProps> = ({
  position = 'bottom',
  maxVisible = 4,
  autoCloseDelay
}) => {
  const {
    popups,
    activePopup,
    setActivePopup,
    removePopup,
  } = usePopupContext();

  // Auto-close popups after delay
  useEffect(() => {
    if (!autoCloseDelay) return;

    const timers: NodeJS.Timeout[] = [];

    popups.forEach(popup => {
      // Only auto-close low priority popups
      if (popup.priority === 'low') {
        const timer = setTimeout(() => {
          removePopup(popup.id);
        }, autoCloseDelay);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [popups, autoCloseDelay, removePopup]);

  const handlePopupSelect = (id: string) => {
    setActivePopup(activePopup === id ? null : id);
  };

  const handlePopupDismiss = (id: string) => {
    removePopup(id);
    
    // If we're dismissing the active popup, set the next one as active
    if (activePopup === id && popups.length > 1) {
      const remainingPopups = popups.filter(p => p.id !== id);
      if (remainingPopups.length > 0) {
        setActivePopup(remainingPopups[0].id);
      }
    }
  };

  // Don't render if no popups
  if (popups.length === 0) {
    return null;
  }

  return (
    <PopupStack
      popups={popups}
      activePopup={activePopup}
      maxVisible={maxVisible}
      onPopupSelect={handlePopupSelect}
      onPopupDismiss={handlePopupDismiss}
      position={position}
    />
  );
};

// Hook for easy popup creation
export const usePopup = () => {
  const { addPopup, removePopup, setActivePopup } = usePopupContext();

  const showConversation = (content: React.ReactNode, options?: {
    title?: string;
    priority?: 'high' | 'medium' | 'low';
    badge?: number;
  }) => {
    return addPopup({
      type: 'conversation',
      title: options?.title || 'Realtime Conversation',
      content,
      priority: options?.priority || 'high',
      isActive: true,
      badge: options?.badge,
    });
  };

  const showStaffMessage = (content: React.ReactNode, options?: {
    title?: string;
    priority?: 'high' | 'medium' | 'low';
    badge?: number;
  }) => {
    return addPopup({
      type: 'staff',
      title: options?.title || 'Staff Message',
      content,
      priority: options?.priority || 'medium',
      isActive: false,
      badge: options?.badge,
    });
  };

  const showNotification = (content: React.ReactNode, options?: {
    title?: string;
    priority?: 'high' | 'medium' | 'low';
    badge?: number;
  }) => {
    return addPopup({
      type: 'notification',
      title: options?.title || 'Hotel Notification',
      content,
      priority: options?.priority || 'low',
      isActive: false,
      badge: options?.badge,
    });
  };

  const showAlert = (content: React.ReactNode, options?: {
    title?: string;
    priority?: 'high' | 'medium' | 'low';
    badge?: number;
  }) => {
    return addPopup({
      type: 'alert',
      title: options?.title || 'System Alert',
      content,
      priority: options?.priority || 'high',
      isActive: true,
      badge: options?.badge,
    });
  };

  const showOrderUpdate = (content: React.ReactNode, options?: {
    title?: string;
    priority?: 'high' | 'medium' | 'low';
    badge?: number;
  }) => {
    return addPopup({
      type: 'order',
      title: options?.title || 'Order Update',
      content,
      priority: options?.priority || 'medium',
      isActive: false,
      badge: options?.badge,
    });
  };

  return {
    showConversation,
    showStaffMessage,
    showNotification,
    showAlert,
    showOrderUpdate,
    removePopup,
    setActivePopup,
  };
}; 