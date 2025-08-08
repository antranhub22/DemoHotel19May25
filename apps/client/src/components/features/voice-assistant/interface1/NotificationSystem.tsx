import * as React from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { UI_CONSTANTS } from "@/lib/constants";
import type { Room } from "@/types/common.types";
import { useIsMobile } from "@/hooks/use-mobile";
import logger from "@shared/utils/logger";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Phone,
  Settings,
  Smartphone,
  User,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// Enhanced notification types with better categorization
export type NotificationType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "call"
  | "service"
  | "guest"
  | "system";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
  priority?: "low" | "medium" | "high" | "urgent";
  category?: string;
  timestamp?: Date;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: "primary" | "secondary" | "danger";
}

interface NotificationSystemProps {
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
  maxNotifications?: number;
  className?: string;
}

// Enhanced notification icons with better visual design
const getNotificationIcon = (type: NotificationType) => {
  const iconProps = { className: "w-5 h-5 flex-shrink-0" };

  switch (type) {
    case "success":
      return (
        <CheckCircle
          {...iconProps}
          className="w-5 h-5 flex-shrink-0 text-green-600"
        />
      );
    case "error":
      return (
        <AlertCircle
          {...iconProps}
          className="w-5 h-5 flex-shrink-0 text-red-600"
        />
      );
    case "warning":
      return (
        <AlertTriangle
          {...iconProps}
          className="w-5 h-5 flex-shrink-0 text-yellow-600"
        />
      );
    case "info":
      return (
        <Info {...iconProps} className="w-5 h-5 flex-shrink-0 text-blue-600" />
      );
    case "call":
      return (
        <Phone
          {...iconProps}
          className="w-5 h-5 flex-shrink-0 text-purple-600"
        />
      );
    case "service":
      return (
        <Settings
          {...iconProps}
          className="w-5 h-5 flex-shrink-0 text-indigo-600"
        />
      );
    case "guest":
      return (
        <User {...iconProps} className="w-5 h-5 flex-shrink-0 text-pink-600" />
      );
    case "system":
      return (
        <Smartphone
          {...iconProps}
          className="w-5 h-5 flex-shrink-0 text-gray-600"
        />
      );
    default:
      return (
        <Info {...iconProps} className="w-5 h-5 flex-shrink-0 text-blue-600" />
      );
  }
};

// Enhanced notification colors with gradients
const getNotificationStyles = (
  type: NotificationType,
  prefersReducedMotion: boolean,
) => {
  const blurPart = prefersReducedMotion ? "" : "backdrop-blur-md";
  const baseClasses = `border-l-4 ${blurPart} shadow-lg transition-all duration-300`;

  switch (type) {
    case "success":
      return `${baseClasses} bg-gradient-to-r from-green-50 to-emerald-50 border-green-500 shadow-green-100`;
    case "error":
      return `${baseClasses} bg-gradient-to-r from-red-50 to-rose-50 border-red-500 shadow-red-100`;
    case "warning":
      return `${baseClasses} bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-500 shadow-yellow-100`;
    case "info":
      return `${baseClasses} bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-500 shadow-blue-100`;
    case "call":
      return `${baseClasses} bg-gradient-to-r from-purple-50 to-violet-50 border-purple-500 shadow-purple-100`;
    case "service":
      return `${baseClasses} bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-500 shadow-indigo-100`;
    case "guest":
      return `${baseClasses} bg-gradient-to-r from-pink-50 to-rose-50 border-pink-500 shadow-pink-100`;
    case "system":
      return `${baseClasses} bg-gradient-to-r from-gray-50 to-slate-50 border-gray-500 shadow-gray-100`;
    default:
      return `${baseClasses} bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-500 shadow-blue-100`;
  }
};

// Enhanced position classes for better mobile support
const getPositionClasses = (
  position: NotificationSystemProps["position"],
  isMobile: boolean,
) => {
  if (isMobile) {
    // Mobile always uses top-center for better UX
    return "fixed top-4 left-4 right-4 flex flex-col space-y-2";
  }

  switch (position) {
    case "top-right":
      return "fixed top-4 right-4 flex flex-col space-y-2";
    case "top-left":
      return "fixed top-4 left-4 flex flex-col space-y-2";
    case "bottom-right":
      return "fixed bottom-4 right-4 flex flex-col-reverse space-y-reverse space-y-2";
    case "bottom-left":
      return "fixed bottom-4 left-4 flex flex-col-reverse space-y-reverse space-y-2";
    case "top-center":
      return "fixed top-4 left-1/2 transform -translate-x-1/2 flex flex-col space-y-2";
    case "bottom-center":
      return "fixed bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col-reverse space-y-reverse space-y-2";
    default:
      return "fixed top-4 right-4 flex flex-col space-y-2";
  }
};

