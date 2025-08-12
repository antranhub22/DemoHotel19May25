import { useIsMobile } from "@/hooks/useIsMobile";
import React from "react";
import { DebugButtons } from "../features/debug/DebugButtons";
import { DebugWrapper } from "../features/debug/DebugWrapper";
import RealtimeConversationPopup from "../features/popup-system/RealtimeConversationPopup";
import { UnifiedSummaryPopup } from "../features/popup-system/UnifiedSummaryPopup";
import { SiriButtonContainer } from "../features/voice-assistant/siri/SiriButtonContainer";

interface UnifiedInterface1Props {
  isCallStarted: boolean;
  micLevel: number;
  showConversation: boolean;
  showingSummary: boolean;
  handleCallStart: (lang: any) => Promise<{ success: boolean; error?: string }>;
  handleCallEnd: () => Promise<void>;
}

/**
 * UNIFIED INTERFACE COMPONENT
 *
 * Replaces:
 * - Interface1Desktop
 * - Interface1Mobile
 *
 * Single component with responsive layouts
 */
export const UnifiedInterface1: React.FC<UnifiedInterface1Props> = ({
  isCallStarted,
  micLevel,
  showConversation,
  showingSummary,
  handleCallStart,
  handleCallEnd,
}) => {
  const isMobile = useIsMobile();

  // ✅ MOBILE LAYOUT: Stack layout with overlays
  if (isMobile) {
    return (
      <div className="block sm:hidden">
        {/* Main Content: Siri Button */}
        <div className="w-full flex flex-col items-center justify-center min-h-[300px] sm:min-h-[350px] relative z-50">
          <div className="flex flex-col items-center justify-center">
            <SiriButtonContainer
              isCallStarted={isCallStarted}
              micLevel={micLevel}
              onCallStart={async (lang) => {
                await handleCallStart(lang);
              }}
              onCallEnd={async () => {
                await handleCallEnd();
              }}
              showingSummary={showingSummary}
            />
          </div>
        </div>

        {/* Overlay: Real-time Conversation */}
        <RealtimeConversationPopup
          isOpen={showConversation}
          onClose={() => {}} // Handled by popup context
          layout="overlay"
        />

        {/* Overlay: Summary Popup */}
        <UnifiedSummaryPopup />

        {/* Debug Section */}
        <div className="block sm:hidden">
          <DebugWrapper>
            <DebugButtons />
          </DebugWrapper>
        </div>
      </div>
    );
  }

  // ✅ DESKTOP LAYOUT: 3-column grid layout
  return (
    <div className="hidden sm:block">
      {/* Row 1: 3-Column Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 items-center justify-items-center min-h-[300px] sm:min-h-[350px] md:min-h-[400px] mb-4 sm:mb-6 md:mb-8">
        {/* Column 1: Real-time Conversation (Left) */}
        <div className="w-full sm:col-span-2 md:col-span-1 max-w-sm">
          <RealtimeConversationPopup
            isOpen={showConversation}
            onClose={() => {}}
            layout="grid"
          />
        </div>

        {/* Column 2: Siri Button (Center) */}
        <div className="flex flex-col items-center justify-center w-full sm:col-span-2 md:col-span-1 max-w-md">
          <div className="flex items-center justify-center p-4">
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
          <UnifiedSummaryPopup />
        </div>
      </div>

      {/* Row 2: Notification Section (Future) */}
      <div className="flex justify-center mb-4 sm:mb-6 md:mb-8">
        <div className="w-full max-w-sm">
          {/* Placeholder for future notification components */}
          {/* <NotificationSection /> */}
        </div>
      </div>

      {/* Debug Section */}
      <div className="hidden md:block">
        <DebugWrapper>
          <DebugButtons />
        </DebugWrapper>
      </div>
    </div>
  );
};
