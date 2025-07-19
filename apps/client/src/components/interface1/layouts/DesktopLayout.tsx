import React from 'react';

/**
 * DesktopLayout - Desktop Grid Layout Component
 * 
 * Implements 3-column grid layout for desktop:
 * - Column 1: Right Panel (Left)
 * - Column 2: Siri Button (Center) 
 * - Column 3: Summary/Conversation Popup (Right)
 * 
 * Plus additional row for future notification section
 */
interface DesktopLayoutProps {
  conversation: React.ReactNode;
  siriButton: React.ReactNode;
  rightPanel: React.ReactNode;
  className?: string;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  conversation,
  siriButton,
  rightPanel,
  className = ""
}) => {
  return (
    <div className={className}>
      {/* Row 1: 3-Column Grid Layout - Right Panel | Siri | Summary */}
      <div className="grid grid-cols-3 gap-8 items-center justify-items-center min-h-[400px] mb-8">
        
        {/* Column 1: Right Panel (Left) */}
        <div className="w-full max-w-sm">
          {rightPanel}
        </div>
        
        {/* Column 2: Siri Button (Center) - Improved sizing and positioning */}
        <div className="flex flex-col items-center justify-center w-full max-w-md">
          <div className="flex items-center justify-center p-4">
            {siriButton}
          </div>
        </div>
        
        {/* Column 3: Summary/Conversation Popup (Right) */}
        <div className="w-full max-w-sm">
          {conversation}
        </div>
        
      </div>
      
      {/* Row 2: Notification Section (Center, below Siri) - Future Feature */}
      <div className="flex justify-center mb-8">
        <div className="w-full max-w-sm">
          {/* Placeholder for future Notification popup */}
          {/* <NotificationSection /> */}
        </div>
      </div>
      
    </div>
  );
}; 