/**
 * Redux Store Configuration
 * Main store setup with Guest Experience domain integration
 */

import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

// Domain reducers
import guestExperienceReducer from "../domains/guest-experience/store/guestJourneySlice";
import tenantReducer from "../domains/saas-provider/store/tenantSlice";

// Configure store with domains
export const store = configureStore({
  reducer: {
    guestExperience: guestExperienceReducer,
    tenant: tenantReducer, // ✅ SaaS Provider Domain
    // Future domains will be added here:
    // requestManagement: requestManagementReducer,
    // staffManagement: staffManagementReducer,
    // hotelOperations: hotelOperationsReducer,
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
