/**
 * Billing & Subscription Management Domain - Entry Point
 * Complete billing and subscription management system with Stripe integration
 */

// ============================================
// TYPE EXPORTS
// ============================================

export type {
  // Core Types
  SubscriptionPlan,
  BillingCycle,
  SubscriptionStatus,
  SubscriptionDetails,
  SubscriptionLimits,
  PlanFeatures,

  // Pricing & Plans
  PricingConfig,

  // Payment Types
  PaymentMethod,
  PaymentIntent,

  // Invoice Types
  Invoice,
  InvoiceLineItem,

  // Usage & Analytics
  UsageRecord,
  BillingUsage,
  BillingAnalytics,

  // Request/Response Payloads
  CreateSubscriptionPayload,
  UpdateSubscriptionPayload,
  CancelSubscriptionPayload,
  CreatePaymentIntentPayload,
  ProcessPaymentPayload,

  // UI State Types
  BillingFilters,
  BillingViewOptions,
  BillingError,
  BillingNotification,

  // Webhook Types
  BillingWebhookEvent,
} from './types/billing.types.ts';

// ============================================
// CONSTANTS EXPORTS
// ============================================

export {
  SUBSCRIPTION_PLANS,
  BILLING_CYCLES,
  PLAN_LIMITS,
  PLAN_FEATURES,
} from './types/billing.types.ts';

// ============================================
// SERVICE EXPORTS
// ============================================
// NOTE: Service exports temporarily disabled to resolve circular dependency
// Will be re-enabled after architectural refactor

// ============================================
// REDUX EXPORTS
// ============================================

export {
  // Async Thunks - Subscription Management
  fetchSubscriptions,
  fetchSubscription,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  reactivateSubscription,

  // Async Thunks - Pricing & Plans
  fetchPricingConfig,

  // Async Thunks - Payment Management
  fetchPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod,
  createPaymentIntent,
  confirmPayment,

  // Async Thunks - Invoice Management
  fetchInvoices,
  fetchInvoice,
  fetchUpcomingInvoice,
  downloadInvoice,

  // Async Thunks - Usage & Analytics
  fetchCurrentUsage,
  fetchUsageHistory,
  fetchBillingAnalytics,

  // Async Thunks - Notifications
  fetchNotifications,
  markNotificationAsRead,

  // Async Thunks - Customer Portal
  createCustomerPortalSession,

  // Sync Actions
  setError,
  clearError,
  setFilters,
  setViewOptions,
  setSelectedSubscription,
  setSelectedPaymentMethod,
  setSelectedInvoice,
  setUpgrading,
  setProcessingPayment,
  addBillingUpdate,
  clearBillingData,
} from './store/billingSlice.ts';

// Default export for the reducer
export { default as billingReducer } from './store/billingSlice.ts';

// ============================================
// HOOKS EXPORTS
// ============================================

// NOTE: Hooks exports temporarily disabled to resolve circular dependency
// Will be re-enabled after architectural refactor

// ============================================
// UTILITIES & HELPERS
// ============================================

