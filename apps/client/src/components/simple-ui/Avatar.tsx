/**
 * Simple Avatar Component
 * User profile images with fallbacks
 */

import React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Image source URL */
    src?: string;

    /** Alt text for the image */
    alt?: string;

    /** Size of the avatar */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

    /** Fallback text (usually initials) */
    fallback?: string;

    /** Shape of the avatar */
    shape?: 'circle' | 'square';

    /** Color variant for fallback */
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';

    /** Whether to show online indicator */
    online?: boolean;

    /** Whether the avatar is clickable */
    clickable?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({
    className = '',
    src,
    alt,
    size = 'md',
    fallback,
    shape = 'circle',
    variant = 'default',
    online,
    clickable = false,
    onClick,
    ...props
}) => {

    // Size styles
    const sizeStyles = {
        xs: 'w-6 h-6 text-xs',
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
        xl: 'w-16 h-16 text-xl',
        '2xl': 'w-20 h-20 text-2xl',
    };

    // Shape styles
    const shapeStyles = {
        circle: 'rounded-full',
        square: 'rounded-lg',
    };

    // Variant styles for fallback
    const variantStyles = {
        default: 'bg-gray-100 text-gray-600',
        primary: 'bg-blue-100 text-blue-600',
        success: 'bg-green-100 text-green-600',
        warning: 'bg-orange-100 text-orange-600',
        danger: 'bg-red-100 text-red-600',
    };

    // Online indicator size
    const indicatorSize = {
        xs: 'w-1.5 h-1.5',
        sm: 'w-2 h-2',
        md: 'w-2.5 h-2.5',
        lg: 'w-3 h-3',
        xl: 'w-4 h-4',
        '2xl': 'w-5 h-5',
    };

    // Base classes
    const baseClasses = [
        'relative inline-flex items-center justify-center',
        'font-medium',
        'select-none',
        'overflow-hidden',
        sizeStyles[size],
        shapeStyles[shape],
        clickable && 'cursor-pointer hover:opacity-80 transition-opacity',
        className,
    ].filter(Boolean).join(' ');

    // Fallback initials
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    const displayFallback = fallback || (alt ? getInitials(alt) : '?');

    return (
        <div
            className={baseClasses}
            onClick={onClick}
            {...props}
        >
            {src ? (
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // Hide image on error to show fallback
                        e.currentTarget.style.display = 'none';
                    }}
                />
            ) : (
                <div className={`
          w-full h-full flex items-center justify-center
          ${variantStyles[variant]}
        `}>
                    {displayFallback}
                </div>
            )}

            {/* Online indicator */}
            {online && (
                <div className={`
          absolute bottom-0 right-0
          ${indicatorSize[size]}
          bg-green-400 border-2 border-white rounded-full
        `} />
            )}
        </div>
    );
};

export default Avatar;
