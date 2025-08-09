// ========================================
// VOICE ASSISTANT TYPES
// ========================================

export interface VoiceCall {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: "active" | "ended" | "failed";
  language: string;
  transcript?: string;
  summary?: string;
}

export interface VoiceMessage {
  id: string;
  callId: string;
  content: string;
  timestamp: Date;
  sender: "user" | "assistant";
  language: string;
}

export interface VoiceSettings {
  language: string;
  voiceSpeed: number;
  voiceVolume: number;
  autoTranscript: boolean;
  autoSummary: boolean;
}
