import { Language } from "@/types/interface1.types";
import React from "react";
import { LanguageColorScheme } from "../constants/languageColors";

interface SiriButtonStatusProps {
  isCallStarted: boolean;
  isConfirming: boolean;
  language: Language;
  colors: LanguageColorScheme;
}

export const SiriButtonStatus: React.FC<SiriButtonStatusProps> = ({
  isCallStarted,
  isConfirming,
  language: _language,
  colors,
}) => {
  return (
    <>
      {/* Enhanced Status text with better accessibility */}
      <div
        id="voice-button-status"
        className="block mt-4 text-center transition-all duration-300"
        role="status"
        aria-live="polite"
        style={{
          fontSize: "1rem",
          fontWeight: "600",
        }}
      >
        {isConfirming ? (
          <div
            style={{
              color: "#808080",
              textShadow: `0 2px 8px rgba(128, 128, 128, 0.3)`,
            }}
            aria-label="Processing call summary, please wait"
          >
            📋 Processing call summary...
          </div>
        ) : isCallStarted ? (
          <div
            style={{
              color: colors.primary,
              textShadow: `0 2px 8px ${colors.glow}`,
            }}
            aria-label={`Voice call active in ${colors.name}. Tap or press Enter to end call`}
          >
            🎤 Listening... Tap to end call
          </div>
        ) : (
          <div
            style={{
              color: colors.primary,
              textShadow: `0 2px 8px ${colors.glow}`,
            }}
            aria-label={`Voice assistant ready in ${colors.name}. Tap or press Enter to start speaking`}
          >
            Tap To Speak
          </div>
        )}
      </div>

      {/* Keyboard Navigation Hint */}
      <div className="mt-2 text-xs text-gray-500 text-center opacity-70">
        Press Space or Enter to {isCallStarted ? "end" : "start"} voice call
      </div>
    </>
  );
};
