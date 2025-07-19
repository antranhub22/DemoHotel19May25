import React from 'react';

/**
 * ResponsiveContainer - Layout Management Component
 * 
 * Handles responsive layout switching between desktop and mobile
 * - Desktop: Grid-based layout with 3 columns
 * - Mobile: Overlay-based layout with fixed positioning
 */
interface ResponsiveContainerProps {
  children: {
    desktop: React.ReactNode;
    mobile: React.ReactNode;
  };
  className?: string;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <div className={`relative min-h-[400px] px-4 ${className}`}>
      {/* Desktop Layout */}
      <div className="hidden md:block">
        {children.desktop}
      </div>
      
      {/* Mobile Layout */}
      <div className="block md:hidden">
        {children.mobile}
      </div>
    </div>
  );
}; 