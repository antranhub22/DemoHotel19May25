/**
 * Enhanced Guest Experience Hooks
 * ✅ ENHANCED: Integrated with SaaS Provider for multi-tenant operations
 * Combines Guest Experience with feature gating, usage tracking, and billing
 */

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import logger from "@shared/utils/logger";
import { useCallback, useEffect, useState } from "react";

// ✅ NEW: SaaS Provider integration
import {
  useFeatureGating,
  useTenantManagement,
  useUsageMonitoring,
} from "../../saas-provider/hooks/useTenantManagement";

// Guest Experience imports
import {
  EnhancedGuestExperienceService,
  EnhancedServiceContext,
} from "../services/guestExperienceService.enhanced";
import {
  addTranscript,
  clearCallSummary,
  endVoiceCall,
  initializeGuestJourney,
  resetGuestJourney,
  selectCallSummary,
  selectCanStartCall,
  selectConversation,
  selectCurrentCallSession,
  selectGuestJourney,
  selectIsInActiveCall,
  selectSelectedLanguage,
  selectVoiceInteraction,
  setCallSummary,
  setLanguage,
  setVoiceInteractionError,
  setVoiceInteractionLoading,
  startVoiceCall,
} from "../store/guestJourneySlice";
import type { Language, ServiceContext } from "../types/guestExperience.types";

/**
 * Enhanced Guest Experience Hook with SaaS Provider Integration
 * Provides complete interface with feature gating, usage tracking, and billing
 */
