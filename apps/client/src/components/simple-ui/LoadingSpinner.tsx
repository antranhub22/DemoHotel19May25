/**
 * Simple Loading Spinner Component
 * Lightweight loading indicator with different sizes
 */

import React from 'react';

export interface LoadingSpinnerProps {
    /** Size of the spinner */
    size?: 'sm' | 'md' | 'lg' | 'xl';

    /** Color variant */
    variant?: 'primary' | 'secondary' | 'white';

    /** Loading text */
    text?: string;

    /** Whether to center the spinner */
    centered?: boolean;

    /** Additional className */
    className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    variant = 'primary',
    text,
    centered = false,
    className = '',
}) => {

    // Size styles
    const sizeStyles = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12',
    };

    // Color styles
    const colorStyles = {
        primary: 'text-blue-600',
        secondary: 'text-gray-600',
        white: 'text-white',
    };

    // Text size styles
    const textSizeStyles = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
    };

    const spinnerClasses = [
        'animate-spin',
        sizeStyles[size],
        colorStyles[variant],
        className,
    ].filter(Boolean).join(' ');

    const containerClasses = [
        'flex items-center',
        text ? 'gap-3' : '',
        centered && 'justify-center',
    ].filter(Boolean).join(' ');

    const SpinnerIcon = () => (
        <svg
            className={spinnerClasses}
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

    if (!text) {
        return <SpinnerIcon />;
    }

    return (
        <div className={containerClasses}>
            <SpinnerIcon />
            <span className={`${textSizeStyles[size]} ${colorStyles[variant]}`}>
                {text}
            </span>
        </div>
    );
};

// Voice-specific loading spinner with pulsing animation
export const VoiceLoadingSpinner: React.FC<Omit<LoadingSpinnerProps, 'variant'>> = ({
    size = 'lg',
    text = 'Đang kết nối...',
    centered = true,
    className = '',
}) => {

    const sizeStyles = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-20 h-20',
    };

    return (
        <div className={`flex flex-col items-center gap-4 ${centered ? 'justify-center' : ''}`}>
            <div className="relative">
                {/* Outer pulsing ring */}
                <div className={`
          ${sizeStyles[size]} 
          rounded-full bg-blue-100 
          animate-ping absolute inset-0
        `} />

                {/* Middle ring */}
                <div className={`
          ${sizeStyles[size]} 
          rounded-full bg-blue-200 
          animate-pulse absolute inset-0
        `} />

                {/* Inner spinning circle */}
                <div className={`
          ${sizeStyles[size]} 
          rounded-full border-4 border-blue-600 border-t-transparent 
          animate-spin relative
        `} />

                {/* Center dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                </div>
            </div>

            {text && (
                <p className="text-gray-600 text-sm font-medium animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );
};

export default LoadingSpinner;
