import React from "react";
import { DebugButtons } from "../features/debug/DebugButtons";
import { DebugWrapper } from "../features/debug/DebugWrapper";
import { DesktopSummaryPopup } from "../features/popup-system/DesktopSummaryPopup";
import RealtimeConversationPopup from "../features/popup-system/RealtimeConversationPopup";
import { SiriButtonContainer } from "../features/voice-assistant/siri/SiriButtonContainer";
import { useIsMobile } from "@/hooks/useIsMobile";

interface Interface1DesktopProps {
  isCallStarted: boolean;
  micLevel: number;
  showConversation: boolean;
  showRightPanel: boolean;
  showingSummary: boolean;
  handleCallStart: (lang: any) => Promise<{ success: boolean; error?: string }>;
  handleCallEnd: () => Promise<void>;
  handleRightPanelClose: () => void;
}

export const Interface1Desktop: React.FC<Interface1DesktopProps> = ({
  isCallStarted,
  micLevel,
  showConversation,
  showingSummary,
  handleCallStart,
  handleCallEnd,
}) => {
  const isMobile = useIsMobile();

  // Force hide on mobile to prevent dual SiriButton rendering
  if (isMobile) {
    return null;
  }

  return (
    <div className="hidden sm:block">
      {/* Row 1: 3-Column Layout - Chat Popup | Siri | Summary Popup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 items-center justify-items-center min-h-[300px] sm:min-h-[350px] md:min-h-[400px] mb-4 sm:mb-6 md:mb-8">
        {/* Column 1: Real-time Conversation (Left) */}
        <div className="w-full sm:col-span-2 md:col-span-1 max-w-sm">
          <RealtimeConversationPopup
            isOpen={showConversation}
            onClose={() => {}}
            layout="grid"
          />
        </div>

        {/* Column 2: Siri Button (Center) - Improved sizing and positioning */}
        <div className="flex flex-col items-center justify-center w-full sm:col-span-2 md:col-span-1 max-w-md">
          <div className="flex items-center justify-center p-4">
            {/* Siri Button Container */}
            <SiriButtonContainer
              isCallStarted={isCallStarted}
              micLevel={micLevel}
              onCallStart={async (lang) => {
                await handleCallStart(lang);
              }}
              onCallEnd={handleCallEnd}
              showingSummary={showingSummary}
            />
          </div>
        </div>

        {/* Column 3: Summary Popup (Right) */}
        <div className="w-full sm:col-span-2 md:col-span-1 max-w-sm">
          <DesktopSummaryPopup />
        </div>
      </div>

      {/* Row 2: Notification (Center, below Siri) */}
      <div className="flex justify-center mb-4 sm:mb-6 md:mb-8">
        <div className="w-full max-w-sm">
          {/* Placeholder for future Notification popup */}
          {/* <NotificationSection /> */}
        </div>
      </div>

      {/* Debug Buttons - Desktop */}
      <div className="hidden md:block">
        <DebugWrapper>
          <DebugButtons />
        </DebugWrapper>
      </div>
    </div>
  );
};