// Individual notification component with enhanced animations

interface NotificationItemProps {
  className?: string;
  children?: React.ReactNode;
  // TODO: Add specific props for NotificationItem
}

interface NotificationItemProps {
  notification: Notification;
  onClose: (id: string) => void;
  isExiting?: boolean;
  index?: number;
  isMobile?: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClose,
  isExiting = false,
  index = 0,
  isMobile = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50 + index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  // Enhanced progress bar animation
  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const interval = 50; // Update every 50ms for smooth animation
      const decrement = (100 / notification.duration) * interval;

      progressRef.current = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev - decrement;
          if (newProgress <= 0) {
            onClose(notification.id);
            return 0;
          }
          return newProgress;
        });
      }, interval);

      return () => {
        if (progressRef.current) {
          clearInterval(progressRef.current);
        }
      };
    }
  }, [notification.duration, notification.id, onClose]);

  // Handle manual close
  const handleClose = useCallback(() => {
    if (progressRef.current) {
      clearInterval(progressRef.current);
    }
    onClose(notification.id);
  }, [notification.id, onClose]);

  // Get priority-based styling
  const getPriorityStyles = () => {
    switch (notification.priority) {
      case "urgent":
        return "ring-2 ring-red-400 ring-opacity-50 animate-pulse";
      case "high":
        return "ring-1 ring-orange-300 ring-opacity-30";
      case "medium":
        return "";
      case "low":
      default:
        return "opacity-90";
    }
  };

  return (
    <div
      className={`
        notification-stack-item
        ${isVisible ? `notification-${notification.type}` : "opacity-0 transform translate-x-full"}
        ${isExiting ? "notification-exit" : ""}
        ${isMobile ? "mobile" : ""}
        ${getNotificationStyles(notification.type)}
        ${getPriorityStyles()}
        ${isMobile ? "w-full" : "w-80"}
        rounded-lg p-4 max-w-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.02]
        ${notification.priority === "urgent" ? "gentle-glow" : ""}
        ${notification.type === "success" ? "voice-success" : ""}
        voice-particles hardware-accelerated
      `}
      role="alert"
      aria-live={notification.priority === "urgent" ? "assertive" : "polite"}
    >
      {/* Enhanced Progress Bar with Animation */}
      {notification.duration && notification.duration > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded-t-lg overflow-hidden">
          <div
            className="notification-progress bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-100 ease-linear"
            style={{
              width: `${progress}%`,
              animationDuration: `${notification.duration}ms`,
            }}
          />
        </div>
      )}

      <div className="flex items-start space-x-3">
        {/* Enhanced Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Enhanced Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4
                className={`font-semibold text-gray-900 ${isMobile ? "text-sm" : "text-sm"} voice-feedback-text`}
              >
                {notification.title}
              </h4>
              <p
                className={`text-gray-700 mt-1 ${isMobile ? "text-xs" : "text-sm"} leading-relaxed`}
              >
                {notification.message}
              </p>

              {/* Enhanced Metadata Display */}
              {notification.metadata &&
                Object.keys(notification.metadata).length > 0 &&
                !isMobile && (
                  <div className="mt-2 text-xs text-gray-500 space-y-1">
                    {notification.metadata.serviceName && (
                      <div className="flex items-center gap-1">
                        <Settings className="w-3 h-3" />
                        <span>
                          Service: {notification.metadata.serviceName}
                        </span>
                      </div>
                    )}
                    {notification.metadata.language && (
                      <div className="flex items-center gap-1">
                        <span>Language: {notification.metadata.language}</span>
                      </div>
                    )}
                  </div>
                )}

              {/* Enhanced Actions */}
              {notification.actions && notification.actions.length > 0 && (
                <div
                  className={`mt-3 flex ${isMobile ? "flex-col space-y-2" : "space-x-2"}`}
                >
                  {notification.actions.map((action, actionIndex) => (
                    <button
                      key={actionIndex}
                      onClick={action.action}
                      className={`
                        px-3 py-1.5 rounded text-xs font-medium transition-all duration-200 
                        hover:scale-105 active:scale-95 voice-control
                        ${
                          action.variant === "primary"
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : action.variant === "danger"
                              ? "bg-red-600 text-white hover:bg-red-700"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }
                        ${isMobile ? "w-full" : ""}
                      `}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Enhanced Close Button */}
            <button
              onClick={handleClose}
              className={`
                flex-shrink-0 ml-2 p-1 rounded-full hover:bg-gray-200 transition-colors duration-200 
                focus:outline-none focus:ring-2 focus:ring-gray-400 voice-control
                ${isMobile ? "mt-1" : ""}
              `}
              aria-label="Close notification"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Timestamp for Mobile */}
      {isMobile && notification.timestamp && (
        <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
          {notification.timestamp.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

// Main notification system component
export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  position = "top-right",
  maxNotifications = 5,
  className = "",
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [exitingNotifications, setExitingNotifications] = useState<Set<string>>(
    new Set(),
  );
  const isMobile = useIsMobile();

  // Enhanced notification management
  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp">) => {
      const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newNotification: Notification = {
        ...notification,
        id,
        timestamp: new Date(),
        duration: notification.duration ?? 5000,
        priority: notification.priority ?? "medium",
      };

      setNotifications((prev) => {
        const filtered = prev.slice(-(maxNotifications - 1));
        return [...filtered, newNotification];
      });

      logger.debug(
        `📢 [NotificationSystem] Added notification: ${newNotification.title}`,
        "Component",
      );
    },
    [maxNotifications],
  );

  // Enhanced notification removal with animation
  const removeNotification = useCallback((id: string) => {
    setExitingNotifications((prev) => new Set([...prev, id]));

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setExitingNotifications((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 300); // Match CSS animation duration

    logger.debug(
      `📢 [NotificationSystem] Removed notification: ${id}`,
      "Component",
    );
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    notifications.forEach((notification) => {
      setExitingNotifications((prev) => new Set([...prev, notification.id]));
    });

    setTimeout(() => {
      setNotifications([]);
      setExitingNotifications(new Set());
    }, 300);

    logger.debug(
      `📢 [NotificationSystem] Cleared all notifications`,
      "Component",
    );
  }, [notifications]);

  // Enhanced global notification API
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).addNotification = addNotification;
      (window as any).clearAllNotifications = clearAllNotifications;

      // Enhanced notification shortcuts
      (window as any).showSuccess = (title: string, message: string) =>
        addNotification({ type: "success", title, message });

      (window as any).showError = (title: string, message: string) =>
        addNotification({ type: "error", title, message, priority: "high" });

      (window as any).showWarning = (title: string, message: string) =>
        addNotification({ type: "warning", title, message });

      (window as any).showInfo = (title: string, message: string) =>
        addNotification({ type: "info", title, message });

      logger.debug(`📢 [NotificationSystem] Global API attached`, "Component");
    }

    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).addNotification;
        delete (window as any).clearAllNotifications;
        delete (window as any).showSuccess;
        delete (window as any).showError;
        delete (window as any).showWarning;
        delete (window as any).showInfo;
      }
    };
  }, [addNotification, clearAllNotifications]);

  // Auto-stack management for mobile
  useEffect(() => {
    if (isMobile && notifications.length > 3) {
      const oldestId = notifications[0].id;
      removeNotification(oldestId);
    }
  }, [notifications, isMobile, removeNotification]);

  if (notifications.length === 0) {
    return null;
  }

  const prefersReducedMotion = useReducedMotion();
  return (
    <div
      className={`${getPositionClasses(position, isMobile)} ${className}`}
      style={{ zIndex: UI_CONSTANTS.Z_INDEX.POPOVER }}
    >
      {/* Enhanced Clear All Button for Multiple Notifications */}
      {notifications.length > 2 && (
        <button
          onClick={clearAllNotifications}
          className={`
            self-end mb-2 px-3 py-1 bg-gray-600 text-white text-xs rounded-full 
            hover:bg-gray-700 transition-colors duration-200 voice-control
            ${isMobile ? "self-center" : ""}
          `}
        >
          Clear All ({notifications.length})
        </button>
      )}

      {/* Enhanced Notification List */}
      {notifications.map((notification, index) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
          isExiting={exitingNotifications.has(notification.id)}
          index={index}
          isMobile={isMobile}
        />
      ))}
    </div>
  );
};

// Enhanced notification creation helpers
export const createCallNotification = (
  callId: string,
  roomNumber?: string,
  duration?: string,
): Notification => ({
  id: `call-${callId}`,
  type: "call",
  title: "Call Completed",
  message: `${roomNumber ? `Room ${roomNumber} • ` : ""}Duration: ${duration || "Unknown"}`,
  duration: 6000,
  priority: "medium",
  metadata: {
    callId,
    roomNumber,
    duration,
    category: "voice-call",
  },
});

export const createServiceNotification = (
  serviceName: string,
  message: string,
  type: NotificationType = "service",
): Notification => ({
  id: `service-${Date.now()}`,
  type,
  title: serviceName,
  message,
  duration: 4000,
  priority: "medium",
  metadata: {
    serviceName,
    category: "service-request",
  },
});

export const createLanguageNotification = (
  language: string,
  previousLanguage?: string,
): Notification => ({
  id: `language-${Date.now()}`,
  type: "success",
  title: "Language Changed",
  message: `Voice assistant switched to ${language}`,
  duration: 3000,
  priority: "low",
  metadata: {
    language,
    previousLanguage,
    category: "language-change",
  },
});
