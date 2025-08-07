/**
 * Guest Experience Service
 * Business logic for guest journey and voice interactions
 * ⚠️ NOTE: This service DOES NOT modify existing API endpoints or database
 */

import type { Language } from "@shared/types";
import type {
  CallSession,
  CallSummary,
  GuestJourneyStep,
  ServiceContext,
  Transcript,
} from "../types/guestExperience.types";

export class GuestExperienceService {
  // ===============================================
  // GUEST JOURNEY MANAGEMENT
  // ===============================================

  /**
   * Initialize guest journey based on user history
   * Uses localStorage to determine if first-time user
   */
  static initializeGuestJourney(): {
    isFirstTime: boolean;
    savedLanguage?: Language;
  } {
    const hasVisited = localStorage.getItem("hasVisited");
    const savedLanguage = localStorage.getItem("selectedLanguage") as Language;

    const isFirstTime = !hasVisited;

    if (isFirstTime) {
      localStorage.setItem("hasVisited", "true");
    }

    // Validate saved language
    const validLanguages: Language[] = ["en", "vi", "fr", "zh", "ru", "ko"];
    const isValidLanguage =
      savedLanguage && validLanguages.includes(savedLanguage);

    return {
      isFirstTime,
      savedLanguage: isValidLanguage ? savedLanguage : undefined,
    };
  }

  /**
   * Save language selection to localStorage
   */
  static saveLanguageSelection(language: Language): void {
    localStorage.setItem("selectedLanguage", language);
  }

  /**
   * Determine next step in guest journey
   */
  static getNextJourneyStep(currentStep: GuestJourneyStep): GuestJourneyStep {
    const stepFlow: Record<GuestJourneyStep, GuestJourneyStep> = {
      welcome: "language-selection",
      "language-selection": "voice-interaction",
      "voice-interaction": "conversation",
      conversation: "call-summary",
      "call-summary": "completed",
      completed: "voice-interaction", // Allow restart
    };

    return stepFlow[currentStep];
  }

  // ===============================================
  // VOICE INTERACTION MANAGEMENT
  // ===============================================

  /**
   * Generate unique call ID
   */
  static generateCallId(): string {
    return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create new call session
   */
  static createCallSession(language: Language): CallSession {
    return {
      id: this.generateCallId(),
      language,
      startTime: new Date(),
      status: "active",
      transcripts: [],
    };
  }

  /**
   * Validate service context for voice call
   */
  static validateServiceContext(context: ServiceContext): boolean {
    return !!(context.serviceId && context.serviceName && context.language);
  }

  // ===============================================
  // CONVERSATION MANAGEMENT
  // ===============================================

  /**
   * Create transcript entry
   */
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

  /**
   * Process conversation update (formatting, validation)
   */
  static processConversationText(text: string): string {
    // Basic text processing - trim, sanitize
    return text.trim().replace(/\s+/g, " ");
  }

  // ===============================================
  // CALL SUMMARY MANAGEMENT
  // ===============================================

  /**
   * Extract guest data from call summary text
   * This uses the existing summary format without changing APIs
   */
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

  /**
   * Create call summary object
   */
  static createCallSummary(callId: string, summaryText: string): CallSummary {
    return {
      id: `summary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      callId,
      content: summaryText,
      extractedData: this.extractGuestDataFromSummary(summaryText),
      generatedAt: new Date(),
    };
  }

  // ===============================================
  // UTILITY METHODS
  // ===============================================

  /**
   * Check if guest journey is complete
   */
  static isJourneyComplete(step: GuestJourneyStep): boolean {
    return step === "completed";
  }

  /**
   * Get language display name
   */
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

  /**
   * Validate guest journey state consistency
   */
  static validateJourneyState(
    step: GuestJourneyStep,
    hasSelectedLanguage: boolean,
    isInCall: boolean,
  ): boolean {
    switch (step) {
      case "welcome":
        return !hasSelectedLanguage && !isInCall;
      case "language-selection":
        return !hasSelectedLanguage && !isInCall;
      case "voice-interaction":
        return hasSelectedLanguage && !isInCall;
      case "conversation":
        return hasSelectedLanguage && isInCall;
      case "call-summary":
      case "completed":
        return hasSelectedLanguage && !isInCall;
      default:
        return false;
    }
  }

  /**
   * Calculate call duration
   */
  static calculateCallDuration(startTime: Date, endTime?: Date): number {
    const end = endTime || new Date();
    return Math.floor((end.getTime() - startTime.getTime()) / 1000); // seconds
  }

  /**
   * Format call duration for display
   */
  static formatCallDuration(durationSeconds: number): string {
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }
}
