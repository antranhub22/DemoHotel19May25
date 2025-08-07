/**
 * Billing & Subscription Management Domain - Redux Slice
 * Centralized state management for billing, subscriptions, payments, and invoices
 */

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import logger from "@shared/utils/logger";
import { billingService } from "../services/billingService";
import type {
  BillingAnalytics,
  BillingError,
  BillingFilters,
  BillingNotification,
  BillingUsage,
  BillingViewOptions,
  CancelSubscriptionPayload,
  CreatePaymentIntentPayload,
  CreateSubscriptionPayload,
  Invoice,
  PaymentIntent,
  PaymentMethod,
  PricingConfig,
  ProcessPaymentPayload,
  SubscriptionDetails,
  UpdateSubscriptionPayload,
  UsageRecord,
} from "../types/billing.types";

// ============================================
// ASYNC THUNKS
// ============================================

// Subscription Management
export const fetchSubscriptions = createAsyncThunk(
  "billing/fetchSubscriptions",
  async (tenantId?: string, { rejectWithValue }: any) => {
    try {
      return await billingService.getSubscriptions(tenantId);
    } catch (error: any) {
      logger.error(
        "[BillingSlice] Failed to fetch subscriptions",
        "BillingSlice",
        error,
      );
      return rejectWithValue({ message: error.message, type: "network" });
    }
  },
);

export const fetchSubscription = createAsyncThunk(
  "billing/fetchSubscription",
  async (subscriptionId: string, { rejectWithValue }: any) => {
    try {
      return await billingService.getSubscription(subscriptionId);
    } catch (error: any) {
      logger.error(
        "[BillingSlice] Failed to fetch subscription",
        "BillingSlice",
        error,
      );
      return rejectWithValue({ message: error.message, type: "network" });
    }
  },
);

export const createSubscription = createAsyncThunk(
  "billing/createSubscription",
  async (payload: CreateSubscriptionPayload, { rejectWithValue }: any) => {
    try {
      return await billingService.createSubscription(payload);
    } catch (error: any) {
      logger.error(
        "[BillingSlice] Failed to create subscription",
        "BillingSlice",
        error,
      );
      return rejectWithValue({ message: error.message, type: "subscription" });
    }
  },
);

export const updateSubscription = createAsyncThunk(
  "billing/updateSubscription",
  async (payload: UpdateSubscriptionPayload, { rejectWithValue }: any) => {
    try {
      return await billingService.updateSubscription(payload);
    } catch (error: any) {
      logger.error(
        "[BillingSlice] Failed to update subscription",
        "BillingSlice",
        error,
      );
      return rejectWithValue({ message: error.message, type: "subscription" });
    }
  },
);

export const cancelSubscription = createAsyncThunk(
  "billing/cancelSubscription",
  async (payload: CancelSubscriptionPayload, { rejectWithValue }: any) => {
    try {
      return await billingService.cancelSubscription(payload);
    } catch (error: any) {
      logger.error(
        "[BillingSlice] Failed to cancel subscription",
        "BillingSlice",
        error,
      );
      return rejectWithValue({ message: error.message, type: "subscription" });
    }
  },
);

export const reactivateSubscription = createAsyncThunk(
  "billing/reactivateSubscription",
  async (subscriptionId: string, { rejectWithValue }: any) => {
    try {
      return await billingService.reactivateSubscription(subscriptionId);
    } catch (error: any) {
      logger.error(
        "[BillingSlice] Failed to reactivate subscription",
        "BillingSlice",
        error,
      );
      return rejectWithValue({ message: error.message, type: "subscription" });
    }
  },
);

// Pricing & Plans
export const fetchPricingConfig = createAsyncThunk(
  "billing/fetchPricingConfig",
  async (_, { rejectWithValue }: any) => {
    try {
      return await billingService.getPricingConfig();
    } catch (error: any) {
      logger.error(
        "[BillingSlice] Failed to fetch pricing config",
        "BillingSlice",
        error,
      );
      return rejectWithValue({ message: error.message, type: "network" });
    }
  },
);

// Payment Methods
export const fetchPaymentMethods = createAsyncThunk(
  "billing/fetchPaymentMethods",
  async (tenantId?: string, { rejectWithValue }: any) => {
    try {
      return await billingService.getPaymentMethods(tenantId);
    } catch (error: any) {
      logger.error(
        "[BillingSlice] Failed to fetch payment methods",
        "BillingSlice",
        error,
      );
      return rejectWithValue({ message: error.message, type: "network" });
    }
  },
);

