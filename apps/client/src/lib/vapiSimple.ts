// 🎯 OFFICIAL VAPI IMPLEMENTATION - Following docs.vapi.ai exactly
// Replaces complex implementation with simple, official pattern

import { logger } from '@shared/utils/logger';
import Vapi from '@vapi-ai/web';
import React from 'react';

export interface VapiConfig {
  publicKey: string;
  assistantId?: string;
  onCallStart?: () => void;
  onCallEnd?: () => void;
  onMessage?: (message: any) => void;
  onError?: (error: any) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
}

export interface CallOptions {
  assistantId?: string;
  metadata?: Record<string, any>;
  timeout?: number; // Auto-end call after N seconds
}

export class VapiSimple {
  private vapi: any;
  private config: VapiConfig;
  private callTimeout: NodeJS.Timeout | null = null;
  private isCallActive = false;

  constructor(config: VapiConfig) {
    this.config = config;
    this.initializeVapi();
  }

  private initializeVapi() {
    try {
      logger.debug('🚀 Initializing Vapi (Official Pattern)', 'VapiSimple', {
        publicKey: this.config.publicKey.substring(0, 10) + '...',
      });

      // ✅ OFFICIAL PATTERN: Direct initialization
      this.vapi = new Vapi(this.config.publicKey);

      this.setupEventListeners();

      logger.debug('✅ Vapi initialized successfully', 'VapiSimple');
    } catch (error) {
      logger.error('❌ Vapi initialization failed', 'VapiSimple', error);
      this.config.onError?.(error);
    }
  }

  private setupEventListeners() {
    if (!this.vapi) return;

    // ✅ OFFICIAL PATTERN: Simple event listeners
    this.vapi.on('call-start', () => {
      logger.debug('🎙️ Call started', 'VapiSimple');
      this.isCallActive = true;
      this.config.onCallStart?.();
    });

    this.vapi.on('call-end', () => {
      logger.debug('📞 Call ended', 'VapiSimple');
      this.isCallActive = false;
      this.clearCallTimeout();
      this.config.onCallEnd?.();
    });

    this.vapi.on('message', (message: any) => {
      logger.debug('📨 Message received', 'VapiSimple', {
        type: message.type,
        role: message.role,
      });

      if (message.type === 'transcript') {
        logger.debug(`💬 ${message.role}: ${message.transcript}`, 'VapiSimple');
      }

      this.config.onMessage?.(message);
    });

    this.vapi.on('error', (error: any) => {
      logger.error('❌ Vapi error', 'VapiSimple', error);
      this.isCallActive = false;
      this.clearCallTimeout();
      this.config.onError?.(error);
    });

    this.vapi.on('speech-start', () => {
      logger.debug('🗣️ Speech started', 'VapiSimple');
      this.config.onSpeechStart?.();
    });

    this.vapi.on('speech-end', () => {
      logger.debug('🤐 Speech ended', 'VapiSimple');
      this.config.onSpeechEnd?.();
    });

    // Additional events for better UX
    this.vapi.on('call-min-duration-passed', () => {
      logger.debug('⏰ Minimum call duration passed', 'VapiSimple');
    });

    this.vapi.on('volume-level', (level: number) => {
      // Can be used for mic level indicator
      logger.debug(`🎤 Volume level: ${level}`, 'VapiSimple');
    });
  }

