import express, { type Request, Response } from 'express';
// import { authenticateJWT } from '../../packages/auth-system/middleware/auth.middleware';
import { db } from '@shared/db';
import { tenants, staff, call, request as requestTable } from '@shared/db';
import { eq, and, sql, desc } from 'drizzle-orm';
import { logger } from '@shared/utils/logger';

const router = express.Router();

// ============================================
// MULTI-DASHBOARD ARCHITECTURE - TEMPORARILY DISABLED
// ============================================

/**
 * Dashboard Types:
 * 1. Hotel Manager Dashboard - Full hotel operations
 * 2. SaaS Provider Dashboard - Multi-tenant management
 * 3. Staff Dashboard - Limited operations view
 */

// Temporarily comment out all routes due to auth middleware dependency issues
// TODO: Re-enable after auth system is properly configured

/*
// ============================================
// HOTEL MANAGER DASHBOARD
// ============================================

// Hotel Manager Dashboard - Main Overview
router.get('/dashboard/hotel-manager', authenticateJWT, async (req, res) => {
  try {
    const tenantId = req.query.tenantId as string || 'mi-nhon-hotel';
    
    logger.debug('🏨 [HOTEL-DASHBOARD] Getting hotel manager dashboard for: ${tenantId}', 'Component');

    // Get hotel overview data
    const [hotelInfo] = await db
      .select({
        id: tenants.id,
        hotel_name: tenants.hotel_name,
        subscription_plan: tenants.subscription_plan,
        subscription_status: tenants.subscription_status,
        monthly_call_limit: tenants.monthly_call_limit,
        max_voices: tenants.max_voices,
        max_languages: tenants.max_languages
      })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (!hotelInfo) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    // Get today's metrics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayMetrics = await db
      .select({
        totalCalls: sql<number>`count(${call.id})`,
        totalRequests: sql<number>`count(${requestTable.id})`,
        averageCallDuration: sql<number>`avg(${call.duration})`
      })
      .from(call)
      .leftJoin(requestTable, eq(call.call_id_vapi, requestTable.call_id))
      .where(
        and(
          eq(call.tenant_id, tenantId),
          sql`${call.created_at} >= ${today}`
        )
      );

    // Get recent requests
    const recentRequests = await db
      .select()
      .from(requestTable)
      .where(eq(requestTable.tenant_id, tenantId))
      .orderBy(requestTable.created_at.desc())
      .limit(10);

    // Get staff count
    const [staffCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(staff)
      .where(eq(staff.tenant_id, tenantId));

    const dashboardData = {
      hotel: hotelInfo,
      metrics: {
        today: todayMetrics[0] || { totalCalls: 0, totalRequests: 0, averageCallDuration: 0 },
        staffCount: staffCount?.count || 0
      },
      recentRequests,
      permissions: {
        canManageStaff: true,
        canViewAnalytics: true,
        canManageSettings: true,
        canViewFinancial: true,
        canManageSubscription: true
      }
    };

    logger.debug('✅ [HOTEL-DASHBOARD] Dashboard data retrieved for: ${hotelInfo.hotel_name}', 'Component');
    res.json(dashboardData);
  } catch (error) {
    logger.error('❌ [HOTEL-DASHBOARD] Error fetching hotel manager dashboard:', 'Component', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// ============================================
// SAAS PROVIDER DASHBOARD
// ============================================

// SaaS Provider Dashboard - Multi-tenant Overview
router.get('/dashboard/saas-provider', authenticateJWT, async (req, res) => {
  try {
    logger.debug('🏢 [SAAS-DASHBOARD] Getting SaaS provider dashboard', 'Component');

    // Get all tenants overview
    const allTenants = await db
      .select({
        id: tenants.id,
        hotel_name: tenants.hotel_name,
        subscription_plan: tenants.subscription_plan,
        subscription_status: tenants.subscription_status,
        created_at: tenants.created_at,
        monthly_call_limit: tenants.monthly_call_limit,
        is_active: tenants.is_active
      })
      .from(tenants)
      .orderBy(tenants.created_at.desc());

    // Get platform-wide metrics
    const platformMetrics = await db
      .select({
        totalTenants: sql<number>`count(distinct ${tenants.id})`,
        activeTenants: sql<number>`count(distinct case when ${tenants.is_active} = true then ${tenants.id} end)`,
        totalCalls: sql<number>`count(${call.id})`,
        totalRequests: sql<number>`count(${requestTable.id})`
      })
      .from(tenants)
      .leftJoin(call, eq(tenants.id, call.tenant_id))
      .leftJoin(requestTable, eq(tenants.id, requestTable.tenant_id));

    // Get subscription breakdown
    const subscriptionBreakdown = await db
      .select({
        plan: tenants.subscription_plan,
        count: sql<number>`count(*)`
      })
      .from(tenants)
      .groupBy(tenants.subscription_plan);

    // Get recent activity across all tenants
    const recentActivity = await db
      .select({
        tenant_id: requestTable.tenant_id,
        hotel_name: tenants.hotel_name,
        request_content: requestTable.request_content,
        status: requestTable.status,
        created_at: requestTable.created_at
      })
      .from(requestTable)
      .leftJoin(tenants, eq(requestTable.tenant_id, tenants.id))
      .orderBy(requestTable.created_at.desc())
      .limit(20);

    const dashboardData = {
      platform: {
        metrics: platformMetrics[0] || { totalTenants: 0, activeTenants: 0, totalCalls: 0, totalRequests: 0 },
        subscriptionBreakdown,
        recentActivity
      },
      tenants: allTenants,
      permissions: {
        canManageAllTenants: true,
        canViewPlatformAnalytics: true,
        canManageBilling: true,
        canManageSystemSettings: true,
        canViewSystemLogs: true
      }
    };

    logger.debug('✅ [SAAS-DASHBOARD] Platform dashboard data retrieved', 'Component');
    res.json(dashboardData);
  } catch (error) {
    logger.error('❌ [SAAS-DASHBOARD] Error fetching SaaS provider dashboard:', 'Component', error);
    res.status(500).json({ error: 'Failed to fetch platform dashboard data' });
  }
});

// ============================================
// STAFF DASHBOARD (LIMITED VIEW)
// ============================================

// Staff Dashboard - Limited Operations View
router.get('/dashboard/staff', authenticateJWT, async (req, res) => {
  try {
    const tenantId = req.query.tenantId as string || 'mi-nhon-hotel';
    const userId = req.user?.id;
    
    logger.debug('👥 [STAFF-DASHBOARD] Getting staff dashboard for user: ${userId}, tenant: ${tenantId}', 'Component');

    // Get user's role and permissions
    const [userInfo] = await db
      .select({
        id: staff.id,
        username: staff.username,
        role: staff.role,
        display_name: staff.display_name,
        permissions: staff.permissions
      })
      .from(staff)
      .where(and(
        eq(staff.id, userId),
        eq(staff.tenant_id, tenantId)
      ))
      .limit(1);

    if (!userInfo) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    // Get assigned requests
    const assignedRequests = await db
      .select()
      .from(requestTable)
      .where(and(
        eq(requestTable.tenant_id, tenantId),
        eq(requestTable.assigned_to, userInfo.username)
      ))
      .orderBy(requestTable.created_at.desc())
      .limit(15);

    // Get pending requests (for assignment)
    const pendingRequests = await db
      .select()
      .from(requestTable)
      .where(and(
        eq(requestTable.tenant_id, tenantId),
        eq(requestTable.status, 'Đã ghi nhận')
      ))
      .orderBy(requestTable.created_at.desc())
      .limit(10);

    // Get today's call count
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayCalls] = await db
      .select({ count: sql<number>`count(*)` })
      .from(call)
      .where(and(
        eq(call.tenant_id, tenantId),
        sql`${call.created_at} >= ${today}`
      ));

    const dashboardData = {
      user: userInfo,
      metrics: {
        assignedRequests: assignedRequests.length,
        pendingRequests: pendingRequests.length,
        todayCalls: todayCalls?.count || 0
      },
      assignedRequests,
      pendingRequests,
      permissions: {
        canViewRequests: true,
        canUpdateRequestStatus: userInfo.role !== 'read-only',
        canAssignRequests: userInfo.role === 'manager' || userInfo.role === 'admin',
        canViewBasicAnalytics: true,
        canAccessClientInterface: true
      }
    };

    logger.debug('✅ [STAFF-DASHBOARD] Staff dashboard data retrieved for: ${userInfo.username}', 'Component');
    res.json(dashboardData);
  } catch (error) {
    logger.error('❌ [STAFF-DASHBOARD] Error fetching staff dashboard:', 'Component', error);
    res.status(500).json({ error: 'Failed to fetch staff dashboard data' });
  }
});

// ============================================
// DASHBOARD CONFIGURATION
// ============================================

// Get dashboard configuration
router.get('/dashboard/config/:type', authenticateJWT, async (req, res) => {
  try {
    const { type } = req.params;
    const tenantId = req.query.tenantId as string;
    
    logger.debug('⚙️ [DASHBOARD-CONFIG] Getting config for dashboard type: ${type}', 'Component');

    let config = {};

    switch (type) {
      case 'hotel-manager':
        config = {
          widgets: [
            { id: 'overview', name: 'Overview', enabled: true, order: 1 },
            { id: 'recent-calls', name: 'Recent Calls', enabled: true, order: 2 },
            { id: 'requests', name: 'Service Requests', enabled: true, order: 3 },
            { id: 'analytics', name: 'Analytics', enabled: true, order: 4 },
            { id: 'staff-management', name: 'Staff Management', enabled: true, order: 5 },
            { id: 'settings', name: 'Hotel Settings', enabled: true, order: 6 }
          ],
          permissions: {
            canCustomizeLayout: true,
            canExportData: true,
            canManageStaff: true,
            canViewFinancials: true
          }
        };
        break;

      case 'saas-provider':
        config = {
          widgets: [
            { id: 'platform-overview', name: 'Platform Overview', enabled: true, order: 1 },
            { id: 'tenant-management', name: 'Tenant Management', enabled: true, order: 2 },
            { id: 'billing', name: 'Billing & Subscriptions', enabled: true, order: 3 },
            { id: 'system-health', name: 'System Health', enabled: true, order: 4 },
            { id: 'analytics', name: 'Platform Analytics', enabled: true, order: 5 },
            { id: 'support', name: 'Customer Support', enabled: true, order: 6 }
          ],
          permissions: {
            canManageAllTenants: true,
            canViewSystemLogs: true,
            canManageBilling: true,
            canConfigureSystem: true
          }
        };
        break;

      case 'staff':
        config = {
          widgets: [
            { id: 'my-requests', name: 'My Assigned Requests', enabled: true, order: 1 },
            { id: 'pending-requests', name: 'Pending Requests', enabled: true, order: 2 },
            { id: 'quick-actions', name: 'Quick Actions', enabled: true, order: 3 },
            { id: 'today-stats', name: "Today's Statistics", enabled: true, order: 4 }
          ],
          permissions: {
            canCustomizeLayout: false,
            canViewLimitedAnalytics: true,
            canAccessClientInterface: true
          }
        };
        break;

      default:
        return res.status(400).json({ error: 'Invalid dashboard type' });
    }

    logger.debug('✅ [DASHBOARD-CONFIG] Config retrieved for: ${type}', 'Component');
    res.json(config);
  } catch (error) {
    logger.error('❌ [DASHBOARD-CONFIG] Error fetching dashboard config:', 'Component', error);
    res.status(500).json({ error: 'Failed to fetch dashboard configuration' });
  }
});
*/

export default router;
