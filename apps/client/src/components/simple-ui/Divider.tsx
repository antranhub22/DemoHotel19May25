/**
 * Simple Divider Component
 * Section separators with optional text
 */

import React from 'react';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Orientation of the divider */
    orientation?: 'horizontal' | 'vertical';

    /** Visual variant */
    variant?: 'solid' | 'dashed' | 'dotted';

    /** Text to display in the center */
    text?: string;

    /** Position of the text */
    textPosition?: 'left' | 'center' | 'right';

    /** Spacing around the divider */
    spacing?: 'sm' | 'md' | 'lg';

    /** Color variant */
    color?: 'gray' | 'blue' | 'transparent';
}

const Divider: React.FC<DividerProps> = ({
    className = '',
    orientation = 'horizontal',
    variant = 'solid',
    text,
    textPosition = 'center',
    spacing = 'md',
    color = 'gray',
    ...props
}) => {

    // Color styles
    const colorStyles = {
        gray: 'border-gray-200',
        blue: 'border-blue-200',
        transparent: 'border-transparent',
    };

    // Variant styles
    const variantStyles = {
        solid: 'border-solid',
        dashed: 'border-dashed',
        dotted: 'border-dotted',
    };

    // Spacing styles
    const spacingStyles = {
        sm: orientation === 'horizontal' ? 'my-2' : 'mx-2',
        md: orientation === 'horizontal' ? 'my-4' : 'mx-4',
        lg: orientation === 'horizontal' ? 'my-6' : 'mx-6',
    };

    // Text position styles
    const textPositionStyles = {
        left: 'justify-start',
        center: 'justify-center',
        right: 'justify-end',
    };

    if (orientation === 'vertical') {
        return (
            <div
                className={`
          ${spacingStyles[spacing]}
          border-l
          ${colorStyles[color]}
          ${variantStyles[variant]}
          ${className}
        `}
                {...props}
            />
        );
    }

    // Horizontal divider with optional text
    if (text) {
        return (
            <div className={`${spacingStyles[spacing]} ${className}`} {...props}>
                <div className={`flex items-center ${textPositionStyles[textPosition]}`}>
                    {textPosition !== 'left' && (
                        <div className={`
              flex-1 border-t
              ${colorStyles[color]}
              ${variantStyles[variant]}
            `} />
                    )}

                    <span className={`
            px-3 text-sm font-medium text-gray-500 bg-white
            ${textPosition === 'left' ? 'pr-3 pl-0' : ''}
            ${textPosition === 'right' ? 'pl-3 pr-0' : ''}
          `}>
                        {text}
                    </span>

                    {textPosition !== 'right' && (
                        <div className={`
              flex-1 border-t
              ${colorStyles[color]}
              ${variantStyles[variant]}
            `} />
                    )}
                </div>
            </div>
        );
    }

    // Simple horizontal divider
    return (
        <div
            className={`
        ${spacingStyles[spacing]}
        border-t
        ${colorStyles[color]}
        ${variantStyles[variant]}
        ${className}
      `}
            {...props}
        />
    );
};

export default Divider;
