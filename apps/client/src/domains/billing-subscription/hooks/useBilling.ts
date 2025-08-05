/**
 * Billing & Subscription Management Domain - Custom Hooks
 * React hooks for easy integration with billing features
 */

import { useCallback, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { RootState } from "@/store";
import {
  // Async Thunks
  fetchSubscriptions,
  fetchSubscription,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  reactivateSubscription,
  fetchPricingConfig,
  fetchPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod,
  createPaymentIntent,
  confirmPayment,
  fetchInvoices,
  fetchInvoice,
  fetchUpcomingInvoice,
  downloadInvoice,
  fetchCurrentUsage,
  fetchUsageHistory,
  fetchBillingAnalytics,
  fetchNotifications,
  markNotificationAsRead,
  createCustomerPortalSession,

  // Actions
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
} from "../store/billingSlice";
import type {
  BillingFilters,
  BillingViewOptions,
  CancelSubscriptionPayload,
  CreatePaymentIntentPayload,
  CreateSubscriptionPayload,
  ProcessPaymentPayload,
  SubscriptionPlan,
  UpdateSubscriptionPayload,
} from "../types/billing.types";
import { BillingService } from "../services/billingService";

// ============================================
// MAIN BILLING HOOK
// ============================================

export const useBilling = () => {
  const dispatch = useAppDispatch();
  const billingState = useAppSelector((state: RootState) => state.billing);

  // Computed values
  const isLoading = useMemo(() => {
    return Object.values(billingState.loading).some((loading) => loading);
  }, [billingState.loading]);

  const hasActiveSubscription = useMemo(() => {
    return billingState.currentSubscription?.status === "active";
  }, [billingState.currentSubscription]);

  const isTrialing = useMemo(() => {
    return billingState.currentSubscription?.status === "trialing";
  }, [billingState.currentSubscription]);

  const unreadNotifications = useMemo(() => {
    return billingState.notifications.filter((n) => !n.read);
  }, [billingState.notifications]);

  // Actions
  const actions = useMemo(
    () => ({
      // Data fetching
      fetchSubscriptions: (tenantId?: string) =>
        dispatch(fetchSubscriptions(tenantId)),
      fetchPricingConfig: () => dispatch(fetchPricingConfig()),
      fetchPaymentMethods: (tenantId?: string) =>
        dispatch(fetchPaymentMethods(tenantId)),
      fetchInvoices: (params: {
        tenantId?: string;
        limit?: number;
        offset?: number;
      }) => dispatch(fetchInvoices(params)),
      fetchCurrentUsage: (tenantId: string) =>
        dispatch(fetchCurrentUsage(tenantId)),
      fetchNotifications: (params: { tenantId: string; limit?: number }) =>
        dispatch(fetchNotifications(params)),

      // UI actions
      setError: (error: any) => dispatch(setError(error)),
      clearError: () => dispatch(clearError()),
      setFilters: (filters: Partial<BillingFilters>) =>
        dispatch(setFilters(filters)),
      setViewOptions: (options: Partial<BillingViewOptions>) =>
        dispatch(setViewOptions(options)),
      clearData: () => dispatch(clearBillingData()),

      // Real-time updates
      addUpdate: (update: any) => dispatch(addBillingUpdate(update)),
    }),
    [dispatch],
  );

  return {
    ...billingState,
    isLoading,
    hasActiveSubscription,
    isTrialing,
    unreadNotifications,
    actions,
  };
};

// ============================================
// SUBSCRIPTION MANAGEMENT HOOK
// ============================================

export const useSubscriptionManagement = () => {
  const dispatch = useAppDispatch();
  const billingState = useAppSelector((state: RootState) => state.billing);

  const currentPlan = useMemo(() => {
    return billingState.currentSubscription?.plan || "trial";
  }, [billingState.currentSubscription]);

  const canUpgrade = useCallback(
    (targetPlan: SubscriptionPlan) => {
      return BillingService.isUpgrade(currentPlan, targetPlan);
    },
    [currentPlan],
  );

  const canDowngrade = useCallback(
    (targetPlan: SubscriptionPlan) => {
      return BillingService.isDowngrade(currentPlan, targetPlan);
    },
    [currentPlan],
  );

  const isTrialExpiring = useMemo(() => {
    if (!billingState.currentSubscription?.trialEnd) return false;
    return BillingService.isTrialExpiring(
      billingState.currentSubscription.trialEnd,
    );
  }, [billingState.currentSubscription]);

  const daysUntilTrialEnd = useMemo(() => {
    if (!billingState.currentSubscription?.trialEnd) return 0;
    return BillingService.getDaysUntilTrialEnd(
      billingState.currentSubscription.trialEnd,
    );
  }, [billingState.currentSubscription]);

  const actions = useMemo(
    () => ({
      createSubscription: (payload: CreateSubscriptionPayload) =>
        dispatch(createSubscription(payload)),
      updateSubscription: (payload: UpdateSubscriptionPayload) =>
        dispatch(updateSubscription(payload)),
      cancelSubscription: (payload: CancelSubscriptionPayload) =>
        dispatch(cancelSubscription(payload)),
      reactivateSubscription: (subscriptionId: string) =>
        dispatch(reactivateSubscription(subscriptionId)),
      setSelected: (subscriptionId: string | null) =>
        dispatch(setSelectedSubscription(subscriptionId)),
      setUpgrading: (upgrading: boolean) => dispatch(setUpgrading(upgrading)),
    }),
    [dispatch],
  );

  return {
    subscriptions: billingState.subscriptions,
    currentSubscription: billingState.currentSubscription,
    selectedSubscriptionId: billingState.selectedSubscriptionId,
    isUpgrading: billingState.isUpgrading,
    loading:
      billingState.loading.subscription || billingState.loading.subscriptions,
    error: billingState.error,

    // Computed values
    currentPlan,
    canUpgrade,
    canDowngrade,
    isTrialExpiring,
    daysUntilTrialEnd,

    // Actions
    actions,
  };
};

// ============================================
// PAYMENT MANAGEMENT HOOK
// ============================================

export const usePaymentManagement = () => {
  const dispatch = useAppDispatch();
  const billingState = useAppSelector((state: RootState) => state.billing);

  const defaultPaymentMethod = useMemo(() => {
    return billingState.paymentMethods.find((pm) => pm.isDefault);
  }, [billingState.paymentMethods]);

  const hasPaymentMethods = useMemo(() => {
    return billingState.paymentMethods.length > 0;
  }, [billingState.paymentMethods]);

  const actions = useMemo(
    () => ({
      fetchPaymentMethods: (tenantId?: string) =>
        dispatch(fetchPaymentMethods(tenantId)),
      addPaymentMethod: (paymentMethodData: any) =>
        dispatch(addPaymentMethod(paymentMethodData)),
      removePaymentMethod: (paymentMethodId: string) =>
        dispatch(removePaymentMethod(paymentMethodId)),
      setDefaultPaymentMethod: (paymentMethodId: string) =>
        dispatch(setDefaultPaymentMethod(paymentMethodId)),
      createPaymentIntent: (payload: CreatePaymentIntentPayload) =>
        dispatch(createPaymentIntent(payload)),
      confirmPayment: (payload: ProcessPaymentPayload) =>
        dispatch(confirmPayment(payload)),
      setSelectedPaymentMethod: (paymentMethodId: string | null) =>
        dispatch(setSelectedPaymentMethod(paymentMethodId)),
      setProcessingPayment: (processing: boolean) =>
        dispatch(setProcessingPayment(processing)),
    }),
    [dispatch],
  );

  return {
    paymentMethods: billingState.paymentMethods,
    paymentIntents: billingState.paymentIntents,
    selectedPaymentMethodId: billingState.selectedPaymentMethodId,
    isProcessingPayment: billingState.isProcessingPayment,
    loading:
      billingState.loading.paymentMethods || billingState.loading.payments,
    error: billingState.error,

    // Computed values
    defaultPaymentMethod,
    hasPaymentMethods,

    // Actions
    actions,
  };
};

// ============================================
// INVOICE MANAGEMENT HOOK
// ============================================

export const useInvoiceManagement = () => {
  const dispatch = useAppDispatch();
  const billingState = useAppSelector((state: RootState) => state.billing);

  const paidInvoices = useMemo(() => {
    return billingState.invoices.filter((invoice) => invoice.status === "paid");
  }, [billingState.invoices]);

  const unpaidInvoices = useMemo(() => {
    return billingState.invoices.filter(
      (invoice) =>
        invoice.status === "open" || invoice.status === "uncollectible",
    );
  }, [billingState.invoices]);

  const totalOutstanding = useMemo(() => {
    return unpaidInvoices.reduce(
      (total, invoice) => total + invoice.amountRemaining,
      0,
    );
  }, [unpaidInvoices]);

  const actions = useMemo(
    () => ({
      fetchInvoices: (params: {
        tenantId?: string;
        limit?: number;
        offset?: number;
      }) => dispatch(fetchInvoices(params)),
      fetchInvoice: (invoiceId: string) => dispatch(fetchInvoice(invoiceId)),
      fetchUpcomingInvoice: (tenantId: string) =>
        dispatch(fetchUpcomingInvoice(tenantId)),
      downloadInvoice: (invoiceId: string) =>
        dispatch(downloadInvoice(invoiceId)),
      setSelectedInvoice: (invoice: any) =>
        dispatch(setSelectedInvoice(invoice)),
    }),
    [dispatch],
  );

  return {
    invoices: billingState.invoices,
    selectedInvoice: billingState.selectedInvoice,
    upcomingInvoice: billingState.upcomingInvoice,
    pagination: billingState.pagination.invoices,
    loading: billingState.loading.invoices,
    error: billingState.error,

    // Computed values
    paidInvoices,
    unpaidInvoices,
    totalOutstanding,

    // Actions
    actions,
  };
};

// ============================================
// USAGE ANALYTICS HOOK
// ============================================

export const useUsageAnalytics = () => {
  const dispatch = useAppDispatch();
  const billingState = useAppSelector((state: RootState) => state.billing);

  const usageMetrics = useMemo(() => {
    if (!billingState.currentUsage) return null;

    const usage = billingState.currentUsage.usage;
    return {
      voiceCalls: {
        ...usage.voiceCalls,
        isNearLimit: BillingService.isNearLimit(
          billingState.currentUsage,
          "voiceCalls",
        ),
        isOverLimit: BillingService.isOverLimit(
          billingState.currentUsage,
          "voiceCalls",
        ),
      },
      apiRequests: {
        ...usage.apiRequests,
        isNearLimit: BillingService.isNearLimit(
          billingState.currentUsage,
          "apiRequests",
        ),
        isOverLimit: BillingService.isOverLimit(
          billingState.currentUsage,
          "apiRequests",
        ),
      },
      storage: {
        ...usage.storage,
        isNearLimit: BillingService.isNearLimit(
          billingState.currentUsage,
          "storage",
        ),
        isOverLimit: BillingService.isOverLimit(
          billingState.currentUsage,
          "storage",
        ),
      },
      staffUsers: {
        ...usage.staffUsers,
        isNearLimit: BillingService.isNearLimit(
          billingState.currentUsage,
          "staffUsers",
        ),
        isOverLimit: BillingService.isOverLimit(
          billingState.currentUsage,
          "staffUsers",
        ),
      },
      hotelLocations: {
        ...usage.hotelLocations,
        isNearLimit: BillingService.isNearLimit(
          billingState.currentUsage,
          "hotelLocations",
        ),
        isOverLimit: BillingService.isOverLimit(
          billingState.currentUsage,
          "hotelLocations",
        ),
      },
    };
  }, [billingState.currentUsage]);

  const hasOverages = useMemo(() => {
    if (!billingState.currentUsage) return false;
    return billingState.currentUsage.totalOverage > 0;
  }, [billingState.currentUsage]);

  const actions = useMemo(
    () => ({
      fetchCurrentUsage: (tenantId: string) =>
        dispatch(fetchCurrentUsage(tenantId)),
      fetchUsageHistory: (params: {
        tenantId: string;
        startDate: Date;
        endDate: Date;
      }) => dispatch(fetchUsageHistory(params)),
      fetchBillingAnalytics: (params: {
        tenantId: string;
        startDate: Date;
        endDate: Date;
      }) => dispatch(fetchBillingAnalytics(params)),
    }),
    [dispatch],
  );

  return {
    currentUsage: billingState.currentUsage,
    usageHistory: billingState.usageHistory,
    billingAnalytics: billingState.billingAnalytics,
    loading: billingState.loading.usage || billingState.loading.analytics,
    error: billingState.error,

    // Computed values
    usageMetrics,
    hasOverages,

    // Actions
    actions,
  };
};

// ============================================
// PRICING & PLANS HOOK
// ============================================

export const usePricingPlans = () => {
  const dispatch = useAppDispatch();
  const billingState = useAppSelector((state: RootState) => state.billing);

  const plansByType = useMemo(() => {
    return billingState.pricingConfig.reduce(
      (acc, config) => {
        if (!acc[config.plan]) {
          acc[config.plan] = [];
        }
        acc[config.plan].push(config);
        return acc;
      },
      {} as Record<string, any[]>,
    );
  }, [billingState.pricingConfig]);

  const recommendedPlan = useMemo(() => {
    return billingState.pricingConfig.find((config) => config.popular);
  }, [billingState.pricingConfig]);

  const formatPrice = useCallback((amount: number, currency = "USD") => {
    return BillingService.formatCurrency(amount, currency);
  }, []);

  const actions = useMemo(
    () => ({
      fetchPricingConfig: () => dispatch(fetchPricingConfig()),
    }),
    [dispatch],
  );

  return {
    pricingConfig: billingState.pricingConfig,
    loading: billingState.loading.pricing,
    error: billingState.error,

    // Computed values
    plansByType,
    recommendedPlan,

    // Utilities
    formatPrice,

    // Actions
    actions,
  };
};

// ============================================
// BILLING NOTIFICATIONS HOOK
// ============================================

export const useBillingNotifications = () => {
  const dispatch = useAppDispatch();
  const billingState = useAppSelector((state: RootState) => state.billing);

  const notificationsByType = useMemo(() => {
    return billingState.notifications.reduce(
      (acc, notification) => {
        if (!acc[notification.type]) {
          acc[notification.type] = [];
        }
        acc[notification.type].push(notification);
        return acc;
      },
      {} as Record<string, any[]>,
    );
  }, [billingState.notifications]);

  const unreadCount = useMemo(() => {
    return billingState.notifications.filter((n) => !n.read).length;
  }, [billingState.notifications]);

  const criticalNotifications = useMemo(() => {
    return billingState.notifications.filter(
      (n) => n.severity === "error" && !n.read,
    );
  }, [billingState.notifications]);

  const actions = useMemo(
    () => ({
      fetchNotifications: (params: { tenantId: string; limit?: number }) =>
        dispatch(fetchNotifications(params)),
      markAsRead: (notificationId: string) =>
        dispatch(markNotificationAsRead(notificationId)),
    }),
    [dispatch],
  );

  return {
    notifications: billingState.notifications,
    loading: billingState.loading.notifications,
    error: billingState.error,

    // Computed values
    notificationsByType,
    unreadCount,
    criticalNotifications,

    // Actions
    actions,
  };
};

// ============================================
// CUSTOMER PORTAL HOOK
// ============================================

export const useCustomerPortal = () => {
  const dispatch = useAppDispatch();
  const billingState = useAppSelector((state: RootState) => state.billing);

  const openPortal = useCallback(
    (tenantId: string, returnUrl?: string) => {
      return dispatch(createCustomerPortalSession({ tenantId, returnUrl }));
    },
    [dispatch],
  );

  return {
    loading: billingState.loading.customerPortal,
    error: billingState.error,
    openPortal,
  };
};

// ============================================
// AUTO REFRESH HOOK
// ============================================

export const useBillingAutoRefresh = (tenantId: string, intervalMs = 60000) => {
  const { actions } = useBilling();

  useEffect(() => {
    if (!tenantId) return;

    // Initial fetch
    actions.fetchSubscriptions(tenantId);
    actions.fetchCurrentUsage(tenantId);
    actions.fetchNotifications({ tenantId, limit: 20 });

    // Set up auto refresh
    const interval = setInterval(() => {
      actions.fetchCurrentUsage(tenantId);
      actions.fetchNotifications({ tenantId, limit: 20 });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [tenantId, intervalMs, actions]);
};
