/**
 * Simple Button Component
 * Replaces shadcn Button with minimal, clean design
 */

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Visual variant of the button */
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'voice';

    /** Size of the button */
    size?: 'sm' | 'md' | 'lg' | 'icon';

    /** Whether the button is in loading state */
    loading?: boolean;

    /** Icon to display (can be any React node) */
    icon?: React.ReactNode;

    /** Whether the icon should appear after the text */
    iconPosition?: 'left' | 'right';

    /** Full width button */
    fullWidth?: boolean;

    /** Rounded button (good for voice controls) */
    rounded?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        className = '',
        variant = 'primary',
        size = 'md',
        loading = false,
        icon,
        iconPosition = 'left',
        fullWidth = false,
        rounded = false,
        disabled,
        children,
        type = 'button',
        ...props
    }, ref) => {

        // Base styles - mobile-first
        const baseStyles = [
            'inline-flex items-center justify-center',
            'font-medium',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'active:scale-95', // Touch feedback
        ];

        // Variant styles
        const variantStyles = {
            primary: [
                'bg-blue-600 text-white',
                'hover:bg-blue-700',
                'focus:ring-blue-500',
                'active:bg-blue-800',
            ],
            secondary: [
                'bg-gray-100 text-gray-700 border border-gray-300',
                'hover:bg-gray-200',
                'focus:ring-gray-500',
                'active:bg-gray-300',
            ],
            danger: [
                'bg-red-600 text-white',
                'hover:bg-red-700',
                'focus:ring-red-500',
                'active:bg-red-800',
            ],
            ghost: [
                'bg-transparent text-gray-700',
                'hover:bg-gray-100',
                'focus:ring-gray-500',
                'active:bg-gray-200',
            ],
            voice: [
                'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
                'hover:from-blue-600 hover:to-blue-700',
                'focus:ring-blue-500',
                'shadow-lg hover:shadow-xl',
                'active:from-blue-700 active:to-blue-800',
            ],
        };

        // Size styles - touch-friendly
        const sizeStyles = {
            sm: ['px-3 py-2 text-sm rounded-md', 'min-h-[36px]'],
            md: ['px-4 py-3 text-base rounded-lg', 'min-h-[44px]'], // Touch-friendly
            lg: ['px-6 py-4 text-lg rounded-lg', 'min-h-[48px]'],
            icon: ['p-3 rounded-lg', 'min-h-[44px] min-w-[44px]'], // Square, touch-friendly
        };

        // Additional modifiers
        const modifierStyles = [
            fullWidth && 'w-full',
            rounded && 'rounded-full',
            loading && 'pointer-events-none',
        ].filter(Boolean);

        // Combine all styles
        const buttonClasses = [
            ...baseStyles,
            ...variantStyles[variant],
            ...sizeStyles[size],
            ...modifierStyles,
            className,
        ].filter(Boolean).join(' ');

        // Loading spinner component
        const LoadingSpinner = () => (
            <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
            </svg>
        );

        // Icon rendering
        const renderIcon = () => {
            if (!icon) return null;

            return (
                <span className={`
          ${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}
          ${children && iconPosition === 'left' ? 'mr-2' : ''}
          ${children && iconPosition === 'right' ? 'ml-2' : ''}
        `}>
                    {icon}
                </span>
            );
        };

        return (
            <button
                ref={ref}
                type={type}
                className={buttonClasses}
                disabled={disabled || loading}
                {...props}
            >
                {loading && <LoadingSpinner />}
                {!loading && icon && iconPosition === 'left' && renderIcon()}
                {children}
                {!loading && icon && iconPosition === 'right' && renderIcon()}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
