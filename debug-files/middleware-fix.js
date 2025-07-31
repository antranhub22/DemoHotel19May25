// ============================================
// PRODUCTION MIDDLEWARE FIXES
// ============================================

// ✅ FIX: Remove strict authentication for voice assistant endpoints
export const voiceAssistantAuthMiddleware = (req, res, next) => {
  // Allow voice assistant endpoints without strict authentication
  const voiceAssistantEndpoints = [
    '/api/request',
    '/api/calls',
    '/api/transcripts',
    '/api/webhook/call-end',
  ];

  if (voiceAssistantEndpoints.some(endpoint => req.path.startsWith(endpoint))) {
    console.log(
      '🎤 [DEBUG] Voice assistant endpoint detected, skipping strict auth'
    );
    return next();
  }

  // Apply authentication for other endpoints
  return authenticateJWT(req, res, next);
};

// ✅ FIX: Enhanced error handling middleware
export const errorHandlingMiddleware = (error, req, res, next) => {
  console.error('❌ [ERROR] Unhandled error:', error);

  // Database connection errors
  if (
    error.message.includes('connection') ||
    error.message.includes('timeout')
  ) {
    return res.status(503).json({
      success: false,
      error: 'Service temporarily unavailable. Please try again.',
      code: 'SERVICE_UNAVAILABLE',
    });
  }

  // Default error response
  return res.status(500).json({
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
};