export const addPaymentMethod = createAsyncThunk(
  "billing/addPaymentMethod",
  async (paymentMethodData: any, { rejectWithValue }: any) => {
    try {
      return await billingService.addPaymentMethod(paymentMethodData);
    } catch (error: any) {
      logger.error(
        "[BillingSlice] Failed to add payment method",
        "BillingSlice",
        error,
      );
      return rejectWithValue({ message: error.message, type: "payment" });
    }
  },
);

export const removePaymentMethod = createAsyncThunk(
  "billing/removePaymentMethod",
  async (paymentMethodId: string, { rejectWithValue }: any) => {
    try {
      await billingService.removePaymentMethod(paymentMethodId);
      return paymentMethodId;
    } catch (error: any) {
      logger.error(
        "[BillingSlice] Failed to remove payment method",
        "BillingSlice",
        error,
      );
      return rejectWithValue({ message: error.message, type: "payment" });
    }
  },
);

export const setDefaultPaymentMethod = createAsyncThunk(
  "billing/setDefaultPaymentMethod",
  async (paymentMethodId: string, { rejectWithValue }: any) => {
    try {
      return await billingService.setDefaultPaymentMethod(paymentMethodId);
    } catch (error: any) {
      logger.error(
        "[BillingSlice] Failed to set default payment method",
        "BillingSlice",
        error,
      );
      return rejectWithValue({ message: error.message, type: "payment" });
    }
  },
);

// Payment Processing
export const createPaymentIntent = createAsyncThunk(
  "billing/createPaymentIntent",
  async (payload: CreatePaymentIntentPayload, { rejectWithValue }: any) => {
    try {
      return await billingService.createPaymentIntent(payload);
    } catch (error: any) {
      logger.error(
        "[BillingSlice] Failed to create payment intent",
        "BillingSlice",
        error,
      );
      return rejectWithValue({ message: error.message, type: "payment" });
    }
  },
);

export const confirmPayment = createAsyncThunk(
  "billing/confirmPayment",
  async (payload: ProcessPaymentPayload, { rejectWithValue }: any) => {
    try {
      return await billingService.confirmPayment(payload);
    } catch (error: any) {
      logger.error(
        "[BillingSlice] Failed to confirm payment",
        "BillingSlice",
        error,
      );
      return rejectWithValue({ message: error.message, type: "payment" });
    }
  },
);

// Invoice Management
export const fetchInvoices = createAsyncThunk(
  "billing/fetchInvoices",
  async (
    {
      tenantId,
      limit = 20,
      offset = 0,
    }: {
      tenantId?: string;
      limit?: number;
      offset?: number;
    },
    { rejectWithValue }: any,
  ) => {
    try {
      return await billingService.getInvoices(tenantId, limit, offset);
    } catch (error: any) {
      logger.error(
        "[BillingSlice] Failed to fetch invoices",
        "BillingSlice",
        error,
      );
      return rejectWithValue({ message: error.message, type: "network" });
    }
  },
);

export const fetchInvoice = createAsyncThunk(
  "billing/fetchInvoice",
  async (invoiceId: string, { rejectWithValue }: any) => {
    try {
      return await billingService.getInvoice(invoiceId);
    } catch (error: any) {
      logger.error(
        "[BillingSlice] Failed to fetch invoice",
        "BillingSlice",
        error,
      );
      return rejectWithValue({ message: error.message, type: "network" });
    }
  },
);

export const fetchUpcomingInvoice = createAsyncThunk(
  "billing/fetchUpcomingInvoice",
  async (tenantId: string, { rejectWithValue }: any) => {
    try {
      return await billingService.getUpcomingInvoice(tenantId);
    } catch (error: any) {
      logger.error(
        "[BillingSlice] Failed to fetch upcoming invoice",
        "BillingSlice",
        error,
      );
      return rejectWithValue({ message: error.message, type: "network" });
    }
  },
);

