// Official Vapi Implementation - Following docs.vapi.ai exactly
// Based on: https://docs.vapi.ai/quickstart/web

import { logger } from '@shared/utils/logger';
import Vapi from '@vapi-ai/web';

export interface VapiOfficialConfig {
  publicKey: string;
  assistantId?: string;
  onCallStart?: () => void;
  onCallEnd?: () => void;
  onMessage?: (message: any) => void;
  onError?: (error: any) => void;
}

export class VapiOfficial {
  private vapi: any;
  private config: VapiOfficialConfig;

  constructor(config: VapiOfficialConfig) {
    this.config = config;
    this.vapi = new Vapi(config.publicKey);
    this.setupEventListeners();

    logger.debug('✅ VapiOfficial initialized', 'VapiOfficial', {
      publicKey: config.publicKey.substring(0, 10) + '...',
      hasAssistantId: !!config.assistantId,
    });
  }

  private setupEventListeners() {
    // Call start event
    this.vapi.on('call-start', () => {
      logger.debug('🎙️ Call started', 'VapiOfficial');
      this.config.onCallStart?.();
    });

    // Call end event
    this.vapi.on('call-end', () => {
      logger.debug('📞 Call ended', 'VapiOfficial');
      this.config.onCallEnd?.();
    });

    // Message events (transcripts, etc.)
    this.vapi.on('message', (message: any) => {
      if (message.type === 'transcript') {
        logger.debug(
          `💬 ${message.role}: ${message.transcript}`,
          'VapiOfficial'
        );
      }
      this.config.onMessage?.(message);
    });

    // Error handling
    this.vapi.on('error', (error: any) => {
      logger.error('❌ Vapi error:', 'VapiOfficial', error);
      this.config.onError?.(error);
    });

    // Speech start/end for UI feedback
    this.vapi.on('speech-start', () => {
      logger.debug('🗣️ Speech started', 'VapiOfficial');
    });

    this.vapi.on('speech-end', () => {
      logger.debug('🤐 Speech ended', 'VapiOfficial');
    });
  }

  /**
   * Start a voice call with the assistant
   * @param assistantId - The assistant ID to use for the call
   */
  startCall(assistantId?: string): Promise<void> {
    const id = assistantId || this.config.assistantId;

    if (!id) {
      throw new Error('Assistant ID is required to start a call');
    }

    logger.debug('🚀 Starting Vapi call', 'VapiOfficial', {
      assistantId: id.substring(0, 15) + '...',
    });

    return this.vapi.start(id);
  }

  /**
   * End the current call
   */
  endCall(): Promise<void> {
    logger.debug('⏹️ Ending Vapi call', 'VapiOfficial');
    return this.vapi.stop();
  }

  /**
   * Check if currently in a call
   */
  isCallActive(): boolean {
    return this.vapi.isCallActive;
  }

  /**
   * Send a message during the call
   */
  sendMessage(message: string): void {
    if (!this.isCallActive()) {
      logger.warn('⚠️ Cannot send message: no active call', 'VapiOfficial');
      return;
    }

    this.vapi.send(message);
    logger.debug('📤 Message sent', 'VapiOfficial', { message });
  }

  /**
   * Update assistant configuration
   */
  updateConfig(newConfig: Partial<VapiOfficialConfig>): void {
    this.config = { ...this.config, ...newConfig };

    if (newConfig.publicKey) {
      // Recreate vapi instance with new key
      this.vapi = new Vapi(newConfig.publicKey);
      this.setupEventListeners();

      logger.debug('🔄 Vapi config updated', 'VapiOfficial', {
        publicKey: newConfig.publicKey.substring(0, 10) + '...',
      });
    }
  }

  /**
   * Destroy the Vapi instance
   */
  destroy(): void {
    if (this.vapi) {
      this.vapi.stop();
      this.vapi = null;
      logger.debug('🗑️ Vapi instance destroyed', 'VapiOfficial');
    }
  }
}

// Convenience function for quick setup
export const createVapiClient = (config: VapiOfficialConfig): VapiOfficial => {
  return new VapiOfficial(config);
};

// Example usage:
/*
const vapiClient = createVapiClient({
  publicKey: 'pk_your_public_key_here',
  assistantId: 'asst_your_assistant_id_here',
  onCallStart: () => console.log('Call started!'),
  onCallEnd: () => console.log('Call ended!'),
  onMessage: (message) => {
    if (message.type === 'transcript') {
      console.log(`${message.role}: ${message.transcript}`);
    }
  },
  onError: (error) => console.error('Vapi error:', error)
});

// Start a call
vapiClient.startCall();

// Or start with different assistant
vapiClient.startCall('asst_different_assistant');

// End call
vapiClient.endCall();
*/
