/**
 * 🔄 UNIFIED PRISMA DATABASE SERVICE
 *
 * Comprehensive database service implementing IDatabaseService interface
 * Combines RequestService, TenantService, and other entity services
 * using Prisma ORM for enhanced performance and type safety
 */

import {
  CallEntity,
  CallStats,
  CreateCallInput,
  CreateRequestInput,
  CreateTenantInput,
  CreateUserInput,
  DatabaseTransaction,
  DateRange,
  IDatabaseService,
  RequestEntity,
  RequestFilters,
  RequestStats,
  TenantEntity,
  TenantMetrics,
  UpdateCallInput,
  UpdateRequestInput,
  UpdateTenantInput,
  UpdateUserInput,
  UserEntity,
} from "../db/IDatabaseService";
import { PrismaConnectionManager } from "../db/PrismaConnectionManager";
import { logger } from "../utils/logger";

// Import specialized services
import { PrismaAnalyticsService } from "./PrismaAnalyticsService";
import { PrismaRequestService } from "./PrismaRequestService";
import { PrismaTenantService } from "./PrismaTenantService";

/**
 * Unified Database Service using Prisma ORM
 * Implements full IDatabaseService interface by orchestrating specialized services
 */
export class PrismaDatabaseService implements IDatabaseService {
  private requestService: PrismaRequestService;
  private tenantService: PrismaTenantService;
  private analyticsService: PrismaAnalyticsService;
  private prismaManager: PrismaConnectionManager;
  private instanceId: string;

  constructor(prismaManager: PrismaConnectionManager) {
    this.prismaManager = prismaManager;
    this.instanceId = `prisma-database-service-${Date.now()}`;

    // Initialize specialized services
    this.requestService = new PrismaRequestService(prismaManager);
    this.tenantService = new PrismaTenantService(prismaManager);
    this.analyticsService = new PrismaAnalyticsService(prismaManager);

    logger.info("🔄 PrismaDatabaseService initialized", {
      instanceId: this.instanceId,
      services: ["RequestService", "TenantService", "AnalyticsService"],
    });
  }

  // ============================================
  // REQUEST OPERATIONS (Delegate to PrismaRequestService)
  // ============================================

  async createRequest(requestData: CreateRequestInput): Promise<RequestEntity> {
    return this.requestService.createRequest(requestData);
  }

  async getRequestById(id: number): Promise<RequestEntity | null> {
    return this.requestService.getRequestById(id);
  }

  async getAllRequests(filters?: RequestFilters): Promise<RequestEntity[]> {
    return this.requestService.getAllRequests(filters);
  }

  async updateRequest(
    id: number,
    data: UpdateRequestInput,
  ): Promise<RequestEntity> {
    return this.requestService.updateRequest(id, data);
  }

  async deleteRequest(id: number): Promise<boolean> {
    return this.requestService.deleteRequest(id);
  }

  async getRequestStats(
    tenantId: string,
    dateRange?: DateRange,
  ): Promise<RequestStats> {
    // Delegate to PrismaAnalyticsService for statistics
    const analyticsService = new (
      await import("./PrismaAnalyticsService")
    ).PrismaAnalyticsService();
    return await analyticsService.getRequestStatistics(tenantId, dateRange);
  }

  // ============================================
  // TENANT OPERATIONS (Delegate to PrismaTenantService)
  // ============================================

  async getTenantById(id: string): Promise<TenantEntity | null> {
    return this.tenantService.getTenantById(id);
  }

  async getAllTenants(): Promise<TenantEntity[]> {
    return this.tenantService.getAllTenants();
  }

  async createTenant(tenantData: CreateTenantInput): Promise<TenantEntity> {
    return this.tenantService.createTenant(tenantData);
  }

  async updateTenant(
    id: string,
    data: UpdateTenantInput,
  ): Promise<TenantEntity> {
    return this.tenantService.updateTenant(id, data);
  }

  async getTenantMetrics(tenantId: string): Promise<TenantMetrics> {
    // Delegate to PrismaTenantService for metrics
    return await this.tenantService.getTenantMetrics(tenantId);
  }

  // ============================================
  // USER OPERATIONS (TODO: Implement PrismaUserService)
  // ============================================

  async getUserById(id: string): Promise<UserEntity | null> {
    // TODO: Implement user operations
    throw new Error("getUserById not implemented yet");
  }

  async getUserByEmail(email: string): Promise<UserEntity | null> {
    // TODO: Implement user operations
    throw new Error("getUserByEmail not implemented yet");
  }

  async createUser(userData: CreateUserInput): Promise<UserEntity> {
    // TODO: Implement user operations
    throw new Error("createUser not implemented yet");
  }

  async updateUser(id: string, data: UpdateUserInput): Promise<UserEntity> {
    // TODO: Implement user operations
    throw new Error("updateUser not implemented yet");
  }

