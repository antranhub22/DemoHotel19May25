import { logger } from '@shared/utils/logger';
import type { NextFunction, Request, Response } from 'express';

interface DebugRequest extends Request {
    debugId?: string;
    startTime?: number;
}

/**
 * Enhanced Debugging Middleware
 * Captures detailed request/response information for troubleshooting
 */
export class DebuggingMiddleware {
    /**
     * Enhanced request logging with debug information
     */
    static enhancedLogging(req: DebugRequest, res: Response, next: NextFunction): void {
        // Generate unique debug ID for request tracking
        req.debugId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        req.startTime = Date.now();

        // Log incoming request details
        logger.debug('🔍 [REQUEST] Incoming request', 'DebuggingMiddleware', {
            debugId: req.debugId,
            method: req.method,
            url: req.url,
            originalUrl: req.originalUrl,
            path: req.path,
            hostname: req.hostname,
            headers: {
                host: req.get('host'),
                userAgent: req.get('user-agent'),
                contentType: req.get('content-type'),
                authorization: req.get('authorization') ? 'Bearer [REDACTED]' : undefined,
                referer: req.get('referer'),
                origin: req.get('origin'),
            },
            query: req.query,
            body: DebuggingMiddleware.sanitizeBody(req.body),
            ip: req.ip,
            ips: req.ips,
            protocol: req.protocol,
            secure: req.secure,
        });

        // Capture response details
        const originalSend = res.send;
        const originalJson = res.json;
        const originalStatus = res.status;

        // Override res.status to capture status changes
        res.status = function (code: number) {
            logger.debug('📊 [RESPONSE] Status set', 'DebuggingMiddleware', {
                debugId: req.debugId,
                statusCode: code,
            });
            return originalStatus.call(this, code);
        };

        // Override res.json to capture response data
        res.json = function (data: any) {
            const responseTime = req.startTime ? Date.now() - req.startTime : 0;

            logger.debug('📤 [RESPONSE] JSON response', 'DebuggingMiddleware', {
                debugId: req.debugId,
                statusCode: res.statusCode,
                responseTime: `${responseTime}ms`,
                responseData: DebuggingMiddleware.sanitizeResponseData(data),
                headers: {
                    contentType: res.get('content-type'),
                    contentLength: res.get('content-length'),
                },
            });

            return originalJson.call(this, data);
        };

        // Override res.send to capture plain response data
        res.send = function (data: any) {
            const responseTime = req.startTime ? Date.now() - req.startTime : 0;

            logger.debug('📤 [RESPONSE] Send response', 'DebuggingMiddleware', {
                debugId: req.debugId,
                statusCode: res.statusCode,
                responseTime: `${responseTime}ms`,
                responseType: typeof data,
                responseSize: data ? data.length || JSON.stringify(data).length : 0,
            });

            return originalSend.call(this, data);
        };

        next();
    }

    /**
     * Error catching middleware for detailed error logging
     */
    static errorCapture(err: any, req: DebugRequest, res: Response, next: NextFunction): void {
        const responseTime = req.startTime ? Date.now() - req.startTime : 0;

        logger.error('💥 [ERROR] Request failed with unhandled error', 'DebuggingMiddleware', {
            debugId: req.debugId,
            error: {
                name: err.name,
                message: err.message,
                stack: err.stack,
                code: err.code,
                statusCode: err.statusCode || err.status,
            },
            request: {
                method: req.method,
                url: req.url,
                path: req.path,
                hostname: req.hostname,
                headers: DebuggingMiddleware.sanitizeHeaders(req.headers),
                body: DebuggingMiddleware.sanitizeBody(req.body),
                query: req.query,
                params: req.params,
            },
            responseTime: `${responseTime}ms`,
            timestamp: new Date().toISOString(),
        });

        // Send error response if not already sent
        if (!res.headersSent) {
            const statusCode = err.statusCode || err.status || 500;
            const isDevelopment = process.env.NODE_ENV === 'development';

            res.status(statusCode).json({
                success: false,
                error: err.message || 'Internal Server Error',
                code: err.code || 'INTERNAL_ERROR',
                debugId: req.debugId,
                timestamp: new Date().toISOString(),
                ...(isDevelopment && {
                    stack: err.stack,
                    details: err,
                }),
            });
        }

        next(err);
    }

