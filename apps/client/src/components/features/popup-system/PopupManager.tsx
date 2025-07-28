import { usePopupContext } from '@/context/PopupContext';
import React, { Suspense, useEffect } from 'react';
import { PopupStack } from './PopupStack';

// Lazy load SummaryPopupContent for code splitting
const LazySummaryPopupContent = React.lazy(() =>
  import('./SummaryPopupContent').then(module => ({
    default: module.SummaryPopupContent,
  }))
);

interface PopupManagerProps {
  position?: 'top' | 'bottom' | 'center';
  maxVisible?: number;
  autoCloseDelay?: number; // Auto close after X milliseconds
  isMobile?: boolean; // Filter popups based on mobile/desktop
}

export const PopupManager: React.FC<PopupManagerProps> = ({
  position = 'bottom',
  maxVisible = 4,
  autoCloseDelay,
}) => {
  const { popups, activePopup, setActivePopup, removePopup } =
    usePopupContext();

  // Auto-close popups after delay
  useEffect(() => {
    if (!autoCloseDelay) {
      return;
    }

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

  // Filter popups - Remove summary popups since they're handled by unified SummaryPopup components
  const regularPopups = popups.filter(popup => popup.type !== 'summary');

  return (
    <>
      {/* Regular PopupStack for non-summary popups */}
      {regularPopups.length > 0 && (
        <PopupStack
          popups={regularPopups}
          activePopup={activePopup}
          maxVisible={maxVisible}
          onPopupSelect={handlePopupSelect}
          onPopupDismiss={handlePopupDismiss}
          position={position}
        />
      )}

      {/* Summary popups are now handled by unified SummaryPopup components:
          - Desktop: SummaryPopup with layout="grid" in Interface1
          - Mobile: MobileSummaryPopup with layout="center-modal" in Interface1
          This ensures consistent behavior and maintainability across platforms.
      */}

      {/* CSS for any remaining animations */}
      <style>{`
        @keyframes modalSlideIn {
          from {
            transform: scale(0.95) translateY(20px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

// Hook for easy popup creation
export const usePopup = () => {
  const { addPopup, removePopup, setActivePopup } = usePopupContext();

  const showConversation = (
    content: React.ReactNode,
    options?: {
      title?: string;
      priority?: 'high' | 'medium' | 'low';
      badge?: number;
    }
  ) => {
    return addPopup({
      type: 'conversation',
      title: options?.title || 'Realtime Conversation',
      content,
      priority: options?.priority || 'high',
      isActive: true,
      badge: options?.badge,
    });
  };

  const showStaffMessage = (
    content: React.ReactNode,
    options?: {
      title?: string;
      priority?: 'high' | 'medium' | 'low';
      badge?: number;
    }
  ) => {
    return addPopup({
      type: 'staff',
      title: options?.title || 'Staff Message',
      content,
      priority: options?.priority || 'medium',
      isActive: false,
      badge: options?.badge,
    });
  };

  const showNotification = (
    content: React.ReactNode,
    options?: {
      title?: string;
      priority?: 'high' | 'medium' | 'low';
      badge?: number;
    }
  ) => {
    return addPopup({
      type: 'notification',
      title: options?.title || 'Hotel Notification',
      content,
      priority: options?.priority || 'low',
      isActive: false,
      badge: options?.badge,
    });
  };

  const showAlert = (
    content: React.ReactNode,
    options?: {
      title?: string;
      priority?: 'high' | 'medium' | 'low';
      badge?: number;
    }
  ) => {
    return addPopup({
      type: 'alert',
      title: options?.title || 'System Alert',
      content,
      priority: options?.priority || 'high',
      isActive: true,
      badge: options?.badge,
    });
  };

  const showOrderUpdate = (
    content: React.ReactNode,
    options?: {
      title?: string;
      priority?: 'high' | 'medium' | 'low';
      badge?: number;
    }
  ) => {
    return addPopup({
      type: 'order',
      title: options?.title || 'Order Update',
      content,
      priority: options?.priority || 'medium',
      isActive: false,
      badge: options?.badge,
    });
  };

  const showSummary = (
    content?: React.ReactNode,
    options?: {
      title?: string;
      priority?: 'high' | 'medium' | 'low';
    }
  ) => {
    return addPopup({
      type: 'summary',
      title: options?.title || 'Call Summary',
      content: content || (
        <Suspense
          fallback={
            <div className="p-4 text-center text-gray-500">Loading...</div>
          }
        >
          <LazySummaryPopupContent />
        </Suspense>
      ),
      priority: options?.priority || 'high',
      isActive: false,
    });
  };

  // ✅ NEW: Quick notification method to replace NotificationSystem
  const showQuickNotification = (
    message: string,
    options?: {
      type?: 'success' | 'error' | 'warning' | 'info' | 'call' | 'service';
      title?: string;
      duration?: number;
      priority?: 'high' | 'medium' | 'low';
      position?: 'top-right' | 'top-center' | 'bottom';
    }
  ) => {
    const notificationTypes = {
      success: { icon: '✅', title: 'Success', color: '#34C759' },
      error: { icon: '❌', title: 'Error', color: '#FF3B30' },
      warning: { icon: '⚠️', title: 'Warning', color: '#FF9500' },
      info: { icon: 'ℹ️', title: 'Info', color: '#007AFF' },
      call: { icon: '📞', title: 'Call', color: '#5856D6' },
      service: { icon: '🛎️', title: 'Service', color: '#5856D6' },
    };

    const type = options?.type || 'info';
    const config = notificationTypes[type];
    const duration = options?.duration || 3000;

    const popupId = addPopup({
      type: 'notification',
      title: options?.title || config.title,
      content: (
        <div className="flex items-center space-x-3">
          <span className="text-lg">{config.icon}</span>
          <span className="text-sm text-gray-700">{message}</span>
        </div>
      ),
      priority: options?.priority || 'low',
      isActive: false,
      metadata: {
        notificationType: type,
        autoDismiss: true,
        duration,
        position: options?.position || 'top-right',
      },
    });

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        removePopup(popupId);
      }, duration);
    }

    return popupId;
  };

  // ✅ ENHANCED: Multi-language notification support (migration from NotificationSystem)
  const showMultiLanguageNotification = (
    template: string,
    language: string,
    variables: Record<string, string> = {},
    options?: {
      type?: 'success' | 'error' | 'warning' | 'info' | 'call' | 'service';
      duration?: number;
      metadata?: Record<string, any>;
    }
  ) => {
    // For now, simplified version - can be enhanced later
    const message = `${template} (${language})`;
    return showQuickNotification(message, {
      type: options?.type || 'info',
      duration: options?.duration || 3000,
    });
  };

  return {
    showConversation,
    showStaffMessage,
    showNotification,
    showAlert,
    showOrderUpdate,
    showSummary,
    showQuickNotification, // ✅ NEW: Quick notifications
    showMultiLanguageNotification, // ✅ NEW: Multi-language support
    removePopup,
    setActivePopup,
  };
};
