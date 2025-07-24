import express from 'express';

const router = express.Router();

// ==========================================
// TEMPORARY PUBLIC ROUTES - NO MIDDLEWARE
// ==========================================
// These routes bypass ALL middleware to test deployment

// ✅ GET /api/public/ping - Simple ping endpoint
router.get('/ping', (req, res) => {
  res.json({
    success: true,
    message: 'Production deployment is working!',
    timestamp: new Date().toISOString(),
    deployment: 'Emergency auth fix applied',
    server: 'Running',
  });
});

// ✅ GET /api/public/status - System status without auth
router.get('/status', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    version: '1.0.0',
    auth: {
      tempRoutesEnabled: true,
      deployment: 'completed',
    },
  });
});

export default router;