    /**
     * Database operation debugging
     */
    static logDatabaseOperation(operation: string, details: any): void {
        logger.debug(`🗄️  [DATABASE] ${operation}`, 'DebuggingMiddleware', {
            operation,
            details: DebuggingMiddleware.sanitizeDbDetails(details),
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Service container debugging
     */
    static logServiceOperation(service: string, operation: string, details: any): void {
        logger.debug(`🔧 [SERVICE] ${service}.${operation}`, 'DebuggingMiddleware', {
            service,
            operation,
            details: DebuggingMiddleware.sanitizeServiceDetails(details),
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Feature flag debugging
     */
    static logFeatureFlag(flagName: string, result: boolean, context?: any): void {
        logger.debug(`🚩 [FEATURE_FLAG] ${flagName}`, 'DebuggingMiddleware', {
            flagName,
            enabled: result,
            context: context ? DebuggingMiddleware.sanitizeContext(context) : undefined,
            timestamp: new Date().toISOString(),
        });
    }

    // Helper methods for data sanitization
    private static sanitizeBody(body: any): any {
        if (!body) return body;

        const sanitized = { ...body };

        // Remove sensitive fields
        if (sanitized.password) sanitized.password = '[REDACTED]';
        if (sanitized.apiKey) sanitized.apiKey = '[REDACTED]';
        if (sanitized.token) sanitized.token = '[REDACTED]';

        return sanitized;
    }

    private static sanitizeHeaders(headers: any): any {
        const sanitized = { ...headers };

        // Remove sensitive headers
        if (sanitized.authorization) sanitized.authorization = 'Bearer [REDACTED]';
        if (sanitized.cookie) sanitized.cookie = '[REDACTED]';
        if (sanitized['x-api-key']) sanitized['x-api-key'] = '[REDACTED]';

        return sanitized;
    }

    private static sanitizeResponseData(data: any): any {
        if (!data || typeof data !== 'object') return data;

        // Limit response data size for logging
        const dataStr = JSON.stringify(data);
        if (dataStr.length > 1000) {
            return {
                _truncated: true,
                _originalSize: dataStr.length,
                _preview: dataStr.substring(0, 500) + '...',
                success: data.success,
                error: data.error,
                code: data.code,
            };
        }

        return data;
    }

    private static sanitizeDbDetails(details: any): any {
        if (!details) return details;

        const sanitized = { ...details };

        // Remove sensitive database info
        if (sanitized.connectionString) sanitized.connectionString = '[REDACTED]';
        if (sanitized.password) sanitized.password = '[REDACTED]';

        return sanitized;
    }

    private static sanitizeServiceDetails(details: any): any {
        if (!details) return details;

        const sanitized = { ...details };

        // Remove sensitive service info
        if (sanitized.apiKey) sanitized.apiKey = '[REDACTED]';
        if (sanitized.secret) sanitized.secret = '[REDACTED]';

        return sanitized;
    }

    private static sanitizeContext(context: any): any {
        if (!context) return context;

        const sanitized = { ...context };

        // Keep only safe context fields
        const safeFields = ['userId', 'tenantId', 'role', 'sessionId', 'requestId'];
        const result: any = {};

        safeFields.forEach(field => {
            if (sanitized[field] !== undefined) {
                result[field] = sanitized[field];
            }
        });

        return result;
    }
}

/**
 * Middleware to apply debugging only for specific routes or conditions
 */
export const conditionalDebugging = (condition: (req: Request) => boolean) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (condition(req)) {
            DebuggingMiddleware.enhancedLogging(req as DebugRequest, res, next);
        } else {
            next();
        }
    };
};

/**
 * Debugging middleware for API routes only
 */
export const apiDebugging = conditionalDebugging((req: Request) =>
    req.path.startsWith('/api/')
);

/**
 * Debugging middleware for request routes only
 */
export const requestDebugging = conditionalDebugging((req: Request) =>
    req.path.includes('/request') || req.path.includes('/order')
);

/**
 * Development-only debugging
 */
export const devDebugging = conditionalDebugging(() =>
    process.env.NODE_ENV === 'development' || process.env.DEBUG_ENABLED === 'true'
);

export default DebuggingMiddleware; 