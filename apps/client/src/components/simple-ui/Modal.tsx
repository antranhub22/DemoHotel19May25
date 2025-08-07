/**
 * Simple Modal Component
 * Clean overlay dialog with backdrop
 */

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface ModalProps {
    /** Whether the modal is open */
    open: boolean;

    /** Function to call when the modal should close */
    onClose: () => void;

    /** Modal title */
    title?: string;

    /** Modal size */
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';

    /** Whether to show close button */
    showCloseButton?: boolean;

    /** Whether clicking backdrop closes modal */
    closeOnBackdropClick?: boolean;

    /** Whether pressing Escape closes modal */
    closeOnEscape?: boolean;

    /** Additional class for modal content */
    className?: string;

    /** Modal content */
    children: React.ReactNode;

    /** Footer content */
    footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
    open,
    onClose,
    title,
    size = 'md',
    showCloseButton = true,
    closeOnBackdropClick = true,
    closeOnEscape = true,
    className = '',
    children,
    footer,
}) => {

    // Handle escape key
    useEffect(() => {
        if (!open || !closeOnEscape) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [open, closeOnEscape, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (!open) return;

        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, [open]);

    if (!open) return null;

    // Size styles - mobile-first
    const sizeStyles = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-2xl',
        full: 'max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]',
    };

    // Handle backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && closeOnBackdropClick) {
            onClose();
        }
    };

    const modalContent = (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ zIndex: 1040 }}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={handleBackdropClick}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                className={`
          relative bg-white rounded-lg shadow-xl w-full
          ${sizeStyles[size]}
          max-h-[90vh] overflow-hidden
          transform transition-all
          ${className}
        `}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'modal-title' : undefined}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        {title && (
                            <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
                                {title}
                            </h2>
                        )}

                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="
                  p-2 text-gray-400 hover:text-gray-600
                  rounded-lg hover:bg-gray-100
                  transition-colors duration-150
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                "
                                aria-label="Close modal"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                )}

                {/* Content */}
                <div className={`
          p-4 overflow-y-auto
          ${footer ? 'max-h-[calc(90vh-140px)]' : 'max-h-[calc(90vh-80px)]'}
        `}>
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );

    // Render to portal
    return createPortal(modalContent, document.body);
};

export default Modal;
