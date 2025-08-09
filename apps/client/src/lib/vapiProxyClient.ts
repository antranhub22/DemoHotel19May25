import logger from '@shared/utils/logger';

// ============================================
// VAPI PROXY CLIENT - CORS BYPASS
// ============================================

export interface VapiProxyCallOptions {
    assistantId: string;
    publicKey: string;
    customerName?: string;
    customerEmail?: string;
    metadata?: Record<string, any>;
}

export interface VapiProxyResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export class VapiProxyClient {
    private baseUrl: string;

    constructor() {
        // Use current domain for API calls
        this.baseUrl = typeof window !== 'undefined'
            ? `${window.location.protocol}//${window.location.host}`
            : 'http://localhost:3000';
    }

    /**
     * Start Vapi call via server proxy
     */
    async startCall(options: VapiProxyCallOptions): Promise<VapiProxyResponse> {
        try {
            logger.debug('[VapiProxyClient] Starting call via proxy', 'Component', {
                assistantId: options.assistantId?.substring(0, 15) + '...',
                publicKey: options.publicKey?.substring(0, 15) + '...',
            });

            const response = await fetch(`${this.baseUrl}/api/vapi-proxy/start-call`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(options),
            });

            const result = await response.json();

            if (!response.ok) {
                logger.error('[VapiProxyClient] Call start failed', 'Component', {
                    status: response.status,
                    error: result,
                });

                return {
                    success: false,
                    error: result.error || 'Failed to start call',
                    message: result.message,
                };
            }

            logger.debug('[VapiProxyClient] Call started successfully', 'Component', {
                callId: result.data?.id,
            });

            return {
                success: true,
                data: result.data,
            };

        } catch (error) {
            logger.error('[VapiProxyClient] Network error', 'Component', error);

            return {
                success: false,
                error: 'Network error',
                message: error instanceof Error ? error.message : String(error),
            };
        }
    }

    /**
     * End Vapi call via server proxy
     */
    async endCall(callId: string, publicKey: string): Promise<VapiProxyResponse> {
        try {
            logger.debug('[VapiProxyClient] Ending call via proxy', 'Component', {
                callId,
            });

            const response = await fetch(`${this.baseUrl}/api/vapi-proxy/end-call`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ callId, publicKey }),
            });

            const result = await response.json();

            if (!response.ok) {
                logger.error('[VapiProxyClient] Call end failed', 'Component', {
                    status: response.status,
                    error: result,
                });

                return {
                    success: false,
                    error: result.error || 'Failed to end call',
                    message: result.message,
                };
            }

            logger.debug('[VapiProxyClient] Call ended successfully', 'Component');

            return {
                success: true,
                message: result.message,
            };

        } catch (error) {
            logger.error('[VapiProxyClient] Network error ending call', 'Component', error);

            return {
                success: false,
                error: 'Network error',
                message: error instanceof Error ? error.message : String(error),
            };
        }
    }

    /**
     * Get call status via server proxy
     */
    async getCallStatus(callId: string, publicKey: string): Promise<VapiProxyResponse> {
        try {
            const response = await fetch(
                `${this.baseUrl}/api/vapi-proxy/call/${callId}?publicKey=${encodeURIComponent(publicKey)}`,
                {
                    method: 'GET',
                    credentials: 'include',
                }
            );

            const result = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: result.error || 'Failed to get call status',
                };
            }

            return {
                success: true,
                data: result.data,
            };

        } catch (error) {
            logger.error('[VapiProxyClient] Error getting call status', 'Component', error);

            return {
                success: false,
                error: 'Network error',
                message: error instanceof Error ? error.message : String(error),
            };
        }
    }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const vapiProxyClient = new VapiProxyClient();

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Start Vapi call with simplified interface
 */
export async function startVapiCallViaProxy(
    assistantId: string,
    publicKey: string,
    options: Partial<VapiProxyCallOptions> = {}
): Promise<VapiProxyResponse> {
    return vapiProxyClient.startCall({
        assistantId,
        publicKey,
        ...options,
    });
}

/**
 * End Vapi call with simplified interface
 */
export async function endVapiCallViaProxy(
    callId: string,
    publicKey: string
): Promise<VapiProxyResponse> {
    return vapiProxyClient.endCall(callId, publicKey);
}

export default vapiProxyClient; 