  /**
   * Start a voice call
   */
  async startCall(options: CallOptions = {}): Promise<void> {
    try {
      const assistantId = options.assistantId || this.config.assistantId;

      if (!assistantId) {
        throw new Error('Assistant ID is required to start a call');
      }

      if (this.isCallActive) {
        logger.warn(
          '⚠️ Call already active, ending previous call first',
          'VapiSimple'
        );
        await this.endCall();
        // Wait a moment before starting new call
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      logger.debug('🚀 Starting call', 'VapiSimple', {
        assistantId: assistantId.substring(0, 15) + '...',
        timeout: options.timeout,
      });

      // ✅ OFFICIAL PATTERN: Direct call start
      await this.vapi.start(assistantId, {
        metadata: options.metadata,
      });

      // Set auto-timeout if specified
      if (options.timeout) {
        this.setCallTimeout(options.timeout);
      } else {
        // Default 5 minute timeout for safety
        this.setCallTimeout(5 * 60 * 1000);
      }

      logger.debug('✅ Call started successfully', 'VapiSimple');
    } catch (error) {
      logger.error('❌ Failed to start call', 'VapiSimple', error);
      this.isCallActive = false;
      this.config.onError?.(error);
      throw error;
    }
  }

  /**
   * End the current call
   */
  async endCall(): Promise<void> {
    try {
      if (!this.isCallActive) {
        logger.debug('ℹ️ No active call to end', 'VapiSimple');
        return;
      }

      logger.debug('🛑 Ending call', 'VapiSimple');

      // ✅ OFFICIAL PATTERN: Direct call end
      await this.vapi.stop();

      this.isCallActive = false;
      this.clearCallTimeout();

      logger.debug('✅ Call ended successfully', 'VapiSimple');
    } catch (error) {
      logger.error('❌ Failed to end call', 'VapiSimple', error);
      this.isCallActive = false;
      this.clearCallTimeout();
      this.config.onError?.(error);
    }
  }

  /**
   * Send a message during the call
   */
  sendMessage(message: string): void {
    if (!this.isCallActive) {
      logger.warn('⚠️ Cannot send message: no active call', 'VapiSimple');
      return;
    }

    try {
      this.vapi.send({
        type: 'add-message',
        message: {
          role: 'system',
          content: message,
        },
      });

      logger.debug('📤 Message sent', 'VapiSimple', { message });
    } catch (error) {
      logger.error('❌ Failed to send message', 'VapiSimple', error);
      this.config.onError?.(error);
    }
  }

  /**
   * Check if call is currently active
   */
  getCallStatus(): boolean {
    return this.isCallActive;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<VapiConfig>): void {
    this.config = { ...this.config, ...newConfig };

    if (newConfig.publicKey && newConfig.publicKey !== this.config.publicKey) {
      logger.debug('🔄 Reinitializing with new public key', 'VapiSimple');
      this.destroy();
      this.initializeVapi();
    }
  }

  /**
   * Set call timeout
   */
  private setCallTimeout(timeoutMs: number): void {
    this.clearCallTimeout();

    this.callTimeout = setTimeout(() => {
      logger.debug('⏰ Call timeout reached, auto-ending call', 'VapiSimple');
      this.endCall();
    }, timeoutMs);
  }

  /**
   * Clear call timeout
   */
  private clearCallTimeout(): void {
    if (this.callTimeout) {
      clearTimeout(this.callTimeout);
      this.callTimeout = null;
    }
  }

  /**
   * Destroy the Vapi instance and cleanup
   */
  destroy(): void {
    try {
      if (this.isCallActive) {
        this.endCall();
      }

      this.clearCallTimeout();
      this.vapi = null;
      this.isCallActive = false;

      logger.debug('🗑️ Vapi instance destroyed', 'VapiSimple');
    } catch (error) {
      logger.error('❌ Error during destroy', 'VapiSimple', error);
    }
  }
}

// Convenience factory function
export const createVapiClient = (config: VapiConfig): VapiSimple => {
  return new VapiSimple(config);
};

// Hook for React components
export const useVapi = (config: VapiConfig) => {
  const [client] = React.useState(() => createVapiClient(config));
  const [isCallActive, setIsCallActive] = React.useState(false);

  React.useEffect(() => {
    const originalOnCallStart = config.onCallStart;
    const originalOnCallEnd = config.onCallEnd;

    client.updateConfig({
      ...config,
      onCallStart: () => {
        setIsCallActive(true);
        originalOnCallStart?.();
      },
      onCallEnd: () => {
        setIsCallActive(false);
        originalOnCallEnd?.();
      },
    });

    return () => {
      client.destroy();
    };
  }, [client, config]);

  return {
    startCall: (options?: CallOptions) => client.startCall(options),
    endCall: () => client.endCall(),
    sendMessage: (message: string) => client.sendMessage(message),
    isCallActive,
    destroy: () => client.destroy(),
  };
};

export default VapiSimple;
