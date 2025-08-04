import React from "react";
import { DebugButtons } from "../features/debug/DebugButtons";
import { DebugWrapper } from "../features/debug/DebugWrapper";
import { MobileSummaryPopup } from "../features/popup-system/MobileSummaryPopup";
import RealtimeConversationPopup from "../features/popup-system/RealtimeConversationPopup";
import { SiriButtonContainer } from "../features/voice-assistant/siri/SiriButtonContainer";

interface Interface1MobileProps {
  isCallStarted: boolean;
  micLevel: number;
  showConversation: boolean;
  showingSummary: boolean;
  handleCallStart: (lang: any) => Promise<{ success: boolean; error?: string }>;
  handleCallEnd: () => void;
}

export const Interface1Mobile: React.FC<Interface1MobileProps> = ({
  isCallStarted,
  micLevel,
  showConversation,
  showingSummary,
  handleCallStart,
  handleCallEnd,
}) => {
  return (
    <div className="block md:hidden">
      <div className="w-full flex flex-col items-center justify-center min-h-[400px] relative z-50">
        <div className="flex flex-col items-center justify-center">
          {/* Siri Button Container */}
          <SiriButtonContainer
            isCallStarted={isCallStarted}
            micLevel={micLevel}
            onCallStart={async (lang) => {
              await handleCallStart(lang);
            }}
            onCallEnd={async () => {
              handleCallEnd();
            }}
            showingSummary={showingSummary}
          />
        </div>
      </div>

      {/* Mobile: Real-time conversation (overlay) - ADVANCED COMPONENT */}
      <RealtimeConversationPopup
        isOpen={showConversation}
        onClose={() => {}} // Will be handled by popup context
        layout="overlay" // Mobile: overlay positioning with built-in responsive design
      />

      {/* Mobile: Summary popup (center modal) - UNIFIED COMPONENT */}
      <MobileSummaryPopup />

      {/* Debug Buttons - Mobile */}
      <div className="block md:hidden">
        <DebugWrapper>
          <DebugButtons />
        </DebugWrapper>
      </div>
    </div>
  );
};
