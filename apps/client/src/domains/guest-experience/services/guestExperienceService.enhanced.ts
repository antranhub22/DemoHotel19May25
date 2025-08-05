/**
 * Enhanced Guest Experience Service
 * Business logic with SaaS Provider integration for multi-tenant operations
 * ✅ ENHANCED: Now includes tenant context, feature gating, and usage tracking
 */

import { logger } from "@shared/utils/logger";
import type {
  CallSession,
  CallSummary,
  Language,
  ServiceContext,
  Transcript,
} from "../types/guestExperience.types";

// ✅ NEW: SaaS Provider integration
import type { TenantData } from "../../saas-provider/types/saasProvider.types";

export interface EnhancedServiceContext extends ServiceContext {
  tenantId: string;
  subscriptionPlan: "trial" | "basic" | "premium" | "enterprise";
  usageTracking?: {
    currentMonthMinutes: number;
    maxMonthlyMinutes: number;
    currentMonthCalls: number;
    maxMonthlyCalls: number;
  };
}

export class EnhancedGuestExperienceService {
  // ===============================================
  // MULTI-TENANT CONTEXT MANAGEMENT
  // ===============================================

  /**
   * Initialize guest journey with tenant context
   */
  static initializeGuestJourneyWithTenant(tenant: TenantData): {
    isFirstTime: boolean;
    savedLanguage?: Language;
    tenantContext: {
      id: string;
      name: string;
      features: string[];
      limits: Record<string, number>;
    };
  } {
    const hasVisited = localStorage.getItem(`hasVisited_${tenant.id}`);
    const savedLanguage = localStorage.getItem(
      `selectedLanguage_${tenant.id}`,
    ) as Language;

    const isFirstTime = !hasVisited;

    if (isFirstTime) {
      localStorage.setItem(`hasVisited_${tenant.id}`, "true");
      logger.debug(
        "[EnhancedGuestExperience] First-time visitor for tenant:",
        tenant.id,
      );
    }

    // Validate saved language
    const validLanguages: Language[] = ["en", "vi", "fr", "zh", "ru", "ko"];
    const isValidLanguage =
      savedLanguage && validLanguages.includes(savedLanguage);

    return {
      isFirstTime,
      savedLanguage: isValidLanguage ? savedLanguage : undefined,
      tenantContext: {
        id: tenant.id,
        name: tenant.hotelName,
        features: Object.entries(tenant.features)
          .filter(([_, enabled]) => enabled)
          .map(([feature, _]) => feature),
        limits: tenant.limits,
      },
    };
  }

  /**
   * Save language selection with tenant context
   */
  static saveLanguageSelectionForTenant(
    language: Language,
    tenantId: string,
  ): void {
    localStorage.setItem(`selectedLanguage_${tenantId}`, language);
    logger.debug("[EnhancedGuestExperience] Language saved for tenant:", {
      language,
      tenantId,
    });
  }

  // ===============================================
  // FEATURE GATING INTEGRATION
  // ===============================================

  /**
   * Check if voice feature is available for subscription plan
   */
  static canAccessVoiceFeature(
    feature:
      | "basicVoice"
      | "voiceCloning"
      | "multiLanguage"
      | "advancedAnalytics",
    subscriptionPlan: "trial" | "basic" | "premium" | "enterprise",
  ): boolean {
    const featureMatrix = {
      trial: ["basicVoice"],
      basic: ["basicVoice", "multiLanguage"],
      premium: ["basicVoice", "multiLanguage", "voiceCloning"],
      enterprise: [
        "basicVoice",
        "multiLanguage",
        "voiceCloning",
        "advancedAnalytics",
      ],
    };

    const allowedFeatures = featureMatrix[subscriptionPlan] || [];
    const hasAccess = allowedFeatures.includes(feature);

    logger.debug("[EnhancedGuestExperience] Feature access check:", {
      feature,
      subscriptionPlan,
      hasAccess,
    });

    return hasAccess;
  }

  /**
   * Check usage limits before starting voice call
   */
  static canStartVoiceCall(usageTracking: {
    currentMonthMinutes: number;
    maxMonthlyMinutes: number;
    currentMonthCalls: number;
    maxMonthlyCalls: number;
  }): { allowed: boolean; reason?: string } {
    if (usageTracking.currentMonthCalls >= usageTracking.maxMonthlyCalls) {
      return {
        allowed: false,
        reason: `Monthly call limit reached (${usageTracking.maxMonthlyCalls} calls)`,
      };
    }

    if (usageTracking.currentMonthMinutes >= usageTracking.maxMonthlyMinutes) {
      return {
        allowed: false,
        reason: `Monthly minute limit reached (${usageTracking.maxMonthlyMinutes} minutes)`,
      };
    }

    return { allowed: true };
  }

  // ===============================================
  // ENHANCED VOICE INTERACTION WITH USAGE TRACKING
  // ===============================================

  /**
   * Create call session with tenant context and usage tracking
   */
  static createEnhancedCallSession(
    language: Language,
    context: EnhancedServiceContext,
  ): CallSession & { tenantId: string; trackUsage: boolean } {
    const callId = this.generateCallId();

    logger.debug("[EnhancedGuestExperience] Creating enhanced call session:", {
      callId,
      tenantId: context.tenantId,
      language,
      plan: context.subscriptionPlan,
    });

    return {
      id: callId,
      language,
      startTime: new Date(),
      status: "active",
      transcripts: [],
      // ✅ NEW: Enhanced properties
      tenantId: context.tenantId,
      trackUsage: true,
    };
  }

