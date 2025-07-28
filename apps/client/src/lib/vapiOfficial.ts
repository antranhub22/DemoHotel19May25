// Official Vapi Implementation - Following docs.vapi.ai exactly
// Based on: https://docs.vapi.ai/quickstart/web
// Enhanced for compatibility with existing codebase

import { logger } from '@shared/utils/logger';
import Vapi from '@vapi-ai/web';

export interface VapiOfficialConfig {
  publicKey: string;
  assistantId?: string;
  onCallStart?: () => void;
  onCallEnd?: () => void;
  onMessage?: (message: any) => void;
  onError?: (error: any) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
}

// ✅ NEW: CallOptions interface for compatibility with existing code
export interface CallOptions {
  assistantId?: string;
  metadata?: Record<string, any>;
  timeout?: number; // Auto-end call after N seconds
}

export class VapiOfficial {
  private vapi: any;
  private config: VapiOfficialConfig;
  private callTimeout: NodeJS.Timeout | null = null;
  private _isCallActive = false;

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
      this._isCallActive = true;
      this.config.onCallStart?.();
    });

    // Call end event
    this.vapi.on('call-end', () => {
      logger.debug('📞 Call ended', 'VapiOfficial');
      this._isCallActive = false;
      this.clearCallTimeout();
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
      this._isCallActive = false;
      this.clearCallTimeout();
      this.config.onError?.(error);
    });

    // Speech start/end for UI feedback
    this.vapi.on('speech-start', () => {
      logger.debug('🗣️ Speech started', 'VapiOfficial');
      this.config.onSpeechStart?.();
    });

    this.vapi.on('speech-end', () => {
      logger.debug('🤐 Speech ended', 'VapiOfficial');
      this.config.onSpeechEnd?.();
    });
  }

  /**
   * Start a voice call with options (enhanced for compatibility)
   * @param options - Call options including assistantId, metadata, timeout
   */
  async startCall(options: CallOptions = {}): Promise<void> {
    try {
      const assistantId = options.assistantId || this.config.assistantId;

      if (!assistantId) {
        throw new Error('Assistant ID is required to start a call');
      }

      if (this._isCallActive) {
        logger.warn(
          '⚠️ Call already active, ending previous call first',
          'VapiOfficial'
        );
        await this.endCall();
        // Wait a moment before starting new call
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      logger.debug('🚀 Starting Vapi call', 'VapiOfficial', {
        assistantId: assistantId.substring(0, 15) + '...',
        timeout: options.timeout,
        metadata: options.metadata,
      });

      // Start the call with metadata if provided
      await this.vapi.start(assistantId, {
        metadata: options.metadata,
      });

      // Set auto-timeout if specified
      if (options.timeout) {
        this.setCallTimeout(options.timeout);
      }

      logger.debug('✅ Call started successfully', 'VapiOfficial');
    } catch (error) {
      logger.error('❌ Failed to start call', 'VapiOfficial', error);
      this._isCallActive = false;
      this.config.onError?.(error);
      throw error;
    }
  }

  /**
   * Start call with just assistantId (backward compatibility)
   * @param assistantId - The assistant ID to use for the call
   */
  startCallWithId(assistantId?: string): Promise<void> {
    return this.startCall({ assistantId });
  }

  /**
   * End the current call
   */
  async endCall(): Promise<void> {
    try {
      if (!this._isCallActive) {
        logger.debug('⚠️ No active call to end', 'VapiOfficial');
        return;
      }

      logger.debug('⏹️ Ending Vapi call', 'VapiOfficial');

      this.clearCallTimeout();
      await this.vapi.stop();

      // Reset state
      this._isCallActive = false;

      logger.debug('✅ Call ended successfully', 'VapiOfficial');
    } catch (error) {
      logger.error('❌ Failed to end call', 'VapiOfficial', error);
      // Reset state even on error
      this._isCallActive = false;
      this.clearCallTimeout();
      throw error;
    }
  }

  /**
   * Check if currently in a call
   */
  isCallActive(): boolean {
    return this._isCallActive;
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
   * Set call timeout
   */
  private setCallTimeout(timeoutMs: number): void {
    this.clearCallTimeout();

    this.callTimeout = setTimeout(async () => {
      logger.debug('⏰ Call timeout reached, ending call', 'VapiOfficial');
      try {
        await this.endCall();
      } catch (error) {
        logger.error(
          '❌ Error during timeout call end:',
          'VapiOfficial',
          error
        );
      }
    }, timeoutMs);

    logger.debug(`⏰ Call timeout set for ${timeoutMs}ms`, 'VapiOfficial');
  }

  /**
   * Clear call timeout
   */
  private clearCallTimeout(): void {
    if (this.callTimeout) {
      clearTimeout(this.callTimeout);
      this.callTimeout = null;
      logger.debug('⏰ Call timeout cleared', 'VapiOfficial');
    }
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
      this.clearCallTimeout();
      this.vapi.stop();
      this.vapi = null;
      this._isCallActive = false;
      logger.debug('🗑️ Vapi instance destroyed', 'VapiOfficial');
    }
  }
}

// Convenience function for quick setup
export const createVapiClient = (config: VapiOfficialConfig): VapiOfficial => {
  return new VapiOfficial(config);
};

// Backward compatibility alias
export type { VapiOfficialConfig as VapiConfig };

// Example usage:
/*
const vapiClient = createVapiClient({
  publicKey: 'your_public_key_here',
  assistantId: 'your_assistant_id_here',
  onCallStart: () => console.log('Call started!'),
  onCallEnd: () => console.log('Call ended!'),
  onMessage: (message) => {
    if (message.type === 'transcript') {
      console.log(`${message.role}: ${message.transcript}`);
    }
  },
  onError: (error) => console.error('Vapi error:', error)
});

// Start a call with options
await vapiClient.startCall({
  assistantId: 'asst_different_assistant',
  timeout: 300000, // 5 minutes
  metadata: { source: 'hotel-voice-assistant' }
});

// Or start with default assistant
await vapiClient.startCall();

// End call
await vapiClient.endCall();
*/
