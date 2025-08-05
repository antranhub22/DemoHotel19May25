/**
 * Redux Store Configuration
 * Main store setup with Guest Experience domain integration
 */

import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

// Domain reducers
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
    // Future domains:
    // billing: billingReducer,
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
        ],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
