/**
 * Billing & Subscription Management Domain - Type Definitions
 * Complete types for subscription management, billing, payments, and invoices
 */

// ============================================
// SUBSCRIPTION TYPES
// ============================================

export type SubscriptionPlan = "trial" | "basic" | "premium" | "enterprise";
export type BillingCycle = "monthly" | "yearly";
export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired";

export interface SubscriptionDetails {
  id: string;
  tenantId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  plan: SubscriptionPlan;
  cycle: BillingCycle;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEnd?: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  endedAt?: Date;
  nextBillingDate?: Date;
  metadata: Record<string, any>;
  created: Date;
  updated: Date;
}

export interface SubscriptionLimits {
  maxVoices: number;
  maxLanguages: number;
  monthlyCallLimit: number;
  dataRetentionDays: number;
  maxStaffUsers: number;
  maxHotelLocations: number;
}

export interface PlanFeatures {
  voiceCloning: boolean;
  multiLocation: boolean;
  whiteLabel: boolean;
  prioritySupport: boolean;
  advancedAnalytics: boolean;
  apiAccess: boolean;
  webhooks: boolean;
  customIntegrations: boolean;
}

// ============================================
// PRICING & PLANS
// ============================================

export interface PricingConfig {
  plan: SubscriptionPlan;
  cycle: BillingCycle;
  priceId: string;
  amount: number;
  currency: string;
  features: string[];
  limits: SubscriptionLimits;
  planFeatures: PlanFeatures;
  displayName: string;
  description: string;
  popular?: boolean;
  discount?: {
    percentage: number;
    description: string;
  };
}

// ============================================
// BILLING & PAYMENT TYPES
// ============================================

export interface PaymentMethod {
  id: string;
  type: "card" | "bank_transfer" | "sepa_debit";
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    country: string;
  };
  bankTransfer?: {
    accountNumber: string;
    routingNumber: string;
    bankName: string;
  };
  isDefault: boolean;
  created: Date;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status:
    | "requires_payment_method"
    | "requires_confirmation"
    | "requires_action"
    | "processing"
    | "succeeded"
    | "canceled";
  clientSecret: string;
  paymentMethodId?: string;
  created: Date;
  metadata: Record<string, any>;
}

export interface Invoice {
  id: string;
  number: string;
  tenantId: string;
  subscriptionId?: string;
  amount: number;
  amountPaid: number;
  amountRemaining: number;
  currency: string;
  status: "draft" | "open" | "paid" | "uncollectible" | "void";
  description: string;
  paidAt?: Date;
  dueDate?: Date;
  periodStart: Date;
  periodEnd: Date;
  hostedInvoiceUrl: string;
  invoicePdf: string;
  lineItems: InvoiceLineItem[];
  taxAmount?: number;
  discountAmount?: number;
  created: Date;
  metadata: Record<string, any>;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  amount: number;
  quantity: number;
  unitAmount: number;
  period: {
    start: Date;
    end: Date;
  };
  proration?: boolean;
}

// ============================================
// USAGE & ANALYTICS
// ============================================

