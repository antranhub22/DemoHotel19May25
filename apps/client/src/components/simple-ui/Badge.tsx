/**
 * Simple Badge Component
 * Status indicators and labels
 */

import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    /** Visual variant of the badge */
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'voice';

    /** Size of the badge */
    size?: 'sm' | 'md' | 'lg';

    /** Whether the badge is rounded (pill shape) */
    rounded?: boolean;

    /** Whether the badge has a dot indicator */
    dot?: boolean;

    /** Icon to display */
    icon?: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
    className = '',
    variant = 'default',
    size = 'md',
    rounded = false,
    dot = false,
    icon,
    children,
    ...props
}) => {

    // Base styles
    const baseStyles = [
        'inline-flex items-center',
        'font-medium',
        'transition-colors duration-150',
    ];

    // Variant styles
    const variantStyles = {
        default: 'bg-gray-100 text-gray-800',
        primary: 'bg-blue-100 text-blue-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-orange-100 text-orange-800',
        danger: 'bg-red-100 text-red-800',
        voice: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900',
    };

    // Size styles
    const sizeStyles = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-2.5 py-1.5 text-sm',
        lg: 'px-3 py-2 text-base',
    };

    // Border radius
    const radiusStyles = rounded ? 'rounded-full' : 'rounded-md';

    // Dot styles
    const dotSize = {
        sm: 'w-1.5 h-1.5',
        md: 'w-2 h-2',
        lg: 'w-2.5 h-2.5',
    };

    // Icon size
    const iconSize = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    // Combine all styles
    const badgeClasses = [
        ...baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        radiusStyles,
        className,
    ].filter(Boolean).join(' ');

    return (
        <span className={badgeClasses} {...props}>
            {/* Dot indicator */}
            {dot && (
                <span className={`
          ${dotSize[size]} rounded-full mr-1.5
          ${variant === 'default' ? 'bg-gray-400' :
                        variant === 'primary' ? 'bg-blue-500' :
                            variant === 'success' ? 'bg-green-500' :
                                variant === 'warning' ? 'bg-orange-500' :
                                    variant === 'danger' ? 'bg-red-500' :
                                        'bg-blue-500'}
        `} />
            )}

            {/* Icon */}
            {icon && (
                <span className={`
          ${iconSize[size]} mr-1.5
        `}>
                    {icon}
                </span>
            )}

            {children}
        </span>
    );
};

export default Badge;
