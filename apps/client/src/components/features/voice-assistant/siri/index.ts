// Language type import - needed for interface definitions
type Language = 'en' | 'vi' | 'fr' | 'zh' | 'ru' | 'ko';

// Siri System Components
export { SimpleMobileSiriVisual } from './SimpleMobileSiriVisual';
export { SiriButton } from './SiriButton';
export { SiriButtonContainer } from './SiriButtonContainer';
export { default as SiriCallButton } from './SiriCallButton';

// Debugging Components
export { MobileTouchDebugger } from './MobileTouchDebugger';

// Custom Hooks
export { useCallProtection } from './hooks/useCallProtection';
export { useLanguageColors } from './hooks/useLanguageColors';
export { useSiriAnimation } from './hooks/useSiriAnimation';
export { useSiriButtonEvents } from './hooks/useSiriButtonEvents';
export { useSiriButtonState } from './hooks/useSiriButtonState';
export { useSiriButtonVisual } from './hooks/useSiriButtonVisual';
export { useTouchDebugger } from './hooks/useTouchDebugger';

// UI Components
export { DebugPanel } from './components/DebugPanel';
export { SiriButtonStatus } from './components/SiriButtonStatus';
export { SiriButtonVisual } from './components/SiriButtonVisual';

// Constants
export { LANGUAGE_COLORS } from './constants/languageColors';
export type { LanguageColorScheme } from './constants/languageColors';

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