export interface UsageRecord {
  id: string;
  tenantId: string;
  metricName: string;
  quantity: number;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface BillingUsage {
  tenantId: string;
  currentPeriod: {
    start: Date;
    end: Date;
  };
  usage: {
    voiceCalls: {
      count: number;
      limit: number;
      percentage: number;
    };
    apiRequests: {
      count: number;
      limit: number;
      percentage: number;
    };
    storage: {
      used: number; // in MB
      limit: number;
      percentage: number;
    };
    staffUsers: {
      count: number;
      limit: number;
      percentage: number;
    };
    hotelLocations: {
      count: number;
      limit: number;
      percentage: number;
    };
  };
  overageCharges: {
    voiceCalls: number;
    apiRequests: number;
    storage: number;
  };
  totalOverage: number;
}

// ============================================
// BILLING ANALYTICS
// ============================================

export interface BillingAnalytics {
  tenantId: string;
  period: {
    start: Date;
    end: Date;
  };
  revenue: {
    totalRevenue: number;
    recurringRevenue: number;
    oneTimeCharges: number;
    overageCharges: number;
    refunds: number;
    netRevenue: number;
  };
  metrics: {
    averageRevenuePerUser: number;
    churnRate: number;
    lifetimeValue: number;
    paymentSuccessRate: number;
  };
  planDistribution: Record<
    SubscriptionPlan,
    {
      count: number;
      revenue: number;
      percentage: number;
    }
  >;
  usageTrends: {
    date: string;
    voiceCalls: number;
    apiRequests: number;
    storageUsed: number;
  }[];
}

// ============================================
// REQUEST/RESPONSE PAYLOADS
// ============================================

export interface CreateSubscriptionPayload {
  tenantId: string;
  plan: SubscriptionPlan;
  cycle: BillingCycle;
  paymentMethodId?: string;
  couponId?: string;
  trialDays?: number;
}

export interface UpdateSubscriptionPayload {
  subscriptionId: string;
  plan?: SubscriptionPlan;
  cycle?: BillingCycle;
  proration?: boolean;
  immediateChange?: boolean;
}

export interface CancelSubscriptionPayload {
  subscriptionId: string;
  cancelAtPeriodEnd: boolean;
  reason?: string;
  feedback?: string;
}

export interface CreatePaymentIntentPayload {
  amount: number;
  currency: string;
  tenantId: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface ProcessPaymentPayload {
  paymentIntentId: string;
  paymentMethodId: string;
  savePaymentMethod?: boolean;
}

// ============================================
// BILLING DASHBOARD STATE
// ============================================

export interface BillingFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  status?: SubscriptionStatus[];
  plan?: SubscriptionPlan[];
  paymentStatus?: string[];
}

export interface BillingViewOptions {
  viewType:
    | "overview"
    | "subscriptions"
    | "invoices"
    | "payments"
    | "usage"
    | "analytics";
  sortBy: string;
  sortOrder: "asc" | "desc";
  itemsPerPage: number;
  currentPage: number;
}

// ============================================
// ERROR TYPES
// ============================================

export interface BillingError {
  code: string;
  message: string;
  type:
    | "validation"
    | "payment"
    | "subscription"
    | "invoice"
    | "network"
    | "stripe";
  details?: Record<string, any>;
  timestamp: Date;
}

// ============================================
// WEBHOOK TYPES
// ============================================

export interface BillingWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
    previousAttributes?: any;
  };
  created: Date;
  livemode: boolean;
}

// ============================================
// NOTIFICATIONS
// ============================================

export interface BillingNotification {
  id: string;
  tenantId: string;
  type:
    | "payment_succeeded"
    | "payment_failed"
    | "invoice_created"
    | "subscription_updated"
    | "trial_ending"
    | "usage_threshold";
  title: string;
  message: string;
  severity: "info" | "warning" | "error" | "success";
  read: boolean;
  created: Date;
  metadata: Record<string, any>;
}

// ============================================
// CONSTANTS
// ============================================

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  "trial",
  "basic",
  "premium",
  "enterprise",
];
export const BILLING_CYCLES: BillingCycle[] = ["monthly", "yearly"];

export const PLAN_LIMITS: Record<SubscriptionPlan, SubscriptionLimits> = {
  trial: {
    maxVoices: 2,
    maxLanguages: 2,
    monthlyCallLimit: 100,
    dataRetentionDays: 30,
    maxStaffUsers: 2,
    maxHotelLocations: 1,
  },
  basic: {
    maxVoices: 5,
    maxLanguages: 4,
    monthlyCallLimit: 1000,
    dataRetentionDays: 90,
    maxStaffUsers: 5,
    maxHotelLocations: 1,
  },
  premium: {
    maxVoices: 15,
    maxLanguages: 8,
    monthlyCallLimit: 5000,
    dataRetentionDays: 365,
    maxStaffUsers: 15,
    maxHotelLocations: 5,
  },
  enterprise: {
    maxVoices: -1, // Unlimited
    maxLanguages: -1,
    monthlyCallLimit: -1,
    dataRetentionDays: -1,
    maxStaffUsers: -1,
    maxHotelLocations: -1,
  },
};

export const PLAN_FEATURES: Record<SubscriptionPlan, PlanFeatures> = {
  trial: {
    voiceCloning: false,
    multiLocation: false,
    whiteLabel: false,
    prioritySupport: false,
    advancedAnalytics: false,
    apiAccess: true,
    webhooks: false,
    customIntegrations: false,
  },
  basic: {
    voiceCloning: false,
    multiLocation: false,
    whiteLabel: false,
    prioritySupport: false,
    advancedAnalytics: false,
    apiAccess: true,
    webhooks: true,
    customIntegrations: false,
  },
  premium: {
    voiceCloning: true,
    multiLocation: true,
    whiteLabel: false,
    prioritySupport: true,
    advancedAnalytics: true,
    apiAccess: true,
    webhooks: true,
    customIntegrations: true,
  },
  enterprise: {
    voiceCloning: true,
    multiLocation: true,
    whiteLabel: true,
    prioritySupport: true,
    advancedAnalytics: true,
    apiAccess: true,
    webhooks: true,
    customIntegrations: true,
  },
};
