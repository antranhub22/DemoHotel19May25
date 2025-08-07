/**
 * Simple Input Component
 * Clean text input with validation states
 */

import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Visual variant of the input */
    variant?: 'default' | 'error' | 'success';

    /** Size of the input */
    size?: 'sm' | 'md' | 'lg';

    /** Whether the input is in error state */
    error?: boolean;

    /** Error message to display */
    errorMessage?: string;

    /** Help text */
    helpText?: string;

    /** Label for the input */
    label?: string;

    /** Whether the label is required */
    required?: boolean;

    /** Icon to display (left side) */
    icon?: React.ReactNode;

    /** Action button on the right */
    rightElement?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({
        className = '',
        variant = 'default',
        size = 'md',
        error = false,
        errorMessage,
        helpText,
        label,
        required = false,
        icon,
        rightElement,
        id,
        ...props
    }, ref) => {

        const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
        const actualVariant = error ? 'error' : variant;

        // Base styles - mobile-first
        const baseStyles = [
            'w-full',
            'border rounded-lg',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'disabled:bg-gray-50',
        ];

        // Variant styles
        const variantStyles = {
            default: [
                'border-gray-300',
                'focus:border-blue-500 focus:ring-blue-500',
                'hover:border-gray-400',
            ],
            error: [
                'border-red-300 bg-red-50',
                'focus:border-red-500 focus:ring-red-500',
                'text-red-900 placeholder-red-400',
            ],
            success: [
                'border-green-300 bg-green-50',
                'focus:border-green-500 focus:ring-green-500',
                'text-green-900 placeholder-green-400',
            ],
        };

        // Size styles - touch-friendly
        const sizeStyles = {
            sm: ['px-3 py-2 text-sm', 'min-h-[36px]'],
            md: ['px-4 py-3 text-base', 'min-h-[44px]'], // Touch-friendly
            lg: ['px-5 py-4 text-lg', 'min-h-[48px]'],
        };

        // Icon padding adjustments
        const iconPadding = icon ? {
            sm: 'pl-10',
            md: 'pl-11',
            lg: 'pl-12',
        } : {};

        const rightElementPadding = rightElement ? {
            sm: 'pr-10',
            md: 'pr-11',
            lg: 'pr-12',
        } : {};

        // Combine all styles
        const inputClasses = [
            ...baseStyles,
            ...variantStyles[actualVariant],
            ...sizeStyles[size],
            iconPadding[size],
            rightElementPadding[size],
            className,
        ].filter(Boolean).join(' ');

        return (
            <div className="w-full">
                {/* Label */}
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                {/* Input Container */}
                <div className="relative">
                    {/* Left Icon */}
                    {icon && (
                        <div className={`
              absolute left-0 inset-y-0 flex items-center
              ${size === 'sm' ? 'pl-3' : size === 'lg' ? 'pl-4' : 'pl-3.5'}
            `}>
                            <span className={`
                text-gray-400
                ${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}
              `}>
                                {icon}
                            </span>
                        </div>
                    )}

                    {/* Input */}
                    <input
                        ref={ref}
                        id={inputId}
                        className={inputClasses}
                        {...props}
                    />

                    {/* Right Element */}
                    {rightElement && (
                        <div className={`
              absolute right-0 inset-y-0 flex items-center
              ${size === 'sm' ? 'pr-3' : size === 'lg' ? 'pr-4' : 'pr-3.5'}
            `}>
                            {rightElement}
                        </div>
                    )}
                </div>

                {/* Help Text / Error Message */}
                {(helpText || errorMessage) && (
                    <p className={`
            mt-2 text-sm
            ${error || errorMessage ? 'text-red-600' : 'text-gray-500'}
          `}>
                        {errorMessage || helpText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
