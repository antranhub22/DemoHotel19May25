/**
 * Simple Toast Component
 * Notification system with auto-dismiss
 */

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export interface ToastProps {
    /** Unique ID for the toast */
    id: string;

    /** Toast message */
    message: string;

    /** Toast type */
    type?: 'success' | 'warning' | 'error' | 'info';

    /** Duration in milliseconds (0 = no auto dismiss) */
    duration?: number;

    /** Position of the toast */
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

    /** Callback when toast is dismissed */
    onDismiss?: (id: string) => void;

    /** Whether to show close button */
    closable?: boolean;

    /** Icon to display */
    icon?: React.ReactNode;
}

const Toast: React.FC<ToastProps> = ({
    id,
    message,
    type = 'info',
    duration = 4000,
    position = 'top-right',
    onDismiss,
    closable = true,
    icon,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        // Show animation
        setIsVisible(true);

        // Auto dismiss
        if (duration > 0) {
            const timer = setTimeout(() => {
                handleDismiss();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration]);

    const handleDismiss = () => {
        setIsLeaving(true);
        setTimeout(() => {
            onDismiss?.(id);
        }, 300); // Animation duration
    };

    // Type styles
    const typeStyles = {
        success: {
            bg: 'bg-green-50 border-green-200',
            text: 'text-green-800',
            icon: '✅',
        },
        warning: {
            bg: 'bg-orange-50 border-orange-200',
            text: 'text-orange-800',
            icon: '⚠️',
        },
        error: {
            bg: 'bg-red-50 border-red-200',
            text: 'text-red-800',
            icon: '❌',
        },
        info: {
            bg: 'bg-blue-50 border-blue-200',
            text: 'text-blue-800',
            icon: 'ℹ️',
        },
    };

    // Position styles
    const positionStyles = {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
        'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
    };

    // Animation classes
    const animationClasses = `
    transition-all duration-300 ease-in-out
    ${isVisible && !isLeaving ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'}
  `;

    const toastContent = (
        <div
            className={`
        fixed z-50 max-w-sm w-full mx-auto
        ${positionStyles[position]}
        ${animationClasses}
      `}
            style={{ zIndex: 1070 }}
        >
            <div className={`
        ${typeStyles[type].bg}
        ${typeStyles[type].text}
        border rounded-lg shadow-lg p-4
        flex items-start gap-3
      `}>
                {/* Icon */}
                <div className="flex-shrink-0">
                    {icon || <span className="text-lg">{typeStyles[type].icon}</span>}
                </div>

                {/* Message */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-5">
                        {message}
                    </p>
                </div>

                {/* Close button */}
                {closable && (
                    <button
                        onClick={handleDismiss}
                        className={`
              flex-shrink-0 ml-2
              ${typeStyles[type].text}
              hover:opacity-70 focus:opacity-70
              focus:outline-none
              transition-opacity duration-150
            `}
                        aria-label="Dismiss"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );

    return createPortal(toastContent, document.body);
};

// Toast Manager Hook
export interface ToastItem extends Omit<ToastProps, 'id' | 'onDismiss'> {
    id?: string;
}

export const useToast = () => {
    const [toasts, setToasts] = useState<ToastProps[]>([]);

    const addToast = (toast: ToastItem) => {
        const id = toast.id || `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newToast: ToastProps = {
            ...toast,
            id,
            onDismiss: removeToast,
        };

        setToasts(prev => [...prev, newToast]);
        return id;
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const clearToasts = () => {
        setToasts([]);
    };

    return {
        toasts,
        addToast,
        removeToast,
        clearToasts,
        // Convenience methods
        success: (message: string, options?: Partial<ToastItem>) =>
            addToast({ ...options, message, type: 'success' }),
        warning: (message: string, options?: Partial<ToastItem>) =>
            addToast({ ...options, message, type: 'warning' }),
        error: (message: string, options?: Partial<ToastItem>) =>
            addToast({ ...options, message, type: 'error' }),
        info: (message: string, options?: Partial<ToastItem>) =>
            addToast({ ...options, message, type: 'info' }),
    };
};

// Toast Container Component
export const ToastContainer: React.FC = () => {
    const { toasts } = useToast();

    return (
        <>
            {toasts.map(toast => (
                <Toast key={toast.id} {...toast} />
            ))}
        </>
    );
};

export default Toast;
