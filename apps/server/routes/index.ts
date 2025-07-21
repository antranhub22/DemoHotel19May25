import express from 'express';
import apiRoutes from './api';
import ordersRoutes from './orders';
import callsRoutes from './calls';
import analyticsRoutes from './analytics';
import dashboardRoutes from './dashboard';
import healthRoutes from './health';
import requestRoutes from './request';
import unifiedAuthRoutes from '../../packages/auth-system/routes/auth.routes';

const router = express.Router();

// Mount all route modules
router.use('/api', apiRoutes);
router.use('/api', ordersRoutes);
router.use('/api', callsRoutes);
router.use('/api', analyticsRoutes);
router.use('/api', dashboardRoutes);
router.use('/api', healthRoutes);
router.use('/api', requestRoutes);
router.use('/api/auth', unifiedAuthRoutes);

export default router; 