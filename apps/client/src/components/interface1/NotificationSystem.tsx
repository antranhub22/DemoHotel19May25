import React, { useState, useEffect, useCallback } from 'react';
import { X, Check, AlertCircle, Info, Bell, Clock, User, Phone } from 'lucide-react';
import { logger } from '@shared/utils/logger';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'call' | 'service' | 'guest';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  duration?: number; // ms, undefined = persistent
  actions?: Array<{
    label: string;
    action: () => void;
    style?: 'primary' | 'secondary' | 'danger';
  }>;
  metadata?: {
    roomNumber?: string;
    guestName?: string;
    serviceType?: string;
    callId?: string;
  };
  isExiting?: boolean;
}

interface NotificationSystemProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';
  maxNotifications?: number;
  className?: string;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  position = 'top-right',
  maxNotifications = 5,
  className = '',
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Add notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      isExiting: false,
    };

    logger.debug('🔔 [NotificationSystem] Adding notification:', 'Component', newNotification);

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, maxNotifications);
      return updated;
    });

    // Auto-remove after duration
    if (notification.duration) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, notification.duration);
    }

    return newNotification.id;
  }, [maxNotifications]);

  // Remove notification with exit animation
  const removeNotification = useCallback((id: string) => {
    logger.debug('🗑️ [NotificationSystem] Removing notification:', 'Component', id);
    
    // First, mark as exiting
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isExiting: true } : n)
    );
    
    // Then remove after animation
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 300);
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    logger.debug('🗑️ [NotificationSystem] Clearing all notifications', 'Component');
    
    // Mark all as exiting
    setNotifications(prev => prev.map(n => ({ ...n, isExiting: true })));
    
    // Clear after animation
    setTimeout(() => {
      setNotifications([]);
    }, 300);
  }, []);

  // Get notification icon
  const getNotificationIcon = (type: NotificationType) => {
    const iconProps = { size: 20, className: 'flex-shrink-0' };
    
    switch (type) {
      case 'success':
        return <Check {...iconProps} className="text-green-500" />;
      case 'error':
        return <AlertCircle {...iconProps} className="text-red-500" />;
      case 'warning':
        return <AlertCircle {...iconProps} className="text-yellow-500" />;
      case 'info':
        return <Info {...iconProps} className="text-blue-500" />;
      case 'call':
        return <Phone {...iconProps} className="text-purple-500" />;
      case 'service':
        return <Bell {...iconProps} className="text-orange-500" />;
      case 'guest':
        return <User {...iconProps} className="text-indigo-500" />;
      default:
        return <Info {...iconProps} className="text-gray-500" />;
    }
  };

  // Get notification colors
  const getNotificationColors = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'call':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'service':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'guest':
        return 'bg-indigo-50 border-indigo-200 text-indigo-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  // Get position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  // Expose functions globally for easy access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).addNotification = addNotification;
      (window as any).removeNotification = removeNotification;
      (window as any).clearAllNotifications = clearAll;
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).addNotification;
        delete (window as any).removeNotification;
        delete (window as any).clearAllNotifications;
      }
    };
  }, [addNotification, removeNotification, clearAll]);

  return (
    <div className={`fixed ${getPositionClasses()} z-[9999] max-w-sm w-full ${className}`}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`mb-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm transition-all duration-300 ${
            notification.isExiting 
              ? 'animate-fade-out transform translate-y-2 opacity-0' 
              : 'animate-fade-in-up opacity-100'
          } ${getNotificationColors(notification.type)}`}
          data-testid="notification"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              {getNotificationIcon(notification.type)}
              
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm mb-1">
                  {notification.title}
                </div>
                <div className="text-sm opacity-90">
                  {notification.message}
                </div>
                
                {/* Metadata display */}
                {notification.metadata && (
                  <div className="mt-2 text-xs opacity-75 space-y-1">
                    {notification.metadata.roomNumber && (
                      <div>Room: {notification.metadata.roomNumber}</div>
                    )}
                    {notification.metadata.guestName && (
                      <div>Guest: {notification.metadata.guestName}</div>
                    )}
                    {notification.metadata.serviceType && (
                      <div>Service: {notification.metadata.serviceType}</div>
                    )}
                  </div>
                )}
                
                {/* Timestamp */}
                <div className="flex items-center mt-2 text-xs opacity-60">
                  <Clock size={12} className="mr-1" />
                  {notification.timestamp.toLocaleTimeString()}
                </div>
                
                {/* Actions */}
                {notification.actions && notification.actions.length > 0 && (
                  <div className="flex space-x-2 mt-3">
                    {notification.actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          action.action();
                          if (action.style !== 'secondary') {
                            removeNotification(notification.id);
                          }
                        }}
                        className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                          action.style === 'danger'
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : action.style === 'primary'
                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                            : 'bg-white/50 hover:bg-white/70 text-current'
                        }`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Close button */}
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-2 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
      
      {/* Clear all button when multiple notifications */}
      {notifications.length > 1 && (
        <button
          onClick={clearAll}
          className="w-full mt-2 p-2 text-xs bg-gray-700 hover:bg-gray-800 text-white rounded-md transition-colors animate-fade-in"
        >
          Clear All ({notifications.length})
        </button>
      )}
    </div>
  );
};

// Utility functions for easy notification creation
export const createServiceNotification = (serviceType: string, roomNumber?: string, guestName?: string) => {
  return {
    type: 'service' as NotificationType,
    title: 'Service Request',
    message: `New ${serviceType} request received`,
    duration: 8000,
    metadata: { serviceType, roomNumber, guestName },
    actions: [
      {
        label: 'View Details',
        action: () => {
          logger.debug('📋 Service notification clicked', 'Component', { serviceType, roomNumber });
          // Navigate to service details
        },
        style: 'primary' as const,
      },
      {
        label: 'Acknowledge',
        action: () => {
          logger.debug('✅ Service acknowledged', 'Component', { serviceType, roomNumber });
        },
        style: 'secondary' as const,
      },
    ],
  };
};

export const createCallNotification = (callId: string, roomNumber?: string, duration?: string) => {
  return {
    type: 'call' as NotificationType,
    title: 'Call Completed',
    message: `Voice call completed ${duration ? `(${duration})` : ''}`,
    duration: 6000,
    metadata: { callId, roomNumber },
    actions: [
      {
        label: 'View Summary',
        action: () => {
          logger.debug('📋 Call summary clicked', 'Component', { callId });
          // Show call summary
        },
        style: 'primary' as const,
      },
    ],
  };
};

export const createGuestNotification = (guestName: string, roomNumber: string, message: string) => {
  return {
    type: 'guest' as NotificationType,
    title: `Guest Update - Room ${roomNumber}`,
    message: message,
    duration: 10000,
    metadata: { guestName, roomNumber },
    actions: [
      {
        label: 'Contact Guest',
        action: () => {
          logger.debug('📞 Contact guest clicked', 'Component', { guestName, roomNumber });
        },
        style: 'primary' as const,
      },
    ],
  };
}; 