  /**
   * Generate unique call ID with tenant prefix
   */
  static generateCallId(): string {
    return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track usage event for billing
   */
  static async trackUsageEvent(
    event: "call_started" | "call_ended" | "api_request",
    data: {
      tenantId: string;
      callId?: string;
      duration?: number;
      language?: Language;
    },
  ): Promise<void> {
    try {
      logger.debug("[EnhancedGuestExperience] Tracking usage event:", {
        event,
        data,
      });

      // This would integrate with backend usage tracking
      const response = await fetch("/api/usage/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-ID": data.tenantId,
        },
        body: JSON.stringify({
          event,
          timestamp: new Date().toISOString(),
          ...data,
        }),
      });

      if (!response.ok) {
        logger.warn(
          "[EnhancedGuestExperience] Usage tracking failed:",
          response.statusText,
        );
      }
    } catch (error) {
      logger.error("[EnhancedGuestExperience] Usage tracking error:", error);
    }
  }

  // ===============================================
  // ENHANCED CALL SUMMARY WITH BILLING DATA
  // ===============================================

  /**
   * Create enhanced call summary with billing information
   */
  static createEnhancedCallSummary(
    callId: string,
    summaryText: string,
    context: EnhancedServiceContext,
    callDuration: number,
  ): CallSummary & {
    billingData: {
      tenantId: string;
      duration: number;
      cost: number;
      plan: string;
    };
  } {
    const summary = this.createCallSummary(callId, summaryText);

    // Calculate cost based on subscription plan
    const costPerMinute = this.getCostPerMinute(context.subscriptionPlan);
    const durationMinutes = Math.ceil(callDuration / 60);
    const cost = durationMinutes * costPerMinute;

    logger.debug("[EnhancedGuestExperience] Enhanced call summary created:", {
      callId,
      duration: callDuration,
      cost,
      plan: context.subscriptionPlan,
    });

    return {
      ...summary,
      billingData: {
        tenantId: context.tenantId,
        duration: callDuration,
        cost,
        plan: context.subscriptionPlan,
      },
    };
  }

  /**
   * Get cost per minute based on subscription plan
   */
  private static getCostPerMinute(
    plan: "trial" | "basic" | "premium" | "enterprise",
  ): number {
    const pricing = {
      trial: 0, // Free during trial
      basic: 0.05, // $0.05 per minute
      premium: 0.03, // $0.03 per minute
      enterprise: 0.02, // $0.02 per minute
    };

    return pricing[plan] || 0;
  }

  // ===============================================
  // INHERITED METHODS (from original service)
  // ===============================================

  static createCallSummary(callId: string, summaryText: string): CallSummary {
    return {
      id: `summary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      callId,
      content: summaryText,
      extractedData: this.extractGuestDataFromSummary(summaryText),
      generatedAt: new Date(),
    };
  }

  static extractGuestDataFromSummary(summaryText: string): {
    guestName?: string;
    roomNumber?: string;
    serviceType?: string;
    specialRequests?: string[];
  } {
    const extractedData: any = {};

    // Extract room number (patterns like "room 101", "phòng 102")
    const roomMatch = summaryText.match(/(?:room|phòng)\s*(\d+)/i);
    if (roomMatch) {
      extractedData.roomNumber = roomMatch[1];
    }

    // Extract guest name (patterns after "Mr.", "Ms.", "guest name")
    const nameMatch = summaryText.match(
      /(?:Mr\.|Ms\.|guest name|tên khách)\s+([A-Za-z\s]+)/i,
    );
    if (nameMatch) {
      extractedData.guestName = nameMatch[1].trim();
    }

    // Extract service type
    const serviceKeywords = [
      "room service",
      "housekeeping",
      "maintenance",
      "booking",
      "tour",
    ];
    for (const keyword of serviceKeywords) {
      if (summaryText.toLowerCase().includes(keyword)) {
        extractedData.serviceType = keyword;
        break;
      }
    }

    // Extract special requests (simple keyword detection)
    const specialRequests: string[] = [];
    const requestKeywords = ["urgent", "special", "extra", "specific"];

    requestKeywords.forEach((keyword) => {
      if (summaryText.toLowerCase().includes(keyword)) {
        specialRequests.push(keyword);
      }
    });

    if (specialRequests.length > 0) {
      extractedData.specialRequests = specialRequests;
    }

    return extractedData;
  }

  static createTranscript(
    text: string,
    type: "user" | "assistant",
    language: Language,
  ): Transcript {
    return {
      id: `transcript_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text,
      timestamp: new Date(),
      type,
      language,
    };
  }

  static processConversationText(text: string): string {
    return text.trim().replace(/\s+/g, " ");
  }

  static getLanguageDisplayName(language: Language): string {
    const displayNames: Record<Language, string> = {
      en: "English",
      vi: "Tiếng Việt",
      fr: "Français",
      zh: "中文",
      ru: "Русский",
      ko: "한국어",
    };

    return displayNames[language] || language;
  }

  static calculateCallDuration(startTime: Date, endTime?: Date): number {
    const end = endTime || new Date();
    return Math.floor((end.getTime() - startTime.getTime()) / 1000); // seconds
  }

  static formatCallDuration(durationSeconds: number): string {
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }
}