export const downloadInvoice = createAsyncThunk(
  "billing/downloadInvoice",
  async (invoiceId: string, { rejectWithValue }: any) => {
    try {
      const blob = await billingService.downloadInvoice(invoiceId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${invoiceId}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      return invoiceId;
    } catch (error: any) {
      logger.error(
        "[BillingSlice] Failed to download invoice",
        "BillingSlice",
        error,
      );
      return rejectWithValue({ message: error.message, type: "network" });
    }
  },
);

// Usage & Analytics
export const fetchCurrentUsage = createAsyncThunk(
  "billing/fetchCurrentUsage",
  async (tenantId: string, { rejectWithValue }: any) => {
    try {
      return await billingService.getCurrentUsage(tenantId);
    } catch (error: any) {
      logger.error(
        "[BillingSlice] Failed to fetch current usage",
        "BillingSlice",
        error,
      );
      return rejectWithValue({ message: error.message, type: "network" });
    }
  },
);

export const fetchUsageHistory = createAsyncThunk(
  "billing/fetchUsageHistory",
  async (
    {
      tenantId,
      startDate,
      endDate,
    }: {
      tenantId: string;
      startDate: Date;
      endDate: Date;
    },
    { rejectWithValue }: any,
  ) => {
    try {
      return await billingService.getUsageHistory(tenantId, startDate, endDate);
    } catch (error: any) {
      logger.error(
        "[BillingSlice] Failed to fetch usage history",
        "BillingSlice",
        error,
      );
      return rejectWithValue({ message: error.message, type: "network" });
    }
  },
);

export const fetchBillingAnalytics = createAsyncThunk(
  "billing/fetchBillingAnalytics",
  async (
    {
      tenantId,
      startDate,
      endDate,
    }: {
      tenantId: string;
      startDate: Date;
      endDate: Date;
    },
    { rejectWithValue }: any,
  ) => {
    try {
      return await billingService.getBillingAnalytics(
        tenantId,
        startDate,
        endDate,
      );
    } catch (error: any) {
      logger.error(
        "[BillingSlice] Failed to fetch billing analytics",
        "BillingSlice",
        error,
      );
      return rejectWithValue({ message: error.message, type: "network" });
    }
  },
);

// Notifications
export const fetchNotifications = createAsyncThunk(
  "billing/fetchNotifications",
  async (
    { tenantId, limit = 50 }: { tenantId: string; limit?: number },
    { rejectWithValue }: any,
  ) => {
    try {
      return await billingService.getNotifications(tenantId, limit);
    } catch (error: any) {
      logger.error(
        "[BillingSlice] Failed to fetch notifications",
        "BillingSlice",
        error,
      );
      return rejectWithValue({ message: error.message, type: "network" });
    }
  },
);

export const markNotificationAsRead = createAsyncThunk(
  "billing/markNotificationAsRead",
  async (notificationId: string, { rejectWithValue }: any) => {
    try {
      await billingService.markNotificationAsRead(notificationId);
      return notificationId;
    } catch (error: any) {
      logger.error(
        "[BillingSlice] Failed to mark notification as read",
        "BillingSlice",
        error,
      );
      return rejectWithValue({ message: error.message, type: "network" });
    }
  },
);

// Customer Portal
export const createCustomerPortalSession = createAsyncThunk(
  "billing/createCustomerPortalSession",
  async (
    { tenantId, returnUrl }: { tenantId: string; returnUrl?: string },
    { rejectWithValue },
  ) => {
    try {
      const session = await billingService.createCustomerPortalSession(
        tenantId,
        returnUrl,
      );
      window.open(session.url, "_blank");
      return session;
    } catch (error: any) {
      logger.error(
        "[BillingSlice] Failed to create customer portal session",
        "BillingSlice",
        error,
      );
      return rejectWithValue({ message: error.message, type: "network" });
    }
  },
);

// ============================================
// STATE INTERFACE
// ============================================

interface BillingState {
  // Data
  subscriptions: SubscriptionDetails[];
  currentSubscription: SubscriptionDetails | null;
  pricingConfig: PricingConfig[];
  paymentMethods: PaymentMethod[];
  paymentIntents: PaymentIntent[];
  invoices: Invoice[];
  selectedInvoice: Invoice | null;
  upcomingInvoice: Invoice | null;
  currentUsage: BillingUsage | null;
  usageHistory: UsageRecord[];
  billingAnalytics: BillingAnalytics | null;
  notifications: BillingNotification[];

  // UI State
  loading: {
    subscriptions: boolean;
    subscription: boolean;
    pricing: boolean;
    paymentMethods: boolean;
    payments: boolean;
    invoices: boolean;
    usage: boolean;
    analytics: boolean;
    notifications: boolean;
    customerPortal: boolean;
  };

  error: BillingError | null;

  // Filters & View Options
  filters: BillingFilters;
  viewOptions: BillingViewOptions;

  // Real-time Updates
  lastUpdate: Date | null;

  // Temporary state for forms/modals
  selectedSubscriptionId: string | null;
  selectedPaymentMethodId: string | null;
  isUpgrading: boolean;
  isProcessingPayment: boolean;

  // Pagination
  pagination: {
    invoices: {
      total: number;
      hasMore: boolean;
      currentPage: number;
    };
  };
}

// ============================================
// INITIAL STATE
// ============================================

const initialState: BillingState = {
  // Data
  subscriptions: [],
  currentSubscription: null,
  pricingConfig: [],
  paymentMethods: [],
  paymentIntents: [],
  invoices: [],
  selectedInvoice: null,
  upcomingInvoice: null,
  currentUsage: null,
  usageHistory: [],
  billingAnalytics: null,
  notifications: [],

  // UI State
  loading: {
    subscriptions: false,
    subscription: false,
    pricing: false,
    paymentMethods: false,
    payments: false,
    invoices: false,
    usage: false,
    analytics: false,
    notifications: false,
    customerPortal: false,
  },

  error: null,

  // Filters & View Options
  filters: {
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      end: new Date(),
    },
  },

  viewOptions: {
    viewType: "overview",
    sortBy: "created",
    sortOrder: "desc",
    itemsPerPage: 20,
    currentPage: 1,
  },

  // Real-time Updates
  lastUpdate: null,

  // Temporary state
  selectedSubscriptionId: null,
  selectedPaymentMethodId: null,
  isUpgrading: false,
  isProcessingPayment: false,

  // Pagination
  pagination: {
    invoices: {
      total: 0,
      hasMore: false,
      currentPage: 1,
    },
  },
};

