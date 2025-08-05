/**
 * Billing & Subscription Management Domain - Service Layer
 * API integration for billing, subscriptions, payments, and invoices
 */

import { logger } from "@shared/utils/logger";
import type {
  BillingAnalytics,
  BillingUsage,
  CancelSubscriptionPayload,
  CreatePaymentIntentPayload,
  CreateSubscriptionPayload,
  Invoice,
  PaymentIntent,
  PaymentMethod,
  ProcessPaymentPayload,
  PricingConfig,
  SubscriptionDetails,
  UpdateSubscriptionPayload,
  BillingNotification,
  UsageRecord,
} from "../types/billing.types";

// ============================================
// API ENDPOINTS CONFIGURATION
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const BILLING_ENDPOINTS = {
  // Subscription Management
  subscriptions: "/api/billing/subscriptions",
  subscription: (id: string) => `/api/billing/subscriptions/${id}`,
  createSubscription: "/api/billing/subscriptions/create",
  updateSubscription: (id: string) => `/api/billing/subscriptions/${id}/update`,
  cancelSubscription: (id: string) => `/api/billing/subscriptions/${id}/cancel`,
  reactivateSubscription: (id: string) =>
    `/api/billing/subscriptions/${id}/reactivate`,

  // Pricing & Plans
  pricing: "/api/billing/pricing",
  plans: "/api/billing/plans",
  planFeatures: (plan: string) => `/api/billing/plans/${plan}/features`,

  // Payment Management
  paymentMethods: "/api/billing/payment-methods",
  paymentMethod: (id: string) => `/api/billing/payment-methods/${id}`,
  defaultPaymentMethod: "/api/billing/payment-methods/default",
  createPaymentIntent: "/api/billing/payment-intents",
  confirmPayment: "/api/billing/payments/confirm",

  // Invoice Management
  invoices: "/api/billing/invoices",
  invoice: (id: string) => `/api/billing/invoices/${id}`,
  upcomingInvoice: "/api/billing/invoices/upcoming",
  downloadInvoice: (id: string) => `/api/billing/invoices/${id}/download`,

  // Usage & Analytics
  usage: "/api/billing/usage",
  usageHistory: "/api/billing/usage/history",
  analytics: "/api/billing/analytics",
  usageAlerts: "/api/billing/usage/alerts",

  // Notifications
  notifications: "/api/billing/notifications",
  markNotificationRead: (id: string) => `/api/billing/notifications/${id}/read`,

  // Webhooks (for Stripe events)
  webhooks: "/api/billing/webhooks",

  // Customer Portal
  customerPortal: "/api/billing/customer-portal",
} as const;

// ============================================
// HTTP CLIENT CONFIGURATION
// ============================================

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: any;
  signal?: AbortSignal;
}

class BillingApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { method = "GET", headers = {}, body, signal } = options;

    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add auth token from localStorage
    const token = localStorage.getItem("authToken");
    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method,
      headers: { ...defaultHeaders, ...headers },
      signal,
    };

    if (body && method !== "GET") {
      config.body = JSON.stringify(body);
    }

    try {
      logger.debug(`[BillingService] ${method} ${endpoint}`, "BillingService");

      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      const data = await response.json();

      logger.debug(
        `[BillingService] ${method} ${endpoint} success`,
        "BillingService",
      );

      return data;
    } catch (error) {
      logger.error(
        `[BillingService] ${method} ${endpoint} failed`,
        "BillingService",
        error,
      );
      throw error;
    }
  }

  // ============================================
  // SUBSCRIPTION METHODS
  // ============================================

  async getSubscriptions(tenantId?: string): Promise<SubscriptionDetails[]> {
    const params = tenantId ? `?tenantId=${tenantId}` : "";
    return this.request<SubscriptionDetails[]>(
      `${BILLING_ENDPOINTS.subscriptions}${params}`,
    );
  }

  async getSubscription(subscriptionId: string): Promise<SubscriptionDetails> {
    return this.request<SubscriptionDetails>(
      BILLING_ENDPOINTS.subscription(subscriptionId),
    );
  }

  async createSubscription(
    payload: CreateSubscriptionPayload,
  ): Promise<SubscriptionDetails> {
    return this.request<SubscriptionDetails>(
      BILLING_ENDPOINTS.createSubscription,
      {
        method: "POST",
        body: payload,
      },
    );
  }

  async updateSubscription(
    payload: UpdateSubscriptionPayload,
  ): Promise<SubscriptionDetails> {
    return this.request<SubscriptionDetails>(
      BILLING_ENDPOINTS.updateSubscription(payload.subscriptionId),
      {
        method: "PUT",
        body: payload,
      },
    );
  }

  async cancelSubscription(
    payload: CancelSubscriptionPayload,
  ): Promise<SubscriptionDetails> {
    return this.request<SubscriptionDetails>(
      BILLING_ENDPOINTS.cancelSubscription(payload.subscriptionId),
      {
        method: "POST",
        body: payload,
      },
    );
  }

  async reactivateSubscription(
    subscriptionId: string,
  ): Promise<SubscriptionDetails> {
    return this.request<SubscriptionDetails>(
      BILLING_ENDPOINTS.reactivateSubscription(subscriptionId),
      {
        method: "POST",
      },
    );
  }

  // ============================================
  // PRICING & PLANS METHODS
  // ============================================

  async getPricingConfig(): Promise<PricingConfig[]> {
    return this.request<PricingConfig[]>(BILLING_ENDPOINTS.pricing);
  }

  async getPlans(): Promise<PricingConfig[]> {
    return this.request<PricingConfig[]>(BILLING_ENDPOINTS.plans);
  }

  async getPlanFeatures(plan: string): Promise<any> {
    return this.request<any>(BILLING_ENDPOINTS.planFeatures(plan));
  }

  // ============================================
  // PAYMENT METHODS
  // ============================================

  async getPaymentMethods(tenantId?: string): Promise<PaymentMethod[]> {
    const params = tenantId ? `?tenantId=${tenantId}` : "";
    return this.request<PaymentMethod[]>(
      `${BILLING_ENDPOINTS.paymentMethods}${params}`,
    );
  }

  async addPaymentMethod(paymentMethodData: any): Promise<PaymentMethod> {
    return this.request<PaymentMethod>(BILLING_ENDPOINTS.paymentMethods, {
      method: "POST",
      body: paymentMethodData,
    });
  }

  async removePaymentMethod(paymentMethodId: string): Promise<void> {
    return this.request<void>(
      BILLING_ENDPOINTS.paymentMethod(paymentMethodId),
      {
        method: "DELETE",
      },
    );
  }

  async setDefaultPaymentMethod(
    paymentMethodId: string,
  ): Promise<PaymentMethod> {
    return this.request<PaymentMethod>(BILLING_ENDPOINTS.defaultPaymentMethod, {
      method: "POST",
      body: { paymentMethodId },
    });
  }

  // ============================================
  // PAYMENT PROCESSING
  // ============================================

  async createPaymentIntent(
    payload: CreatePaymentIntentPayload,
  ): Promise<PaymentIntent> {
    return this.request<PaymentIntent>(BILLING_ENDPOINTS.createPaymentIntent, {
      method: "POST",
      body: payload,
    });
  }

  async confirmPayment(payload: ProcessPaymentPayload): Promise<PaymentIntent> {
    return this.request<PaymentIntent>(BILLING_ENDPOINTS.confirmPayment, {
      method: "POST",
      body: payload,
    });
  }

  // ============================================
  // INVOICE METHODS
  // ============================================

  async getInvoices(
    tenantId?: string,
    limit = 20,
    offset = 0,
  ): Promise<{
    invoices: Invoice[];
    total: number;
    hasMore: boolean;
  }> {
    const params = new URLSearchParams();
    if (tenantId) params.append("tenantId", tenantId);
    params.append("limit", limit.toString());
    params.append("offset", offset.toString());

    return this.request<{
      invoices: Invoice[];
      total: number;
      hasMore: boolean;
    }>(`${BILLING_ENDPOINTS.invoices}?${params}`);
  }

  async getInvoice(invoiceId: string): Promise<Invoice> {
    return this.request<Invoice>(BILLING_ENDPOINTS.invoice(invoiceId));
  }

  async getUpcomingInvoice(tenantId: string): Promise<Invoice> {
    return this.request<Invoice>(
      `${BILLING_ENDPOINTS.upcomingInvoice}?tenantId=${tenantId}`,
    );
  }

  async downloadInvoice(invoiceId: string): Promise<Blob> {
    const response = await fetch(
      `${API_BASE_URL}${BILLING_ENDPOINTS.downloadInvoice(invoiceId)}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to download invoice");
    }

    return response.blob();
  }

  // ============================================
  // USAGE & ANALYTICS METHODS
  // ============================================

  async getCurrentUsage(tenantId: string): Promise<BillingUsage> {
    return this.request<BillingUsage>(
      `${BILLING_ENDPOINTS.usage}?tenantId=${tenantId}`,
    );
  }

  async getUsageHistory(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<UsageRecord[]> {
    const params = new URLSearchParams({
      tenantId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    return this.request<UsageRecord[]>(
      `${BILLING_ENDPOINTS.usageHistory}?${params}`,
    );
  }

  async getBillingAnalytics(
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<BillingAnalytics> {
    const params = new URLSearchParams({
      tenantId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    return this.request<BillingAnalytics>(
      `${BILLING_ENDPOINTS.analytics}?${params}`,
    );
  }

  async setupUsageAlerts(tenantId: string, alerts: any[]): Promise<void> {
    return this.request<void>(BILLING_ENDPOINTS.usageAlerts, {
      method: "POST",
      body: { tenantId, alerts },
    });
  }

  // ============================================
  // NOTIFICATIONS METHODS
  // ============================================

  async getNotifications(
    tenantId: string,
    limit = 50,
  ): Promise<BillingNotification[]> {
    return this.request<BillingNotification[]>(
      `${BILLING_ENDPOINTS.notifications}?tenantId=${tenantId}&limit=${limit}`,
    );
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    return this.request<void>(
      BILLING_ENDPOINTS.markNotificationRead(notificationId),
      {
        method: "POST",
      },
    );
  }

  async markAllNotificationsAsRead(tenantId: string): Promise<void> {
    return this.request<void>(BILLING_ENDPOINTS.notifications, {
      method: "PATCH",
      body: { tenantId, markAllAsRead: true },
    });
  }

  // ============================================
  // CUSTOMER PORTAL METHODS
  // ============================================

  async createCustomerPortalSession(
    tenantId: string,
    returnUrl?: string,
  ): Promise<{ url: string }> {
    return this.request<{ url: string }>(BILLING_ENDPOINTS.customerPortal, {
      method: "POST",
      body: { tenantId, returnUrl },
    });
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  async getServiceHealth(): Promise<{ status: string; timestamp: Date }> {
    return this.request<{ status: string; timestamp: Date }>(
      "/api/billing/health",
    );
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const billingService = new BillingApiClient();

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

export const BillingService = {
  // Subscription shortcuts
  getCurrentSubscription: async (tenantId: string) => {
    const subscriptions = await billingService.getSubscriptions(tenantId);
    return subscriptions.find(
      (sub) => sub.status === "active" || sub.status === "trialing",
    );
  },

  // Usage shortcuts
  isOverLimit: (
    usage: BillingUsage,
    metricName: keyof BillingUsage["usage"],
  ) => {
    const metric = usage.usage[metricName];
    if ("percentage" in metric) {
      return metric.percentage >= 100;
    }
    return false;
  },

  isNearLimit: (
    usage: BillingUsage,
    metricName: keyof BillingUsage["usage"],
    threshold = 80,
  ) => {
    const metric = usage.usage[metricName];
    if ("percentage" in metric) {
      return metric.percentage >= threshold;
    }
    return false;
  },

  // Plan comparison utilities
  isUpgrade: (currentPlan: string, targetPlan: string) => {
    const planHierarchy = ["trial", "basic", "premium", "enterprise"];
    return (
      planHierarchy.indexOf(targetPlan) > planHierarchy.indexOf(currentPlan)
    );
  },

  isDowngrade: (currentPlan: string, targetPlan: string) => {
    const planHierarchy = ["trial", "basic", "premium", "enterprise"];
    return (
      planHierarchy.indexOf(targetPlan) < planHierarchy.indexOf(currentPlan)
    );
  },

  // Formatting utilities
  formatCurrency: (amount: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Stripe amounts are in cents
  },

  formatUsagePercentage: (used: number, limit: number) => {
    if (limit === -1) return "Unlimited";
    if (limit === 0) return "0%";
    return `${Math.round((used / limit) * 100)}%`;
  },

  // Date utilities
  isTrialExpiring: (trialEnd?: Date, daysThreshold = 7) => {
    if (!trialEnd) return false;
    const now = new Date();
    const daysRemaining = Math.ceil(
      (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysRemaining <= daysThreshold && daysRemaining > 0;
  },

  getDaysUntilTrialEnd: (trialEnd?: Date) => {
    if (!trialEnd) return 0;
    const now = new Date();
    return Math.ceil(
      (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
  },
};

export default billingService;