export const useEnhancedGuestExperience = () => {
  const dispatch = useAppDispatch();

  // ✅ NEW: SaaS Provider hooks
  const { currentTenant } = useTenantManagement();
  const { canAccess, getAvailability } = useFeatureGating();
  const usageMonitoring = useUsageMonitoring();
  const { stats, healthScore } = usageMonitoring;

  // Guest Experience selectors
  const journey = useAppSelector(selectGuestJourney);
  const voiceInteraction = useAppSelector(selectVoiceInteraction);
  const conversation = useAppSelector(selectConversation);
  const selectedLanguage = useAppSelector(selectSelectedLanguage);
  const currentCallSession = useAppSelector(selectCurrentCallSession);
  const callSummary = useAppSelector(selectCallSummary);
  const isInActiveCall = useAppSelector(selectIsInActiveCall);
  const canStartCall = useAppSelector(selectCanStartCall);

  // ✅ NEW: Enhanced state for SaaS integration
  const [usageStatus, setUsageStatus] = useState<{
    canMakeCalls: boolean;
    remainingMinutes: number;
    remainingCalls: number;
    warningMessage?: string;
  } | null>(null);

  // ✅ NEW: Check usage limits on mount and tenant change
  useEffect(() => {
    if (currentTenant) {
      updateUsageStatus();
    }
  }, [currentTenant]);

  const updateUsageStatus = useCallback(async () => {
    if (!currentTenant) return;

    try {
      const currentUsage = stats;
      const limits = currentTenant.limits;

      const remainingMinutes = Math.max(
        0,
        limits.maxMonthlyMinutes - currentUsage.minutes.current,
      );
      const remainingCalls = Math.max(
        0,
        limits.maxCalls - currentUsage.calls.current,
      );

      const canMakeCalls = remainingMinutes > 0 && remainingCalls > 0;

      let warningMessage;
      if (currentUsage.minutes.percentage > 80) {
        warningMessage = `⚠️ Approaching monthly minute limit (${currentUsage.minutes.current}/${limits.maxMonthlyMinutes})`;
      } else if (currentUsage.calls.percentage > 80) {
        warningMessage = `⚠️ Approaching monthly call limit (${currentUsage.calls.current}/${limits.maxCalls})`;
      }

      setUsageStatus({
        canMakeCalls,
        remainingMinutes,
        remainingCalls,
        warningMessage,
      });

      logger.debug(
        `[EnhancedGuestExperience] Usage status updated - canMakeCalls: ${canMakeCalls}, remainingMinutes: ${remainingMinutes}, remainingCalls: ${remainingCalls}`,
      );
    } catch (error) {
      logger.error(
        "[EnhancedGuestExperience] Error updating usage status:",
        error,
      );
    }
  }, [currentTenant, stats, healthScore]);

  // ✅ ENHANCED: Initialize journey with tenant context
  const initializeJourney = useCallback(() => {
    if (!currentTenant) {
      logger.warn(
        "[EnhancedGuestExperience] Cannot initialize without tenant context",
      );
      return;
    }

    const journeyData =
      EnhancedGuestExperienceService.initializeGuestJourneyWithTenant(
        currentTenant,
      );
    dispatch(
      initializeGuestJourney({
        isFirstTime: journeyData.isFirstTime,
        savedLanguage: journeyData.savedLanguage,
      }),
    );

    logger.debug(
      `[EnhancedGuestExperience] Journey initialized with tenant context - tenantId: ${currentTenant.id}, isFirstTime: ${journeyData.isFirstTime}`,
    );
  }, [dispatch, currentTenant]);

  // ✅ ENHANCED: Language selection with tenant context
  const selectLanguage = useCallback(
    (language: Language) => {
      if (!currentTenant) {
        logger.warn(
          "[EnhancedGuestExperience] Cannot select language without tenant context",
        );
        return;
      }

      // Check if multi-language is available for this plan
      if (!canAccess("multiLanguage") && language !== "en") {
        logger.warn(
          "[EnhancedGuestExperience] Multi-language not available for current plan",
        );
        throw new Error(
          `Multi-language support requires ${getAvailability("multiLanguage").requiredPlan} plan or higher`,
        );
      }

      EnhancedGuestExperienceService.saveLanguageSelectionForTenant(
        language,
        currentTenant.id,
      );
      dispatch(setLanguage(language));

      logger.debug(
        `[EnhancedGuestExperience] Language selected - language: ${language}, tenantId: ${currentTenant.id}`,
      );
    },
    [dispatch, currentTenant, canAccess, getAvailability],
  );

  // ✅ ENHANCED: Start call with feature gating and usage tracking
  const startCall = useCallback(
    async (language: Language, serviceContext?: ServiceContext) => {
      if (!currentTenant || !usageStatus) {
        throw new Error("Tenant context or usage status not available");
      }

      try {
        dispatch(setVoiceInteractionLoading(true));
        dispatch(setVoiceInteractionError(null));

        // ✅ NEW: Check feature access
        if (!canAccess("basicVoice")) {
          throw new Error(
            `Voice features require ${getAvailability("basicVoice").requiredPlan} plan or higher`,
          );
        }

        // ✅ NEW: Check usage limits
        if (!usageStatus.canMakeCalls) {
          throw new Error(
            "Monthly usage limits exceeded. Please upgrade your plan or wait for the next billing cycle.",
          );
        }

        // ✅ NEW: Check specific voice cloning feature
        if (serviceContext && !canAccess("voiceCloning")) {
          throw new Error(
            `Voice cloning requires ${getAvailability("voiceCloning").requiredPlan} plan or higher`,
          );
        }

        const enhancedContext: EnhancedServiceContext = {
          ...serviceContext,
          tenantId: currentTenant.id,
          subscriptionPlan: currentTenant.subscriptionPlan,
          usageTracking: {
            currentMonthMinutes: stats.minutes.current,
            maxMonthlyMinutes: currentTenant.limits.maxMonthlyMinutes,
            currentMonthCalls: stats.calls.current,
            maxMonthlyCalls: currentTenant.limits.maxCalls,
          },
        } as any;

        // Create enhanced call session
        const callSession =
          EnhancedGuestExperienceService.createEnhancedCallSession(
            language,
            enhancedContext,
          );

        // ✅ NEW: Track usage event
        // await trackUsage("voice_call_started", {
        //   callId: callSession.id,
        //   language,
        //   timestamp: new Date(),
        // });

        // Start the call
        dispatch(
          startVoiceCall({
            callId: callSession.id,
            language,
            // startTime: callSession.startTime,
          }),
        );

        // Update usage status
        await updateUsageStatus();

        logger.debug("[EnhancedGuestExperience] Enhanced call started:");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to start call";
        dispatch(setVoiceInteractionError(errorMessage));
        logger.error("[EnhancedGuestExperience] Error starting call:", error);
        throw error;
      } finally {
        dispatch(setVoiceInteractionLoading(false));
      }
    },
    [
      dispatch,
      currentTenant,
      usageStatus,
      canAccess,
      getAvailability,
      stats,
      updateUsageStatus,
    ],
  );

  // ✅ ENHANCED: End call with usage tracking and billing
  const endCall = useCallback(
    async (summary?: string) => {
      if (!currentCallSession || !currentTenant) {
        logger.warn(
          "[EnhancedGuestExperience] Cannot end call without session or tenant context",
        );
        return;
      }

      try {
        const callDuration =
          EnhancedGuestExperienceService.calculateCallDuration(
            currentCallSession.startTime,
            new Date(),
          );

        // ✅ NEW: Track usage event with duration
        // await trackUsage("voice_call_ended", {
        //   callId: currentCallSession.id,
        //   duration: callDuration,
        //   timestamp: new Date(),
        // });

        // Create enhanced call summary if summary provided
        if (summary) {
          const enhancedContext: EnhancedServiceContext = {
            tenantId: currentTenant.id,
            subscriptionPlan: currentTenant.subscriptionPlan,
          } as any;

          const enhancedSummary =
            EnhancedGuestExperienceService.createEnhancedCallSummary(
              currentCallSession.id,
              summary,
              enhancedContext,
              callDuration,
            );

          dispatch(setCallSummary(enhancedSummary));

          logger.debug(
            "[EnhancedGuestExperience] Enhanced call summary created:",
            {
              callId: currentCallSession.id,
              duration: callDuration,
              cost: enhancedSummary.billingData.cost,
            },
          );
        }

        dispatch(
          endVoiceCall({
            endTime: new Date(),
            duration: callDuration,
            summary: summary as any,
          }),
        );

        // Update usage status after call
        await updateUsageStatus();

        logger.debug("[EnhancedGuestExperience] Enhanced call ended:");
      } catch (error) {
        logger.error("[EnhancedGuestExperience] Error ending call:", error);
        throw error;
      }
    },
    [
      dispatch,
      currentCallSession,
      currentTenant,
      // trackUsage,
      updateUsageStatus,
    ],
  );

  // ✅ NEW: Add transcript with enhanced features
  const addConversationTranscript = useCallback(
    (text: string, type: "user" | "assistant") => {
      if (!selectedLanguage || !currentTenant) {
        logger.warn(
          "[EnhancedGuestExperience] Cannot add transcript without language or tenant context",
        );
        return;
      }

      const transcript = EnhancedGuestExperienceService.createTranscript(
        text,
        type,
        selectedLanguage,
      );
      dispatch(addTranscript(transcript));

      logger.debug("[EnhancedGuestExperience] Transcript added:");
    },
    [dispatch, selectedLanguage, currentTenant],
  );

  // ✅ NEW: Get feature availability info
  const getVoiceFeatureInfo = useCallback(() => {
    if (!currentTenant) return null;

    return {
      basicVoice: {
        available: canAccess("basicVoice"),
        info: getAvailability("basicVoice"),
      },
      voiceCloning: {
        available: canAccess("voiceCloning"),
        info: getAvailability("voiceCloning"),
      },
      multiLanguage: {
        available: canAccess("multiLanguage"),
        info: getAvailability("multiLanguage"),
      },
      advancedAnalytics: {
        available: canAccess("advancedAnalytics"),
        info: getAvailability("advancedAnalytics"),
      },
    };
  }, [currentTenant, canAccess, getAvailability]);

  return {
    // ✅ ENHANCED: State with SaaS integration
    journey,
    voiceInteraction,
    conversation,
    selectedLanguage,
    currentCallSession,
    callSummary,
    isInActiveCall,
    canStartCall: canStartCall && usageStatus?.canMakeCalls,

    // ✅ NEW: SaaS Provider state
    currentTenant,
    usageStatus,
    featureInfo: getVoiceFeatureInfo(),

    // ✅ ENHANCED: Actions with SaaS integration
    actions: {
      initializeJourney,
      selectLanguage,
      startCall,
      endCall,
      addConversationTranscript,

      // Original actions (for backward compatibility)
      resetJourney: () => dispatch(resetGuestJourney()),
      clearSummary: () => dispatch(clearCallSummary()),
      updateUsageStatus,
    },
  };
};

