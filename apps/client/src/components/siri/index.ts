// Siri System Components
export { SiriButton } from './SiriButton';
export { default as SiriCallButton } from './SiriCallButton';
export { SiriButtonContainer } from './SiriButtonContainer';
export { MobileDebugComponent } from './MobileDebugComponent';

// 🚀 PHASE 2: Modular Architecture Components
export * from './modules';

// Types
export interface SiriCallButtonProps {
  containerId: string;
  isListening: boolean;
  volumeLevel: number;
  onCallStart?: () => Promise<void>;
  onCallEnd?: () => void;
}

export interface SiriButtonContainerProps {
  isCallStarted: boolean;
  micLevel: number;
  onCallStart: (lang: string) => Promise<void>;
  onCallEnd: () => void;
} 