  // ============================================
  // CALL OPERATIONS (TODO: Implement PrismaCallService)
  // ============================================

  async createCall(callData: CreateCallInput): Promise<CallEntity> {
    // TODO: Implement call operations
    throw new Error("createCall not implemented yet");
  }

  async getCallById(id: string): Promise<CallEntity | null> {
    // TODO: Implement call operations
    throw new Error("getCallById not implemented yet");
  }

  async getCallsByTenant(tenantId: string): Promise<CallEntity[]> {
    // TODO: Implement call operations
    throw new Error("getCallsByTenant not implemented yet");
  }

  async updateCall(id: string, data: UpdateCallInput): Promise<CallEntity> {
    // TODO: Implement call operations
    throw new Error("updateCall not implemented yet");
  }

  async getCallStats(
    tenantId: string,
    dateRange?: DateRange,
  ): Promise<CallStats> {
    // TODO: Implement call statistics
    throw new Error("getCallStats not implemented yet");
  }

  // ============================================
  // CONNECTION MANAGEMENT
  // ============================================

  async connect(): Promise<void> {
    await this.prismaManager.initialize();
    logger.info("✅ PrismaDatabaseService connected");
  }

  async disconnect(): Promise<void> {
    await this.prismaManager.disconnect();
    logger.info("✅ PrismaDatabaseService disconnected");
  }

  async healthCheck(): Promise<boolean> {
    try {
      const isHealthy = await this.prismaManager.healthCheck();
      logger.info("🏥 PrismaDatabaseService health check", { isHealthy });
      return isHealthy;
    } catch (error) {
      logger.error("❌ PrismaDatabaseService health check failed", error);
      return false;
    }
  }

  async beginTransaction(): Promise<DatabaseTransaction> {
    // TODO: Implement transaction support
    throw new Error("beginTransaction not implemented yet");
  }

  // ============================================
  // ANALYTICS OPERATIONS (Delegate to PrismaAnalyticsService)
  // ============================================

  /**
   * Get overview analytics
   */
  async getOverviewAnalytics(options?: {
    tenantId?: string;
    timeRange?: { start: Date; end: Date };
  }) {
    return this.analyticsService.getOverview(options);
  }

  /**
   * Get service distribution analytics
   */
  async getServiceDistribution(options?: {
    tenantId?: string;
    timeRange?: { start: Date; end: Date };
  }) {
    return this.analyticsService.getServiceDistribution(options);
  }

  /**
   * Get hourly activity analytics
   */
  async getHourlyActivity(options?: {
    tenantId?: string;
    timeRange?: { start: Date; end: Date };
  }) {
    return this.analyticsService.getHourlyActivity(options);
  }

  /**
   * Get language distribution analytics
   */
  async getLanguageDistribution(options?: {
    tenantId?: string;
    timeRange?: { start: Date; end: Date };
  }) {
    return this.analyticsService.getLanguageDistribution(options);
  }

  /**
   * Get request analytics
   */
  async getRequestAnalytics(options?: {
    tenantId?: string;
    timeRange?: { start: Date; end: Date };
  }) {
    return this.analyticsService.getRequestAnalytics(options);
  }

  /**
   * Get comprehensive dashboard analytics
   */
  async getDashboardAnalytics(options?: {
    tenantId?: string;
    timeRange?: { start: Date; end: Date };
  }) {
    return this.analyticsService.getDashboardAnalytics(options);
  }

  /**
   * Clear analytics cache
   */
  clearAnalyticsCache(): void {
    this.analyticsService.clearCache();
  }

  /**
   * Get analytics service health
   */
  async getAnalyticsHealth() {
    return this.analyticsService.getServiceHealth();
  }

  // ============================================
  // SERVICE UTILITIES
  // ============================================

  /**
   * Get metrics from all specialized services
   */
  getServiceMetrics() {
    return {
      instanceId: this.instanceId,
      requestService: this.requestService.getMetrics(),
      tenantService: this.tenantService.getMetrics(),
      analyticsService: this.analyticsService.getMetrics(),
      prismaManager: this.prismaManager.getMetrics(),
    };
  }

  /**
   * Reset metrics for all services (testing)
   */
  resetAllMetrics(): void {
    this.requestService.resetMetrics();
    this.tenantService.resetMetrics();
    this.analyticsService.resetMetrics();
    logger.info("🔄 All service metrics reset");
  }

  /**
   * Get service configuration
   */
  getServiceConfig() {
    return {
      instanceId: this.instanceId,
      services: {
        requestService: "PrismaRequestService",
        tenantService: "PrismaTenantService",
        analyticsService: "PrismaAnalyticsService",
        userService: "Not implemented",
        callService: "Not implemented",
      },
      features: {
        requestOperations: true,
        tenantOperations: true,
        analyticsOperations: true,
        userOperations: false,
        callOperations: false,
        transactions: false,
      },
    };
  }
}

export default PrismaDatabaseService;
