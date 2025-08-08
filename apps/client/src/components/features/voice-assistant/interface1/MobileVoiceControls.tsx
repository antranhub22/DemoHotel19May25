import * as React from "react";
import { useAssistant } from "@/context";
import { useIsMobile } from "@/hooks/use-mobile";
import { Language, ServiceItem } from "@/types/interface1.types";
import logger from "@shared/utils/logger";
import {
  ChevronDown,
  ChevronUp,
  Headphones,
  Mic,
  Settings,
  Smartphone,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { VoiceLanguageSwitcher } from "./VoiceLanguageSwitcher";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { UI_CONSTANTS } from "@/lib/constants";

interface MobileVoiceControlsProps {
  selectedService?: ServiceItem | null;
  isCallActive?: boolean;
  onLanguageChange?: (language: Language) => void;
  className?: string;
}

interface TouchFeedback {
  isPressed: boolean;
  scale: number;
  haptic: boolean;
}

export const MobileVoiceControls: React.FC<MobileVoiceControlsProps> = ({
  selectedService,
  isCallActive = false,
  onLanguageChange,
  className = "",
}) => {
  const { language } = useAssistant();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({
    guidance: true,
    feedback: true,
    haptics: true,
    autoClose: true,
  });
  const [touchFeedback, setTouchFeedback] = useState<TouchFeedback>({
    isPressed: false,
    scale: 1,
    haptic: false,
  });
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();

  // Haptic feedback for mobile interactions
  const triggerHaptic = useCallback(
    (type: "light" | "medium" | "heavy" = "light") => {
      if (!isMobile || !voiceSettings.haptics) {
        return;
      }

      try {
        // Use Vibration API for haptic feedback
        if ("vibrate" in navigator) {
          const patterns = {
            light: [10],
            medium: [20],
            heavy: [30, 10, 30],
          };
          navigator.vibrate(patterns[type]);
        }
      } catch {
        logger.debug("Haptic feedback not available", "Component");
      }
    },
    [isMobile, voiceSettings.haptics],
  );

  // Enhanced touch interactions
  const handleTouchStart = useCallback(
    (action: string) => {
      setTouchFeedback({
        isPressed: true,
        scale: 0.95,
        haptic: true,
      });
      triggerHaptic("light");
      logger.debug(
        `🖱️ [MobileVoiceControls] Touch start: ${action}`,
        "Component",
      );
    },
    [triggerHaptic],
  );

  const handleTouchEnd = useCallback((action: string) => {
    setTouchFeedback({
      isPressed: false,
      scale: 1,
      haptic: false,
    });
    logger.debug(`🖱️ [MobileVoiceControls] Touch end: ${action}`, "Component");
  }, []);

  // Toggle expanded state
  const toggleExpanded = useCallback(() => {
    setIsExpanded(!isExpanded);
    triggerHaptic("medium");
    logger.debug(
      `📱 [MobileVoiceControls] Expanded: ${!isExpanded}`,
      "Component",
    );
  }, [isExpanded, triggerHaptic]);

  // Toggle settings panel
  const toggleSettings = useCallback(() => {
    setShowSettings(!showSettings);
    triggerHaptic("light");
  }, [showSettings, triggerHaptic]);

  // Update voice setting
  const updateVoiceSetting = useCallback(
    (key: keyof typeof voiceSettings, value: boolean) => {
      setVoiceSettings((prev) => ({ ...prev, [key]: value }));
      triggerHaptic("light");
      logger.debug(
        `⚙️ [MobileVoiceControls] Setting ${key}: ${value}`,
        "Component",
      );
    },
    [triggerHaptic],
  );

  // Auto-collapse when call ends
  useEffect(() => {
    if (!isCallActive && isExpanded && voiceSettings.autoClose) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCallActive, isExpanded, voiceSettings.autoClose]);

  // Language change handler
  const handleLanguageChange = useCallback(
    (newLanguage: Language) => {
      onLanguageChange?.(newLanguage);
      triggerHaptic("medium");

      // Show success feedback
      if (typeof window !== "undefined" && (window as any).addNotification) {
        (window as any).addNotification({
          type: "success",
          title: "Language Changed",
          message: `Voice assistant switched to ${newLanguage}`,
          duration: 2000,
          priority: "low",
        });
      }
    },
    [onLanguageChange, triggerHaptic],
  );

  // Don't render on desktop
  if (!isMobile) {
    return null;
  }

  return (
    <div className={`mobile-voice-controls ${className}`}>
      {/* Floating Control Panel */}
      <div
        className={`
        fixed bottom-4 left-4 right-4 
        bg-white/95 backdrop-blur-lg border border-gray-200/50 rounded-2xl shadow-2xl
        ${prefersReducedMotion ? "" : "transition-all duration-300 ease-out"}
        ${isExpanded ? "pb-4" : "pb-2"}
        ${prefersReducedMotion ? "" : touchFeedback.isPressed ? "scale-95" : "scale-100"}
        voice-particles
      `}
        style={{
          zIndex: UI_CONSTANTS.Z_INDEX.FIXED,
          willChange: prefersReducedMotion ? undefined : "transform",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
      >
        {/* Main Control Bar */}
        <div className="flex items-center justify-between p-4">
          {/* Service Indicator */}
          <div className="flex items-center gap-3 flex-1">
            <div
              className={`
              w-3 h-3 rounded-full transition-all duration-300
              ${isCallActive ? "bg-red-500 animate-pulse" : selectedService ? "bg-green-500" : "bg-gray-400"}
            `}
            />

            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-800 truncate">
                {isCallActive
                  ? "🎤 Voice Call Active"
                  : selectedService
                    ? selectedService.name
                    : "Voice Assistant"}
              </div>
              <div className="text-xs text-gray-500">
                {language.toUpperCase()} • Touch controls
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {/* Voice Settings Toggle */}
            <button
              onTouchStart={() => handleTouchStart("voice-toggle")}
              onTouchEnd={() => handleTouchEnd("voice-toggle")}
              onClick={() =>
                updateVoiceSetting("guidance", !voiceSettings.guidance)
              }
              className={`
                p-2 rounded-full transition-all duration-200 voice-control
                ${
                  voiceSettings.guidance
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-100 text-gray-400"
                }
                active:scale-90
              `}
              aria-label="Toggle voice guidance"
            >
              {voiceSettings.guidance ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            {/* Settings Toggle */}
            <button
              onTouchStart={() => handleTouchStart("settings")}
              onTouchEnd={() => handleTouchEnd("settings")}
              onClick={toggleSettings}
              className={`
                p-2 rounded-full transition-all duration-200 voice-control
                ${showSettings ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}
                active:scale-90
              `}
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Expand/Collapse Toggle */}
            <button
              onTouchStart={() => handleTouchStart("expand")}
              onTouchEnd={() => handleTouchEnd("expand")}
              onClick={toggleExpanded}
              className={`p-2 rounded-full bg-blue-100 text-blue-600 ${prefersReducedMotion ? "" : "transition-all duration-200 active:scale-90"} voice-control`}
              aria-label={isExpanded ? "Collapse controls" : "Expand controls"}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div
            className={`px-4 space-y-4 ${prefersReducedMotion ? "" : "animate-in slide-in-from-bottom duration-300"}`}
          >
            {/* Language Switcher */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Smartphone className="w-4 h-4" />
                Language Selection
              </div>
              <VoiceLanguageSwitcher
                position="inline"
                showVoicePreview={false}
                onLanguageChange={handleLanguageChange}
                className="w-full"
              />
            </div>

            {/* Voice Context Info */}
            {selectedService && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Headphones className="w-4 h-4" />
                  Voice Context
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-800">
                    {selectedService.name}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Voice assistant optimized for{" "}
                    {selectedService.name.toLowerCase()} requests
                  </div>
                  {isCallActive && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Context active during call
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Settings Panel */}
            {showSettings && (
              <div className="space-y-3 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Settings className="w-4 h-4" />
                  Voice Settings
                </div>

                <div className="space-y-3">
                  {/* Voice Guidance */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        Voice Guidance
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        updateVoiceSetting("guidance", !voiceSettings.guidance)
                      }
                      className={`
                        relative w-12 h-6 rounded-full transition-all duration-200 voice-control
                        ${voiceSettings.guidance ? "bg-green-500" : "bg-gray-300"}
                      `}
                    >
                      <div
                        className={`
                        absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200
                        ${voiceSettings.guidance ? "left-7" : "left-1"}
                      `}
                      />
                    </button>
                  </div>

                  {/* Voice Feedback */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mic className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        Voice Feedback
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        updateVoiceSetting("feedback", !voiceSettings.feedback)
                      }
                      className={`
                        relative w-12 h-6 rounded-full transition-all duration-200 voice-control
                        ${voiceSettings.feedback ? "bg-green-500" : "bg-gray-300"}
                      `}
                    >
                      <div
                        className={`
                        absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200
                        ${voiceSettings.feedback ? "left-7" : "left-1"}
                      `}
                      />
                    </button>
                  </div>

                  {/* Haptic Feedback */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        Haptic Feedback
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        updateVoiceSetting("haptics", !voiceSettings.haptics)
                      }
                      className={`
                        relative w-12 h-6 rounded-full transition-all duration-200 voice-control
                        ${voiceSettings.haptics ? "bg-green-500" : "bg-gray-300"}
                      `}
                    >
                      <div
                        className={`
                        absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200
                        ${voiceSettings.haptics ? "left-7" : "left-1"}
                      `}
                      />
                    </button>
                  </div>

                  {/* Auto Close */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        Auto Collapse
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        updateVoiceSetting(
                          "autoClose",
                          !voiceSettings.autoClose,
                        )
                      }
                      className={`
                        relative w-12 h-6 rounded-full transition-all duration-200 voice-control
                        ${voiceSettings.autoClose ? "bg-green-500" : "bg-gray-300"}
                      `}
                    >
                      <div
                        className={`
                        absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200
                        ${voiceSettings.autoClose ? "left-7" : "left-1"}
                      `}
                      />
                    </button>
                  </div>
                </div>

                {/* Close Settings */}
                <div className="pt-2 border-t border-gray-200">
                  <button
                    onClick={toggleSettings}
                    className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors voice-control"
                  >
                    Close Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status Bar */}
        <div className="px-4 pt-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  isCallActive ? "bg-red-500" : "bg-gray-400"
                }`}
              />
              {isCallActive ? "Call Active" : "Ready"}
            </div>

            <div className="flex items-center gap-1">
              {voiceSettings.guidance && <Volume2 className="w-3 h-3" />}
              {voiceSettings.haptics && <Smartphone className="w-3 h-3" />}
              <span>{language.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop for settings */}
      {showSettings && (
        <div
          className={`fixed inset-0 ${prefersReducedMotion ? "bg-black/30" : "bg-black/20 backdrop-blur-sm"}`}
          style={{ zIndex: UI_CONSTANTS.Z_INDEX.MODAL_BACKDROP }}
          onClick={toggleSettings}
        />
      )}
    </div>
  );
};
