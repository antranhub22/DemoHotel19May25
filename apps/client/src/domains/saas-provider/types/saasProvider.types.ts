/**
 * SaaS Provider Domain Types
 * Multi-tenant system with subscription management
 */

export type SubscriptionPlan = "trial" | "basic" | "premium" | "enterprise";
export type SubscriptionStatus =
  | "active"
  | "inactive"
  | "expired"
  | "cancelled"
  | "trial";
export type BillingCycle = "monthly" | "yearly";

export interface TenantData {
  id: string;
  hotelName: string;
  subdomain: string;
  customDomain?: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  billingCycle: BillingCycle;
  trialEndsAt?: Date;
  subscriptionEndsAt?: Date;
  remainingDays?: number;

  // Feature flags based on subscription
  features: {
    voiceCloning: boolean;
    multiLocation: boolean;
    whiteLabel: boolean;
    advancedAnalytics: boolean;
    apiAccess: boolean;
    customIntegrations: boolean;
    prioritySupport: boolean;
    dataExport: boolean;
  };

  // Usage limits based on subscription
  limits: {
    maxCalls: number;
    maxAssistants: number;
    maxLanguages: number;
    maxStaffMembers: number;
    dataRetentionDays: number;
    maxApiCalls: number;
    maxMonthlyMinutes: number;
  };

  // Current usage tracking
  usage: {
    totalCalls: number;
    currentMonthCalls: number;
    currentMonthMinutes: number;
    currentMonthApiCalls: number;
    remainingCalls: number;
    remainingMinutes: number;
    activeStaffMembers: number;
    storageUsed: number; // in MB
  };

  // Billing information
  billing?: {
    customerId: string; // Stripe customer ID
    subscriptionId: string; // Stripe subscription ID
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    nextBillingDate: Date;
    amount: number;
    currency: string;
    paymentMethod?: {
      type: "card" | "bank_transfer";
      last4?: string;
      brand?: string;
    };
    invoices: Invoice[];
  };

  // Compliance and security
  compliance: {
    gdprCompliance: boolean;
    dataProcessingAgreement: boolean;
    ccpaCompliance: boolean;
    soc2Compliant: boolean;
    lastSecurityAudit?: Date;
  };
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed" | "cancelled";
  invoiceDate: Date;
  dueDate: Date;
  paidAt?: Date;
  downloadUrl?: string;
}

export interface TeamMember {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "member";
  permissions: string[];
  inviteStatus: "pending" | "accepted" | "expired";
  invitedAt: Date;
  joinedAt?: Date;
  lastActiveAt?: Date;
}

export interface SubscriptionPlanDetails {
  id: SubscriptionPlan;
  name: string;
  displayName: string;
  description: string;
  features: string[];
  limits: TenantData["limits"];
  pricing: {
    monthly: number;
    yearly: number;
    currency: string;
  };
  popular?: boolean;
  enterprise?: boolean;
}

export interface UsageAlert {
  id: string;
  tenantId: string;
  type:
    | "approaching_limit"
    | "limit_exceeded"
    | "trial_ending"
    | "payment_failed";
  metric: "calls" | "minutes" | "api_calls" | "storage" | "trial_days";
  currentValue: number;
  limitValue: number;
  threshold: number; // percentage
  message: string;
  severity: "info" | "warning" | "critical";
  createdAt: Date;
  resolvedAt?: Date;
}

