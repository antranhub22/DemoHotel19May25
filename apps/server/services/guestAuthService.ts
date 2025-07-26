import { TenantService } from '@server/services/tenantService';
import { logger } from '@shared/utils/logger';
import jwt from 'jsonwebtoken';

// ==========================================
// GUEST AUTHENTICATION SERVICE
// ==========================================
// Handles authentication for voice assistant guests
// - Identifies tenant from subdomain/domain
// - Creates guest session tokens with tenant context
// - Maintains data isolation between hotels

export interface GuestSession {
    sessionId: string;
    tenantId: string;
    hotelName: string;
    subdomain: string;
    ipAddress: string;
    userAgent: string;
    createdAt: Date;
    expiresAt: Date;
}

export interface GuestTokenPayload {
    sessionId: string;
    tenantId: string;
    role: 'guest';
    type: 'guest-session';
    iat: number;
    exp: number;
}

export class GuestAuthService {
    private static tenantService = new TenantService();

    /**
     * Extract subdomain from hostname
     */
    static extractSubdomain(hostname: string): string | null {
        // Remove port if present
        const cleanHostname = hostname.split(':')[0];

        // Skip localhost and IPs
        if (cleanHostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(cleanHostname)) {
            return 'minhonmuine'; // Default for development
        }

        // Extract subdomain from *.talk2go.online
        if (cleanHostname.includes('.talk2go.online')) {
            const parts = cleanHostname.split('.');
            if (parts.length >= 3) {
                return parts[0]; // e.g., 'minhonmuine' from 'minhonmuine.talk2go.online'
            }
        }

        // Custom domain - use full hostname as subdomain
        return cleanHostname.replace(/\./g, '-');
    }

    /**
     * Create guest session token for voice assistant
     */
    static async createGuestSession(
        hostname: string,
        ipAddress: string,
        userAgent: string
    ): Promise<{ success: boolean; token?: string; session?: GuestSession; error?: string }> {
        try {
            // Extract subdomain and identify tenant
            const subdomain = this.extractSubdomain(hostname);

            if (!subdomain) {
                return { success: false, error: 'Invalid hostname or subdomain' };
            }

            // Find tenant by subdomain
            const tenant = await this.tenantService.getTenantBySubdomain(subdomain);

            if (!tenant) {
                logger.warn(`🏨 [GuestAuth] Tenant not found for subdomain: ${subdomain}`, 'GuestAuthService');
                // Create default tenant for demo purposes
                return {
                    success: true,
                    token: await this.createDefaultGuestToken(subdomain, ipAddress),
                    session: await this.createDefaultGuestSession(subdomain, ipAddress, userAgent)
                };
            }

            // Check if tenant is active
            if (!this.tenantService.isSubscriptionActive(tenant)) {
                return { success: false, error: 'Hotel service temporarily unavailable' };
            }

            // Create guest session
            const sessionId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const session: GuestSession = {
                sessionId,
                tenantId: tenant.id,
                hotelName: tenant.hotelName,
                subdomain: tenant.subdomain,
                ipAddress,
                userAgent,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
            };

            // Create JWT token
            const tokenPayload: GuestTokenPayload = {
                sessionId,
                tenantId: tenant.id,
                role: 'guest',
                type: 'guest-session',
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + (4 * 60 * 60), // 4 hours
            };

            const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'dev-secret-key', {
                algorithm: 'HS256',
                issuer: 'DemoHotel19May',
                audience: 'hotel-voice-assistant',
            });

            logger.info(`✅ [GuestAuth] Created guest session for ${tenant.hotelName}`, 'GuestAuthService', {
                sessionId,
                tenantId: tenant.id,
                subdomain,
            });

            return { success: true, token, session };

        } catch (error) {
            logger.error('❌ [GuestAuth] Failed to create guest session:', 'GuestAuthService', error);
            return { success: false, error: 'Failed to create guest session' };
        }
    }

    /**
     * Verify guest session token
     */
    static async verifyGuestToken(token: string): Promise<GuestTokenPayload | null> {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key', {
                algorithms: ['HS256'],
                issuer: 'DemoHotel19May',
                audience: 'hotel-voice-assistant',
            }) as GuestTokenPayload;

            if (decoded.type !== 'guest-session' || decoded.role !== 'guest') {
                return null;
            }

            return decoded;
        } catch (error) {
            logger.debug('❌ [GuestAuth] Invalid guest token:', 'GuestAuthService', error);
            return null;
        }
    }

    /**
     * Create default guest token for demo/dev purposes
     */
    private static async createDefaultGuestToken(subdomain: string, ipAddress: string): Promise<string> {
        const sessionId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const tokenPayload: GuestTokenPayload = {
            sessionId,
            tenantId: 'default-' + subdomain,
            role: 'guest',
            type: 'guest-session',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (4 * 60 * 60),
        };

        return jwt.sign(tokenPayload, process.env.JWT_SECRET || 'dev-secret-key', {
            algorithm: 'HS256',
            issuer: 'DemoHotel19May',
            audience: 'hotel-voice-assistant',
        });
    }

    /**
     * Create default guest session for demo/dev purposes
     */
    private static async createDefaultGuestSession(
        subdomain: string,
        ipAddress: string,
        userAgent: string
    ): Promise<GuestSession> {
        return {
            sessionId: `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            tenantId: 'default-' + subdomain,
            hotelName: subdomain.charAt(0).toUpperCase() + subdomain.slice(1) + ' Hotel',
            subdomain,
            ipAddress,
            userAgent,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
        };
    }
} 