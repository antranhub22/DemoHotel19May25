// Language type import - needed for interface definitions
type Language = 'en' | 'vi' | 'fr' | 'zh' | 'ru' | 'ko';

// Siri System Components
export { SiriButton } from './SiriButton';
export { SiriButtonContainer } from './SiriButtonContainer';
export { default as SiriCallButton } from './SiriCallButton';

export { SimpleMobileSiriVisual } from './SimpleMobileSiriVisual';

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
  onCancel?: () => void;
  onConfirm?: () => void;
  showingSummary?: boolean;
  _showingSummary?: boolean;
}
