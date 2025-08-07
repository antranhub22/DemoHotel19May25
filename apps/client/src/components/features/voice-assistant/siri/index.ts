// Language type import - needed for interface definitions
type Language = 'en' | 'vi' | 'fr' | 'zh' | 'ru' | 'ko';

// Siri System Components
export { SimpleMobileSiriVisual } from './SimpleMobileSiriVisual.tsx';
export { SiriButton } from './SiriButton.ts';
export { SiriButtonContainer } from './SiriButtonContainer.tsx';
export { default as SiriCallButton } from './SiriCallButton.tsx';

// Debugging Components
export { MobileTouchDebugger } from './MobileTouchDebugger.tsx';

// Custom Hooks
export { useCallProtection } from './hooks/useCallProtection.ts';
export { useLanguageColors } from './hooks/useLanguageColors.ts';
export { useSiriAnimation } from './hooks/useSiriAnimation.ts';
export { useSiriButtonEvents } from './hooks/useSiriButtonEvents.ts';
export { useSiriButtonState } from './hooks/useSiriButtonState.ts';
export { useSiriButtonVisual } from './hooks/useSiriButtonVisual.ts';
export { useTouchDebugger } from './hooks/useTouchDebugger.ts';

// UI Components
export { DebugPanel } from './components/DebugPanel.tsx';
export { SiriButtonStatus } from './components/SiriButtonStatus.tsx';
export { SiriButtonVisual } from './components/SiriButtonVisual.tsx';

// Constants
export { LANGUAGE_COLORS } from './constants/languageColors.ts';
export type { LanguageColorScheme } from './constants/languageColors.ts';

// 🚀 PHASE 2: Modular Architecture Components
export * from './modules';

// Types
export interface SiriCallButtonProps {
  containerId: string;
  isListening: boolean;
  volumeLevel: number;
  onCallStart?: () => Promise<void>;
  onCallEnd?: () => void;
  language?: Language;
  colors?: {
    primary: string;
    secondary: string;
    glow: string;
    name: string;
  };
}

export interface SiriButtonContainerProps {
  isCallStarted: boolean;
  micLevel: number;
  onCallStart: (lang: Language) => Promise<void>;
  onCallEnd: () => void;
  // ✅ REMOVED: onCancel and onConfirm are no longer needed
  showingSummary?: boolean;
  _showingSummary?: boolean;
}
