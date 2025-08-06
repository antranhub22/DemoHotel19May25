/**
 * Redux Store Configuration
 * Main store setup with Guest Experience domain integration
 */

import { configureStore } from "@reduxjs/toolkit";

// Domain reducers
import billingReducer from "../domains/billing-subscription/store/billingSlice";
import guestExperienceReducer from "../domains/guest-experience/store/guestJourneySlice";
import hotelOperationsReducer from "../domains/hotel-operations/store/hotelOperationsSlice";
import requestManagementReducer from "../domains/request-management/store/requestManagementSlice";
import tenantReducer from "../domains/saas-provider/store/tenantSlice";
import staffManagementReducer from "../domains/staff-management/store/staffManagementSlice";

// Configure store with domains
export const store = configureStore({
  reducer: {
    guestExperience: guestExperienceReducer,
    tenant: tenantReducer, // ✅ SaaS Provider Domain
    requestManagement: requestManagementReducer, // ✅ Request Management Domain
    staffManagement: staffManagementReducer, // ✅ Staff Management Domain
    hotelOperations: hotelOperationsReducer, // ✅ Hotel Operations Domain
    billing: billingReducer, // ✅ Billing & Subscription Domain
    // Future domains:
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore Date objects in actions and state
        ignoredActions: [
          "guestExperience/startVoiceCall",
          "guestExperience/endVoiceCall",
          "guestExperience/addTranscript",
          "guestExperience/setCallSummary",
          "tenant/setCurrentTenant",
          "tenant/updateTenantUsage",
          "tenant/addUsageAlert",
          "tenant/updateRealTimeUsage",
          "requestManagement/fetchRequests/fulfilled",
          "requestManagement/createRequest/fulfilled",
          "requestManagement/updateRequest/fulfilled",
          "requestManagement/addRequestUpdate",
          "requestManagement/addMessage",
          "staffManagement/fetchStaff/fulfilled",
          "staffManagement/createStaff/fulfilled",
          "staffManagement/updateStaff/fulfilled",
          "staffManagement/addStaffUpdate",
          "staffManagement/checkInStaff/fulfilled",
          "staffManagement/checkOutStaff/fulfilled",
          "hotelOperations/fetchRooms/fulfilled",
          "hotelOperations/createRoom/fulfilled",
          "hotelOperations/updateRoom/fulfilled",
          "hotelOperations/fetchHousekeepingTasks/fulfilled",
          "hotelOperations/fetchMaintenanceRequests/fulfilled",
          "hotelOperations/addHotelOperationsUpdate",
          "billing/fetchSubscriptions/fulfilled",
          "billing/fetchInvoices/fulfilled",
          "billing/fetchCurrentUsage/fulfilled",
          "billing/fetchBillingAnalytics/fulfilled",
          "billing/fetchNotifications/fulfilled",
          "billing/addBillingUpdate",
        ],
        ignoredPaths: [
          "guestExperience.voiceInteraction.callStartTime",
          "guestExperience.voiceInteraction.callEndTime",
          "guestExperience.currentCallSession.startTime",
          "guestExperience.currentCallSession.endTime",
          "guestExperience.callSummary.generatedAt",
          "guestExperience.conversation.transcripts",
          "tenant.currentTenant.trialEndsAt",
          "tenant.currentTenant.subscriptionEndsAt",
          "tenant.usageAlerts",
          "tenant.realTimeUsage",
          "tenant.platformMetrics.lastUpdated",
          "requestManagement.requests",
          "requestManagement.selectedRequest.createdAt",
          "requestManagement.selectedRequest.updatedAt",
          "requestManagement.lastUpdate",
          "requestManagement.pendingUpdates",
          "requestManagement.messages",
          "requestManagement.metricsLastUpdated",
          "staffManagement.staff",
          "staffManagement.selectedStaff.hireDate",
          "staffManagement.selectedStaff.lastCheckIn",
          "staffManagement.selectedStaff.lastCheckOut",
          "staffManagement.tasks",
          "staffManagement.schedules",
          "staffManagement.lastUpdate",
          "hotelOperations.rooms",
          "hotelOperations.selectedRoom.createdAt",
          "hotelOperations.selectedRoom.updatedAt",
          "hotelOperations.selectedRoom.lastCleaning",
          "hotelOperations.selectedRoom.lastMaintenance",
          "hotelOperations.housekeepingTasks",
          "hotelOperations.maintenanceRequests",
          "hotelOperations.facilities",
          "hotelOperations.inventoryItems",
          "hotelOperations.lastUpdate",
          "billing.subscriptions",
          "billing.currentSubscription.currentPeriodStart",
          "billing.currentSubscription.currentPeriodEnd",
          "billing.currentSubscription.trialEnd",
          "billing.currentSubscription.created",
          "billing.currentSubscription.updated",
          "billing.invoices",
          "billing.selectedInvoice.created",
          "billing.selectedInvoice.dueDate",
          "billing.selectedInvoice.paidAt",
          "billing.upcomingInvoice.periodStart",
          "billing.upcomingInvoice.periodEnd",
          "billing.paymentIntents",
          "billing.paymentMethods",
          "billing.currentUsage.currentPeriod",
          "billing.usageHistory",
          "billing.billingAnalytics.period",
          "billing.billingAnalytics.usageTrends",
          "billing.notifications",
          "billing.lastUpdate",
          "billing.filters.dateRange",
        ],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export hooks from separate file to avoid circular imports
export { useAppDispatch, useAppSelector } from "./hooks";
