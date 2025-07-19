import React from 'react';

/**
 * MobileLayout - Mobile Overlay Layout Component
 * 
 * Implements mobile-first overlay layout:
 * - Center: Siri Button (main interaction)
 * - Fixed overlays: Conversation popup (bottom), Right panel (top-right)
 * - Z-index management for proper layering
 */
interface MobileLayoutProps {
  siriButton: React.ReactNode;
  conversation: React.ReactNode;
  rightPanel: React.ReactNode;
  className?: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  siriButton,
  conversation,
  rightPanel,
  className = ""
}) => {
  return (
    <div className={className}>
      {/* Center: Siri Button - Main interaction area */}
      <div className="w-full flex flex-col items-center justify-center min-h-[400px] relative z-50">
        <div className="flex flex-col items-center justify-center">
          {siriButton}
        </div>
      </div>
      
      {/* Fixed Overlay: Conversation popup (bottom) */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        {conversation}
      </div>
      
      {/* Fixed Overlay: Right panel (top-right) */}
      <div className="absolute top-8 right-4 w-80 z-10 pointer-events-auto">
        {rightPanel}
      </div>
      
    </div>
  );
}; 