// ============================================
// BILLING SLICE
// ============================================

const billingSlice = createSlice({
  name: "billing",
  initialState,
  reducers: {
    // UI Actions
    setError: (state, action: PayloadAction<BillingError | null>) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    setFilters: (state, action: PayloadAction<Partial<BillingFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    setViewOptions: (
      state,
      action: PayloadAction<Partial<BillingViewOptions>>,
    ) => {
      state.viewOptions = { ...state.viewOptions, ...action.payload };
    },

    setSelectedSubscription: (state, action: PayloadAction<string | null>) => {
      state.selectedSubscriptionId = action.payload;
    },

    setSelectedPaymentMethod: (state, action: PayloadAction<string | null>) => {
      state.selectedPaymentMethodId = action.payload;
    },

    setSelectedInvoice: (state, action: PayloadAction<Invoice | null>) => {
      state.selectedInvoice = action.payload;
    },

    setUpgrading: (state, action: PayloadAction<boolean>) => {
      state.isUpgrading = action.payload;
    },

    setProcessingPayment: (state, action: PayloadAction<boolean>) => {
      state.isProcessingPayment = action.payload;
    },

    // Real-time Updates
    addBillingUpdate: (state, action: PayloadAction<any>) => {
      state.lastUpdate = new Date();
      // Handle real-time updates from WebSocket
      const { type, data } = action.payload;

      switch (type) {
        case "subscription_updated":
          const subIndex = state.subscriptions.findIndex(
            (sub) => sub.id === data.id,
          );
          if (subIndex !== -1) {
            state.subscriptions[subIndex] = data;
            if (state.currentSubscription?.id === data.id) {
              state.currentSubscription = data;
            }
          }
          break;

        case "invoice_created":
          state.invoices.unshift(data);
          state.pagination.invoices.total += 1;
          break;

        case "payment_succeeded":
          const paymentIntent = state.paymentIntents.find(
            (pi) => pi.id === data.id,
          );
          if (paymentIntent) {
            paymentIntent.status = "succeeded";
          }
          break;

        case "usage_updated":
          if (
            state.currentUsage &&
            state.currentUsage.tenantId === data.tenantId
          ) {
            state.currentUsage = data;
          }
          break;

        case "notification_created":
          state.notifications.unshift(data);
          break;
      }
    },

    // Clear data
    clearBillingData: (state) => {
      return { ...initialState };
    },
  },

  extraReducers: (builder) => {
    // Subscription Management
    builder
      .addCase(fetchSubscriptions.pending, (state) => {
        state.loading.subscriptions = true;
        state.error = null;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.loading.subscriptions = false;
        state.subscriptions = action.payload;
        // Set current subscription (active or trialing)
        state.currentSubscription =
          action.payload.find(
            (sub) => sub.status === "active" || sub.status === "trialing",
          ) || null;
        state.lastUpdate = new Date();
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.loading.subscriptions = false;
        state.error = action.payload as BillingError;
      })

      .addCase(createSubscription.pending, (state) => {
        state.loading.subscription = true;
        state.isUpgrading = true;
        state.error = null;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.loading.subscription = false;
        state.isUpgrading = false;
        state.subscriptions.push(action.payload);
        state.currentSubscription = action.payload;
        state.lastUpdate = new Date();
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.loading.subscription = false;
        state.isUpgrading = false;
        state.error = action.payload as BillingError;
      })

      .addCase(updateSubscription.fulfilled, (state, action) => {
        const index = state.subscriptions.findIndex(
          (sub) => sub.id === action.payload.id,
        );
        if (index !== -1) {
          state.subscriptions[index] = action.payload;
          if (state.currentSubscription?.id === action.payload.id) {
            state.currentSubscription = action.payload;
          }
        }
        state.lastUpdate = new Date();
      })

      .addCase(cancelSubscription.fulfilled, (state, action) => {
        const index = state.subscriptions.findIndex(
          (sub) => sub.id === action.payload.id,
        );
        if (index !== -1) {
          state.subscriptions[index] = action.payload;
          if (state.currentSubscription?.id === action.payload.id) {
            state.currentSubscription = action.payload;
          }
        }
        state.lastUpdate = new Date();
      });

    // Pricing Config
    builder
      .addCase(fetchPricingConfig.pending, (state) => {
        state.loading.pricing = true;
      })
      .addCase(fetchPricingConfig.fulfilled, (state, action) => {
        state.loading.pricing = false;
        state.pricingConfig = action.payload;
      })
      .addCase(fetchPricingConfig.rejected, (state, action) => {
        state.loading.pricing = false;
        state.error = action.payload as BillingError;
      });

    // Payment Methods
    builder
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.loading.paymentMethods = true;
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.loading.paymentMethods = false;
        state.paymentMethods = action.payload;
      })
      .addCase(addPaymentMethod.fulfilled, (state, action) => {
        state.paymentMethods.push(action.payload);
      })
      .addCase(removePaymentMethod.fulfilled, (state, action) => {
        state.paymentMethods = state.paymentMethods.filter(
          (pm) => pm.id !== action.payload,
        );
      });

    // Payment Processing
    builder
      .addCase(createPaymentIntent.pending, (state) => {
        state.loading.payments = true;
        state.isProcessingPayment = true;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.loading.payments = false;
        state.paymentIntents.push(action.payload);
      })
      .addCase(confirmPayment.fulfilled, (state, action) => {
        state.isProcessingPayment = false;
        const index = state.paymentIntents.findIndex(
          (pi) => pi.id === action.payload.id,
        );
        if (index !== -1) {
          state.paymentIntents[index] = action.payload;
        }
      })
      .addCase(confirmPayment.rejected, (state) => {
        state.isProcessingPayment = false;
      });

    // Invoice Management
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.loading.invoices = true;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading.invoices = false;
        state.invoices = action.payload.invoices;
        state.pagination.invoices = {
          total: action.payload.total,
          hasMore: action.payload.hasMore,
          currentPage: state.viewOptions.currentPage,
        };
      })
      .addCase(fetchUpcomingInvoice.fulfilled, (state, action) => {
        state.upcomingInvoice = action.payload;
      });

    // Usage & Analytics
    builder
      .addCase(fetchCurrentUsage.pending, (state) => {
        state.loading.usage = true;
      })
      .addCase(fetchCurrentUsage.fulfilled, (state, action) => {
        state.loading.usage = false;
        state.currentUsage = action.payload;
      })
      .addCase(fetchUsageHistory.fulfilled, (state, action) => {
        state.usageHistory = action.payload;
      })
      .addCase(fetchBillingAnalytics.pending, (state) => {
        state.loading.analytics = true;
      })
      .addCase(fetchBillingAnalytics.fulfilled, (state, action) => {
        state.loading.analytics = false;
        state.billingAnalytics = action.payload;
      });

    // Notifications
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading.notifications = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading.notifications = false;
        state.notifications = action.payload;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(
          (n) => n.id === action.payload,
        );
        if (notification) {
          notification.read = true;
        }
      });

    // Customer Portal
    builder
      .addCase(createCustomerPortalSession.pending, (state) => {
        state.loading.customerPortal = true;
      })
      .addCase(createCustomerPortalSession.fulfilled, (state) => {
        state.loading.customerPortal = false;
      })
      .addCase(createCustomerPortalSession.rejected, (state, action) => {
        state.loading.customerPortal = false;
        state.error = action.payload as BillingError;
      });
  },
});

// ============================================
// ACTIONS & SELECTORS EXPORT
// ============================================

export const {
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
} = billingSlice.actions;

export default billingSlice.reducer;