export const BillingUtils = {
  // Plan comparison utilities
  isUpgrade: (
    currentPlan: SubscriptionPlan,
    targetPlan: SubscriptionPlan,
  ): boolean => {
    const planHierarchy: SubscriptionPlan[] = [
      "trial",
      "basic",
      "premium",
      "enterprise",
    ];
    return (
      planHierarchy.indexOf(targetPlan) > planHierarchy.indexOf(currentPlan)
    );
  },

  isDowngrade: (
    currentPlan: SubscriptionPlan,
    targetPlan: SubscriptionPlan,
  ): boolean => {
    const planHierarchy: SubscriptionPlan[] = [
      "trial",
      "basic",
      "premium",
      "enterprise",
    ];
    return (
      planHierarchy.indexOf(targetPlan) < planHierarchy.indexOf(currentPlan)
    );
  },

  // Formatting utilities
  formatCurrency: (amount: number, currency = "USD"): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Stripe amounts are in cents
  },

  formatUsagePercentage: (used: number, limit: number): string => {
    if (limit === -1) return "Unlimited";
    if (limit === 0) return "0%";
    return `${Math.round((used / limit) * 100)}%`;
  },

  // Date utilities
  isTrialExpiring: (trialEnd?: Date, daysThreshold = 7): boolean => {
    if (!trialEnd) return false;
    const now = new Date();
    const daysRemaining = Math.ceil(
      (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysRemaining <= daysThreshold && daysRemaining > 0;
  },

  getDaysUntilTrialEnd: (trialEnd?: Date): number => {
    if (!trialEnd) return 0;
    const now = new Date();
    return Math.ceil(
      (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
  },

  // Usage utilities
  isOverLimit: (used: number, limit: number): boolean => {
    if (limit === -1) return false; // Unlimited
    return used >= limit;
  },

  isNearLimit: (used: number, limit: number, threshold = 0.8): boolean => {
    if (limit === -1) return false; // Unlimited
    return used / limit >= threshold;
  },

  // Status utilities
  getSubscriptionStatusColor: (status: SubscriptionStatus): string => {
    switch (status) {
      case "active":
        return "green";
      case "trialing":
        return "blue";
      case "past_due":
        return "orange";
      case "canceled":
        return "red";
      case "unpaid":
        return "red";
      case "incomplete":
        return "yellow";
      case "incomplete_expired":
        return "gray";
      default:
        return "gray";
    }
  },

  getUsageStatusColor: (percentage: number): string => {
    if (percentage >= 100) return "red";
    if (percentage >= 80) return "orange";
    if (percentage >= 60) return "yellow";
    return "green";
  },

  // Plan feature checking
  hasPlanFeature: (
    plan: SubscriptionPlan,
    feature: keyof PlanFeatures,
  ): boolean => {
    const { PLAN_FEATURES } = require("./types/billing.types");
    return PLAN_FEATURES[plan]?.[feature] || false;
  },

  getPlanLimit: (
    plan: SubscriptionPlan,
    limitType: keyof SubscriptionLimits,
  ): number => {
    const { PLAN_LIMITS } = require("./types/billing.types");
    return PLAN_LIMITS[plan]?.[limitType] || 0;
  },

  // Invoice utilities
  calculateInvoiceTotal: (invoice: Invoice): number => {
    return (
      invoice.amount + (invoice.taxAmount || 0) - (invoice.discountAmount || 0)
    );
  },

  isInvoiceOverdue: (invoice: Invoice): boolean => {
    if (!invoice.dueDate || invoice.status === "paid") return false;
    return new Date(invoice.dueDate) < new Date();
  },

  // Payment utilities
  getPaymentMethodDisplayName: (paymentMethod: PaymentMethod): string => {
    if (paymentMethod.type === "card" && paymentMethod.card) {
      return `**** **** **** ${paymentMethod.card.last4}`;
    }
    if (paymentMethod.type === "bank_transfer" && paymentMethod.bankTransfer) {
      return `****${paymentMethod.bankTransfer.accountNumber.slice(-4)}`;
    }
    return "Payment Method";
  },

  // Notification utilities
  getNotificationIcon: (type: BillingNotification["type"]): string => {
    switch (type) {
      case "payment_succeeded":
        return "✅";
      case "payment_failed":
        return "❌";
      case "invoice_created":
        return "📄";
      case "subscription_updated":
        return "🔄";
      case "trial_ending":
        return "⏰";
      case "usage_threshold":
        return "📊";
      default:
        return "ℹ️";
    }
  },

  // Date formatting
  formatDate: (date: Date | string): string => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  },

  formatDateTime: (date: Date | string): string => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  // Period utilities
  getCurrentBillingPeriod: (subscription: SubscriptionDetails) => {
    return {
      start: subscription.currentPeriodStart,
      end: subscription.currentPeriodEnd,
      daysRemaining: Math.ceil(
        (subscription.currentPeriodEnd.getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    };
  },

  // Validation utilities
  validateEmailForBilling: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validateCurrency: (currency: string): boolean => {
    const supportedCurrencies = ["USD", "EUR", "GBP", "CAD", "AUD"];
    return supportedCurrencies.includes(currency.toUpperCase());
  },

  // Error handling utilities
  formatBillingError: (error: BillingError): string => {
    switch (error.type) {
      case "payment":
        return `Payment failed: ${error.message}`;
      case "subscription":
        return `Subscription error: ${error.message}`;
      case "invoice":
        return `Invoice error: ${error.message}`;
      case "validation":
        return `Validation error: ${error.message}`;
      case "network":
        return `Network error: ${error.message}`;
      case "stripe":
        return `Billing service error: ${error.message}`;
      default:
        return `Error: ${error.message}`;
    }
  },
};

// Re-export types for convenience
import type {
  SubscriptionPlan,
  BillingCycle,
  SubscriptionStatus,
  SubscriptionDetails,
  SubscriptionLimits,
  PlanFeatures,
  PricingConfig,
  PaymentMethod,
  PaymentIntent,
  Invoice,
  InvoiceLineItem,
  UsageRecord,
  BillingUsage,
  BillingAnalytics,
  CreateSubscriptionPayload,
  UpdateSubscriptionPayload,
  CancelSubscriptionPayload,
  CreatePaymentIntentPayload,
  ProcessPaymentPayload,
  BillingFilters,
  BillingViewOptions,
  BillingError,
  BillingNotification,
  BillingWebhookEvent,
} from './types/billing.types.ts';

// ============================================
// FEATURE FLAGS & CONSTANTS
// ============================================

export const BILLING_FEATURES = {
  STRIPE_INTEGRATION: true,
  INVOICE_MANAGEMENT: true,
  USAGE_ANALYTICS: true,
  CUSTOMER_PORTAL: true,
  WEBHOOK_SUPPORT: true,
  MULTI_CURRENCY: false, // Future feature
  TAX_CALCULATION: false, // Future feature
  DUNNING_MANAGEMENT: false, // Future feature
} as const;

export const BILLING_CONFIG = {
  DEFAULT_CURRENCY: "USD",
  DEFAULT_BILLING_CYCLE: "monthly" as BillingCycle,
  TRIAL_PERIOD_DAYS: 14,
  USAGE_ALERT_THRESHOLDS: [50, 75, 90, 100],
  AUTO_REFRESH_INTERVAL: 60000, // 1 minute
  INVOICE_PAGINATION_SIZE: 20,
  NOTIFICATION_PAGINATION_SIZE: 50,
} as const;

// ============================================
// DOMAIN METADATA
// ============================================

export const BILLING_DOMAIN_INFO = {
  name: "Billing & Subscription Management",
  version: "1.0.0",
  description:
    "Complete billing and subscription management system with Stripe integration",
  features: [
    "Subscription Management (Create, Update, Cancel, Reactivate)",
    "Payment Processing (Cards, Bank Transfers)",
    "Invoice Management (View, Download, Track)",
    "Usage Analytics & Limits",
    "Real-time Notifications",
    "Customer Portal Integration",
    "Plan Comparison & Upgrades",
    "Billing History & Analytics",
  ],
  integrations: [
    "Stripe Payment Processing",
    "Redux Toolkit State Management",
    "WebSocket Real-time Updates",
    "REST API Integration",
  ],
  routes: ["/hotel-dashboard/billing", "/saas-dashboard/billing"],
  permissions: [
    "billing:read",
    "billing:write",
    "billing:admin",
    "subscriptions:manage",
    "payments:process",
    "invoices:download",
  ],
} as const;
