// Simple Vapi Client - Following Official Documentation Exactly
// Based on: https://docs.vapi.ai/quickstart/web

import { logger } from '@shared/utils/logger';

// Import Vapi from the official package
// Note: This should be installed via npm install @vapi-ai/web
let Vapi: any;

try {
    // Dynamic import to handle different environments
    if (typeof window !== 'undefined') {
        // Browser environment
        Vapi = (window as any).Vapi;
        if (!Vapi) {
            // Try to import from npm package
            import('@vapi-ai/web').then(module => {
                Vapi = module.default;
            }).catch(() => {
                logger.error('Failed to import Vapi SDK', 'SimpleVapiClient');
            });
        }
    }
} catch (error) {
    logger.error('Error loading Vapi SDK:', 'SimpleVapiClient', error);
}

export interface SimpleVapiConfig {
    publicKey: string;
    assistantId: string;
}

export class SimpleVapiClient {
    private vapi: any = null;
    private config: SimpleVapiConfig;
    private isCallActive = false;

    constructor(config: SimpleVapiConfig) {
        this.config = config;
        logger.debug('SimpleVapiClient created', 'SimpleVapiClient', {
            publicKeyLength: config.publicKey?.length,
            assistantIdLength: config.assistantId?.length,
        });
    }

    // Initialize Vapi exactly as shown in documentation
    public async initialize(): Promise<void> {
        try {
            if (!Vapi) {
                throw new Error('Vapi SDK not loaded. Make sure @vapi-ai/web is installed.');
            }

            if (!this.config.publicKey) {
                throw new Error('Public key is required');
            }

            logger.debug('Initializing Vapi with public key...', 'SimpleVapiClient');

            // Create Vapi instance exactly as shown in documentation
            this.vapi = new Vapi(this.config.publicKey);

            // Set up event listeners exactly as shown in documentation
            this.setupEventListeners();

            logger.success('SimpleVapiClient initialized successfully', 'SimpleVapiClient');
        } catch (error) {
            logger.error('Failed to initialize SimpleVapiClient:', 'SimpleVapiClient', error);
            throw error;
        }
    }

    private setupEventListeners(): void {
        if (!this.vapi) return;

        // Event listeners exactly as shown in documentation
        this.vapi.on('call-start', () => {
            logger.debug('Call started', 'SimpleVapiClient');
            this.isCallActive = true;
        });

        this.vapi.on('call-end', () => {
            logger.debug('Call ended', 'SimpleVapiClient');
            this.isCallActive = false;
        });

        this.vapi.on('speech-start', () => {
            logger.debug('Speech started', 'SimpleVapiClient');
        });

        this.vapi.on('speech-end', () => {
            logger.debug('Speech ended', 'SimpleVapiClient');
        });

        this.vapi.on('volume-level', (volume: number) => {
            // Only log occasionally to avoid spam
            if (Math.random() < 0.01) {
                logger.debug('Volume level:', 'SimpleVapiClient', volume);
            }
        });

        this.vapi.on('message', (message: any) => {
            logger.debug('Message received:', 'SimpleVapiClient', message.type);

            if (message.type === 'transcript') {
                logger.debug(`Transcript - ${message.role}: ${message.transcript}`, 'SimpleVapiClient');
            }
        });

        this.vapi.on('error', (error: any) => {
            logger.error('Vapi error:', 'SimpleVapiClient', error);
        });
    }

    // Start call exactly as shown in documentation
    public async startCall(): Promise<any> {
        try {
            if (!this.vapi) {
                throw new Error('Vapi not initialized. Call initialize() first.');
            }

            if (!this.config.assistantId) {
                throw new Error('Assistant ID is required');
            }

            if (this.isCallActive) {
                logger.warn('Call already active', 'SimpleVapiClient');
                return;
            }

            logger.debug('Starting call...', 'SimpleVapiClient', {
                assistantId: this.config.assistantId.substring(0, 15) + '...',
            });

            // Start voice conversation exactly as shown in documentation
            const call = await this.vapi.start(this.config.assistantId);

            logger.success('Call started successfully', 'SimpleVapiClient', {
                callId: call?.id || 'unknown',
            });

            return call;
        } catch (error) {
            logger.error('Failed to start call:', 'SimpleVapiClient', error);
            throw error;
        }
    }

    // Stop call
    public stopCall(): void {
        try {
            if (!this.vapi) {
                logger.warn('Vapi not initialized', 'SimpleVapiClient');
                return;
            }

            if (!this.isCallActive) {
                logger.warn('No active call to stop', 'SimpleVapiClient');
                return;
            }

            logger.debug('Stopping call...', 'SimpleVapiClient');
            this.vapi.stop();

            logger.success('Call stopped', 'SimpleVapiClient');
        } catch (error) {
            logger.error('Failed to stop call:', 'SimpleVapiClient', error);
        }
    }

    // Get call status
    public isActive(): boolean {
        return this.isCallActive;
    }

    // Set muted state
    public setMuted(muted: boolean): void {
        try {
            if (!this.vapi) {
                logger.warn('Vapi not initialized', 'SimpleVapiClient');
                return;
            }

            if (typeof this.vapi.setMuted === 'function') {
                this.vapi.setMuted(muted);
                logger.debug('Mute state set to:', 'SimpleVapiClient', muted);
            }
        } catch (error) {
            logger.error('Failed to set mute state:', 'SimpleVapiClient', error);
        }
    }

    // Check if muted
    public isMuted(): boolean {
        try {
            if (!this.vapi) return false;

            if (typeof this.vapi.isMuted === 'function') {
                return this.vapi.isMuted();
            }

            return false;
        } catch (error) {
            logger.error('Failed to check mute state:', 'SimpleVapiClient', error);
            return false;
        }
    }
}

// Global instance for easy access
let globalSimpleVapiClient: SimpleVapiClient | null = null;

// Factory function to create or get existing instance
export function createSimpleVapiClient(config: SimpleVapiConfig): SimpleVapiClient {
    if (!globalSimpleVapiClient) {
        globalSimpleVapiClient = new SimpleVapiClient(config);
    }
    return globalSimpleVapiClient;
}

// Get existing instance
export function getSimpleVapiClient(): SimpleVapiClient | null {
    return globalSimpleVapiClient;
}

// Reset instance (for cleanup/testing)
export function resetSimpleVapiClient(): void {
    if (globalSimpleVapiClient) {
        globalSimpleVapiClient.stopCall();
        globalSimpleVapiClient = null;
    }
} 