export interface WhiteLabelConfig {
  tenantId: string;
  brandName: string;
  logo: {
    primary: string; // URL
    favicon: string; // URL
    loginPage: string; // URL
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  customDomain: string;
  sslCertificate?: {
    status: "active" | "pending" | "expired";
    expiresAt?: Date;
  };
  customEmails: {
    fromName: string;
    fromEmail: string;
    replyTo: string;
    supportEmail: string;
  };
}

export interface ApiKeyConfig {
  id: string;
  tenantId: string;
  name: string;
  keyPrefix: string; // First 8 chars for display
  permissions: string[];
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  isActive: boolean;
  createdAt: Date;
  lastUsedAt?: Date;
  expiresAt?: Date;
}

// Events for SaaS Provider domain
export interface SaasProviderEvents {
  "subscription:plan_changed": {
    tenantId: string;
    oldPlan: SubscriptionPlan;
    newPlan: SubscriptionPlan;
    timestamp: Date;
  };
  "subscription:cancelled": {
    tenantId: string;
    plan: SubscriptionPlan;
    reason?: string;
    timestamp: Date;
  };
  "usage:limit_approached": {
    tenantId: string;
    metric: string;
    percentage: number;
    timestamp: Date;
  };
  "usage:limit_exceeded": {
    tenantId: string;
    metric: string;
    currentValue: number;
    limitValue: number;
    timestamp: Date;
  };
  "billing:payment_successful": {
    tenantId: string;
    amount: number;
    invoiceId: string;
    timestamp: Date;
  };
  "billing:payment_failed": {
    tenantId: string;
    amount: number;
    invoiceId: string;
    reason: string;
    timestamp: Date;
  };
  "team:member_added": {
    tenantId: string;
    memberId: string;
    role: string;
    timestamp: Date;
  };
  "feature:access_denied": {
    tenantId: string;
    feature: string;
    requiredPlan: SubscriptionPlan;
    currentPlan: SubscriptionPlan;
    timestamp: Date;
  };
}

// ================================
// PLATFORM ADMIN TYPES
// ================================

export interface PlatformMetrics {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  paidTenants: number;
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  averageRevenuePerUser: number;
  churnRate: number;
  growthRate: number;

  // System metrics
  totalApiCalls: number;
  totalVoiceCalls: number;
  totalMinutes: number;
  systemUptime: number;

  // Feature adoption
  featureAdoption: {
    [featureName: string]: {
      totalUsers: number;
      percentage: number;
    };
  };

  // Time series data
  revenueTimeSeries: {
    date: string;
    revenue: number;
    subscriptions: number;
  }[];

  usageTimeSeries: {
    date: string;
    apiCalls: number;
    voiceCalls: number;
    minutes: number;
  }[];
}

export interface TenantListItem {
  id: string;
  hotelName: string;
  subdomain: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  totalRevenue: number;
  lastActive: Date;
  createdAt: Date;
  usage: {
    currentMonthApiCalls: number;
    currentMonthVoiceCalls: number;
    currentMonthMinutes: number;
  };
  health: "healthy" | "warning" | "critical";
}

export interface SystemHealth {
  status: "healthy" | "degraded" | "outage";
  uptime: number;
  services: {
    [serviceName: string]: {
      status: "operational" | "degraded" | "outage";
      responseTime: number;
      errorRate: number;
      lastCheck: Date;
    };
  };
  infrastructure: {
    cpu: number;
    memory: number;
    storage: number;
    database: {
      connectionPool: number;
      queryLatency: number;
      activeConnections: number;
    };
  };
  alerts: SystemAlert[];
}

export interface SystemAlert {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  service: string;
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  targetAudience: {
    plans: SubscriptionPlan[];
    tenantIds?: string[];
    regions?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface RevenueReport {
  period: {
    start: Date;
    end: Date;
  };
  totalRevenue: number;
  newRevenue: number;
  churned: number;
  expansion: number;
  contraction: number;
  breakdown: {
    plan: SubscriptionPlan;
    revenue: number;
    subscribers: number;
  }[];
  cohortAnalysis: {
    cohort: string;
    revenue: number[];
    retention: number[];
  }[];
}

export interface PlatformAdminState {
  // Dashboard data
  metrics: PlatformMetrics | null;
  isLoadingMetrics: boolean;

  // Tenant management
  tenants: TenantListItem[];
  selectedTenant: TenantData | null;
  isLoadingTenants: boolean;
  tenantFilters: {
    status?: SubscriptionStatus;
    plan?: SubscriptionPlan;
    search?: string;
  };

  // System health
  systemHealth: SystemHealth | null;
  isLoadingHealth: boolean;

  // Feature flags
  featureFlags: FeatureFlag[];
  isLoadingFlags: boolean;

  // Reports
  revenueReport: RevenueReport | null;
  isLoadingReport: boolean;

  // Error handling
  error: string | null;
}
