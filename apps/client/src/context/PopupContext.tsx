import { logger } from '@shared/utils/logger';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';

// STANDARD POPUP DIMENSIONS - Không che nút Siri Button
export const STANDARD_POPUP_HEIGHT = 120; // px - Further reduced for better mobile clearance
export const STANDARD_POPUP_MAX_WIDTH = 350; // px
export const STANDARD_POPUP_MAX_HEIGHT_VH = 20; // % of viewport height - Further reduced for mobile

// Popup types
export type PopupType =
  | 'conversation'
  | 'staff'
  | 'notification'
  | 'alert'
  | 'order'
  | 'summary';

export type PopupPriority = 'high' | 'medium' | 'low';

export interface PopupState {
  id: string;
  type: PopupType;
  title: string;
  content: ReactNode;
  timestamp: Date;
  priority: PopupPriority;
  isActive: boolean;
  badge?: number;
  metadata?: Record<string, any>;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
}

export interface PopupContextValue {
  popups: PopupState[];
  activePopup: string | null;
  addPopup: (popup: Omit<PopupState, 'id' | 'timestamp'>) => string;
  removePopup: (id: string) => void;
  setActivePopup: (id: string | null) => void;
  updatePopup: (id: string, updates: Partial<PopupState>) => void;
  clearAllPopups: () => void;
  getPopupsByType: (type: PopupType) => PopupState[];
}

// Popup type configurations
export const POPUP_TYPES = {
  conversation: {
    icon: '🔴',
    title: 'Conversation',
    color: '#FF3B30',
    bgColor: 'rgba(255, 59, 48, 0.1)',
  },
  staff: {
    icon: '💬',
    title: 'Staff Messages',
    color: '#007AFF',
    bgColor: 'rgba(0, 122, 255, 0.1)',
  },
  notification: {
    icon: '📢',
    title: 'Hotel Notifications',
    color: '#FF9500',
    bgColor: 'rgba(255, 149, 0, 0.1)',
  },
  alert: {
    icon: '⚠️',
    title: 'Alert',
    color: '#FF3B30',
    bgColor: 'rgba(255, 59, 48, 0.1)',
  },
  order: {
    icon: '🛎️',
    title: 'Room Service',
    color: '#5856D6',
    bgColor: 'rgba(88, 86, 214, 0.1)',
  },
  summary: {
    icon: '📋',
    title: 'Call Summary',
    color: '#34C759',
    bgColor: 'rgba(52, 199, 89, 0.1)',
  },
} as const;

const PopupContext = createContext<PopupContextValue | null>(null);

let popupIdCounter = 0;

export const PopupProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [popups, setPopups] = useState<PopupState[]>([]);
  const [activePopup, setActivePopupState] = useState<string | null>(null);

  const addPopup = useCallback(
    (popup: Omit<PopupState, 'id' | 'timestamp'>) => {
      const id = `popup-${++popupIdCounter}`;
      const newPopup: PopupState = {
        ...popup,
        id,
        timestamp: new Date(),
      };

      console.log('➕ [DEBUG] PopupContext.addPopup called:', {
        id,
        type: popup.type,
        title: popup.title,
        priority: popup.priority,
        isActive: popup.isActive,
      });
      console.log('➕ [DEBUG] addPopup call stack:', new Error().stack);

      setPopups(prev => {
        // ✅ EMERGENCY: If too many popups, clear all and start fresh
        if (prev.length > 100) {
          console.log(
            '🚨 [DEBUG] EMERGENCY: Too many popups detected, clearing all'
          );
          return [newPopup]; // Start fresh with only the new popup
        }

        // ✅ NEW: Limit total number of popups to prevent memory issues
        const maxPopups = 50; // Limit to 50 popups max
        if (prev.length >= maxPopups) {
          console.log('⚠️ [DEBUG] Too many popups, removing oldest ones');
          // Remove oldest popups (keep newest 30)
          const keepCount = 30;
          const filtered = prev.slice(0, keepCount);
          return [newPopup, ...filtered];
        }

        // ✅ FIX: Don't auto-remove summary popups - they should persist
        if (popup.priority === 'high' && popup.type !== 'summary') {
          const filtered = prev.filter(p => p.type !== popup.type);
          console.log(
            '🔄 [DEBUG] Removed existing popups of same type:',
            popup.type
          );
          return [newPopup, ...filtered];
        }

        // ✅ NEW: For summary popups, remove old ones to prevent accumulation
        if (popup.type === 'summary') {
          const filtered = prev.filter(p => p.type !== 'summary');
          console.log('🔄 [DEBUG] Removed old summary popups, keeping new one');
          return [newPopup, ...filtered];
        }

        return [newPopup, ...prev];
      });

      // Auto-set as active if high priority or no active popup
      if (popup.priority === 'high' || popup.isActive) {
        setActivePopupState(id);
        console.log('🎯 [DEBUG] Set as active popup:', id);
      }

      return id;
    },
    []
  );

  const removePopup = useCallback((id: string) => {
    console.log('🗑️ [DEBUG] PopupContext.removePopup called for id:', id);
    setPopups(prev => {
      const popupToRemove = prev.find(p => p.id === id);
      if (popupToRemove) {
        console.log('🗑️ [DEBUG] Removing popup:', {
          id: popupToRemove.id,
          type: popupToRemove.type,
          title: popupToRemove.title,
          priority: popupToRemove.priority,
        });
      }
      return prev.filter(p => p.id !== id);
    });
    setActivePopupState(prev => (prev === id ? null : prev));
  }, []);

  const setActivePopup = useCallback((id: string | null) => {
    setActivePopupState(id);

    // Update the active state of popups
    if (id) {
      setPopups(prev =>
        prev.map(p => ({
          ...p,
          isActive: p.id === id,
        }))
      );
    }
  }, []);

  const updatePopup = useCallback(
    (id: string, updates: Partial<PopupState>) => {
      setPopups(prev =>
        prev.map(p => (p.id === id ? { ...p, ...updates } : p))
      );
    },
    []
  );

  const clearAllPopups = useCallback(() => {
    setPopups([]);
    setActivePopupState(null);
  }, []);

  const getPopupsByType = useCallback(
    (type: PopupType) => {
      return popups.filter(p => p.type === type);
    },
    [popups]
  );

  const value: PopupContextValue = {
    popups,
    activePopup,
    addPopup,
    removePopup,
    setActivePopup,
    updatePopup,
    clearAllPopups,
    getPopupsByType,
  };

  return (
    <PopupContext.Provider value={value}>{children}</PopupContext.Provider>
  );
};

export const usePopupContext = (): PopupContextValue => {
  const context = useContext(PopupContext);
  if (!context) {
    logger.warn(
      'usePopupContext used outside PopupProvider - returning safe defaults',
      'Component'
    );
    // Return safe defaults instead of throwing
    return {
      popups: [],
      activePopup: null,
      addPopup: () => '',
      removePopup: () => {},
      setActivePopup: () => {},
      updatePopup: () => {},
      clearAllPopups: () => {},
      getPopupsByType: () => [],
    };
  }
  return context;
};
