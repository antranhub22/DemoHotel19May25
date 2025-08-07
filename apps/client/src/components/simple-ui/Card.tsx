/**
 * Simple Card Component
 * Clean container with subtle shadow and rounded corners
 */

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Visual variant of the card */
    variant?: 'default' | 'outlined' | 'elevated' | 'voice';

    /** Padding size */
    padding?: 'none' | 'sm' | 'md' | 'lg';

    /** Whether the card is interactive (hover effects) */
    interactive?: boolean;

    /** Header content */
    header?: React.ReactNode;

    /** Footer content */
    footer?: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({
        className = '',
        variant = 'default',
        padding = 'md',
        interactive = false,
        header,
        footer,
        children,
        ...props
    }, ref) => {

        // Base styles
        const baseStyles = [
            'bg-white',
            'rounded-lg',
            'transition-all duration-200',
        ];

        // Variant styles
        const variantStyles = {
            default: ['border border-gray-200', 'shadow-sm'],
            outlined: ['border-2 border-gray-300'],
            elevated: ['shadow-lg border border-gray-100'],
            voice: [
                'border border-blue-200',
                'shadow-md',
                'bg-gradient-to-br from-white to-blue-50',
            ],
        };

        // Padding styles
        const paddingStyles = {
            none: '',
            sm: 'p-3',
            md: 'p-4 sm:p-6', // Responsive padding
            lg: 'p-6 sm:p-8',
        };

        // Interactive styles
        const interactiveStyles = interactive ? [
            'cursor-pointer',
            'hover:shadow-md',
            'hover:scale-[1.02]',
            'active:scale-[0.98]',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        ] : [];

        // Combine all styles
        const cardClasses = [
            ...baseStyles,
            ...variantStyles[variant],
            padding !== 'none' && paddingStyles[padding],
            ...interactiveStyles,
            className,
        ].filter(Boolean).join(' ');

        return (
            <div
                ref={ref}
                className={cardClasses}
                {...(interactive && { tabIndex: 0, role: 'button' })}
                {...props}
            >
                {header && (
                    <div className={`
            ${padding !== 'none' ? 'mb-4' : 'mb-0'}
            border-b border-gray-100 pb-3
          `}>
                        {header}
                    </div>
                )}

                <div className={padding === 'none' && (header || footer) ? 'p-4 sm:p-6' : ''}>
                    {children}
                </div>

                {footer && (
                    <div className={`
            ${padding !== 'none' ? 'mt-4' : 'mt-0'}
            border-t border-gray-100 pt-3
          `}>
                        {footer}
                    </div>
                )}
            </div>
        );
    }
);

Card.displayName = 'Card';

// Compound components for better organization
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className = '',
    children,
    ...props
}) => (
    <div className={`font-semibold text-lg text-gray-900 ${className}`} {...props}>
        {children}
    </div>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className = '',
    children,
    ...props
}) => (
    <div className={`text-gray-600 ${className}`} {...props}>
        {children}
    </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className = '',
    children,
    ...props
}) => (
    <div className={`flex items-center justify-between ${className}`} {...props}>
        {children}
    </div>
);

export default Card;