/**
 * Enhanced Language Selection Hook with Feature Gating
 */
export const useEnhancedLanguageSelection = () => {
  const { selectedLanguage, featureInfo } = useEnhancedGuestExperience();
  const { selectLanguage } = useEnhancedGuestExperience().actions;

  const availableLanguages = [
    { code: "en" as Language, name: "English", premium: false },
    { code: "vi" as Language, name: "Tiếng Việt", premium: true },
    { code: "fr" as Language, name: "Français", premium: true },
    { code: "zh" as Language, name: "中文", premium: true },
    { code: "ru" as Language, name: "Русский", premium: true },
    { code: "ko" as Language, name: "한국어", premium: true },
  ];

  const getLanguageAvailability = useCallback(
    (language: Language) => {
      const langInfo = availableLanguages.find((l) => l.code === language);
      if (!langInfo)
        return { available: false, reason: "Language not supported" };

      if (langInfo.premium && !featureInfo?.multiLanguage.available) {
        return {
          available: false,
          reason: `Multi-language support requires ${featureInfo?.multiLanguage.info.requiredPlan} plan or higher`,
        };
      }

      return { available: true };
    },
    [featureInfo, availableLanguages],
  );

  return {
    selectedLanguage,
    availableLanguages,
    selectLanguage,
    getLanguageAvailability,
    hasMultiLanguageAccess: featureInfo?.multiLanguage.available || false,
  };
};
