/**
 * CardDescription Component - Wrapper for compatibility
 * Simple description component for cards
 */

import React from 'react';

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> { }

const CardDescription: React.FC<CardDescriptionProps> = ({
    className = '',
    children,
    ...props
}) => {
    return (
        <p
            className={`text-sm text-gray-600 ${className}`}
            {...props}
        >
            {children}
        </p>
    );
};

export default CardDescription;
