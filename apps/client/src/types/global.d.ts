// Global type declarations for browser APIs

declare global {
  interface Window {
    SpeechSynthesisUtterance: typeof SpeechSynthesisUtterance;
    speechSynthesis: SpeechSynthesis;
  }
}

// Speech Synthesis API types (in case they're not available in lib.dom.d.ts)
interface SpeechSynthesis extends EventTarget {
  cancel(): void;
  speak(utterance: SpeechSynthesisUtterance): void;
  pause(): void;
  resume(): void;
  getVoices(): SpeechSynthesisVoice[];
  paused: boolean;
  pending: boolean;
  speaking: boolean;
}

interface SpeechSynthesisUtterance extends EventTarget {
  new(text?: string): SpeechSynthesisUtterance;
  text: string;
  lang: string;
  voice: SpeechSynthesisVoice | null;
  volume: number;
  rate: number;
  pitch: number;
  onstart: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
  onend: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
  onerror: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisErrorEvent) => any) | null;
  onpause: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
  onresume: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
  onmark: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
  onboundary: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
}

interface SpeechSynthesisVoice {
  voiceURI: string;
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
}

interface SpeechSynthesisEvent extends Event {
  utterance: SpeechSynthesisUtterance;
  charIndex: number;
  charLength: number;
  elapsedTime: number;
  name: string;
}

interface SpeechSynthesisErrorEvent extends SpeechSynthesisEvent {
  error: 'canceled' | 'interrupted' | 'audio-busy' | 'audio-hardware' | 'network' | 'synthesis-unavailable' | 'synthesis-failed' | 'language-unavailable' | 'voice-unavailable' | 'text-too-long' | 'invalid-argument' | 'not-allowed';
}

// Extend global declarations
declare var speechSynthesis: SpeechSynthesis;
declare var SpeechSynthesisUtterance: {
  prototype: SpeechSynthesisUtterance;
  new(text?: string): SpeechSynthesisUtterance;
};

export {}; 