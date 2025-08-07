/**
 * CardTitle Component - Wrapper for compatibility
 * Simple title component for cards
 */

import React from 'react';

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    /** Title level */
    level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const CardTitle: React.FC<CardTitleProps> = ({
    className = '',
    level = 'h3',
    children,
    ...props
}) => {
    const Component = level;

    return (
        <Component
            className={`font-semibold leading-none tracking-tight ${className}`}
            {...props}
        >
            {children}
        </Component>
    );
};

export default CardTitle;
