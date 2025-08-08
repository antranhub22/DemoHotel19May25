/**
 * Guest Experience Service Tests
 * Unit tests for business logic functions
 */

import type { Room } from "@/types/common.types";
import { GuestExperienceService } from "../services/guestExperienceService";
import type { Language } from "../types/guestExperience.types";
import { vi, describe, test, expect, beforeEach } from "vitest";

// Mock localStorage for testing
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
(global as any).localStorage = mockLocalStorage;

describe("GuestExperienceService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Guest Journey Management", () => {
    test("should initialize first-time user journey", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = GuestExperienceService.initializeGuestJourney();

      expect(result.isFirstTime).toBe(true);
      expect(result.savedLanguage).toBeUndefined();
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "hasVisited",
        "true",
      );
    });

    test("should initialize returning user journey with saved language", () => {
      mockLocalStorage.getItem
        .mockReturnValueOnce("true") // hasVisited
        .mockReturnValueOnce("vi"); // savedLanguage

      const result = GuestExperienceService.initializeGuestJourney();

      expect(result.isFirstTime).toBe(false);
      expect(result.savedLanguage).toBe("vi");
    });

    test("should ignore invalid saved language", () => {
      mockLocalStorage.getItem
        .mockReturnValueOnce("true") // hasVisited
        .mockReturnValueOnce("invalid"); // savedLanguage

      const result = GuestExperienceService.initializeGuestJourney();

      expect(result.savedLanguage).toBeUndefined();
    });

    test("should save language selection", () => {
      GuestExperienceService.saveLanguageSelection("fr");

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "selectedLanguage",
        "fr",
      );
    });

    test("should get correct next journey step", () => {
      expect(GuestExperienceService.getNextJourneyStep("welcome")).toBe(
        "language-selection",
      );
      expect(
        GuestExperienceService.getNextJourneyStep("language-selection"),
      ).toBe("voice-interaction");
      expect(
        GuestExperienceService.getNextJourneyStep("voice-interaction"),
      ).toBe("conversation");
      expect(GuestExperienceService.getNextJourneyStep("conversation")).toBe(
        "call-summary",
      );
      expect(GuestExperienceService.getNextJourneyStep("call-summary")).toBe(
        "completed",
      );
      expect(GuestExperienceService.getNextJourneyStep("completed")).toBe(
        "voice-interaction",
      );
    });
  });

  describe("Voice Interaction Management", () => {
    test("should generate unique call ID", () => {
      const callId1 = GuestExperienceService.generateCallId();
      const callId2 = GuestExperienceService.generateCallId();

      expect(callId1).toMatch(/^call_\d+_[a-z0-9]+$/);
      expect(callId2).toMatch(/^call_\d+_[a-z0-9]+$/);
      expect(callId1).not.toBe(callId2);
    });

    test("should create call session", () => {
      const language: Language = "en";
      const session = GuestExperienceService.createCallSession(language);

      expect(session.language).toBe(language);
      expect(session.status).toBe("active");
      expect(session.startTime).toBeInstanceOf(Date);
      expect(session.transcripts).toEqual([]);
      expect(session.id).toMatch(/^call_\d+_[a-z0-9]+$/);
    });

    test("should validate service context", () => {
      const validContext = {
        serviceId: "room-service",
        serviceName: "Room Service",
        serviceDescription: "Order food to your room",
        language: "en" as Language,
      };

      const invalidContext = {
        serviceId: "",
        serviceName: "Room Service",
        serviceDescription: "Order food to your room",
        language: "en" as Language,
      };

      expect(GuestExperienceService.validateServiceContext(validContext)).toBe(
        true,
      );
      expect(
        GuestExperienceService.validateServiceContext(invalidContext),
      ).toBe(false);
    });
  });

  describe("Conversation Management", () => {
    test("should create transcript entry", () => {
      const transcript = GuestExperienceService.createTranscript(
        "Hello, I need help",
        "user",
        "en",
      );

      expect(transcript.text).toBe("Hello, I need help");
      expect(transcript.type).toBe("user");
      expect(transcript.language).toBe("en");
      expect(transcript.timestamp).toBeInstanceOf(Date);
      expect(transcript.id).toMatch(/^transcript_\d+_[a-z0-9]+$/);
    });

    test("should process conversation text", () => {
      const processed =
        GuestExperienceService.processConversationText("  Hello   world  ");
      expect(processed).toBe("Hello world");
    });
  });

  describe("Call Summary Management", () => {
    test("should extract guest data from summary", () => {
      const summaryText =
        "Guest Mr. John Smith in room 101 requested room service with special dietary requirements";

      const extractedData =
        GuestExperienceService.extractGuestDataFromSummary(summaryText);

      expect(extractedData.roomNumber).toBe("101");
      expect(extractedData.guestName).toBe("John Smith");
      expect(extractedData.serviceType).toBe("room service");
      expect(extractedData.specialRequests).toContain("special");
    });

    test("should extract Vietnamese guest data", () => {
      const summaryText = "Khách ở phòng 205 yêu cầu housekeeping";

      const extractedData =
        GuestExperienceService.extractGuestDataFromSummary(summaryText);

      expect(extractedData.roomNumber).toBe("205");
      expect(extractedData.serviceType).toBe("housekeeping");
    });

    test("should create call summary", () => {
      const callId = "call_123";
      const summaryText = "Guest requested room service";

      const summary = GuestExperienceService.createCallSummary(
        callId,
        summaryText,
      );

      expect(summary.callId).toBe(callId);
      expect(summary.content).toBe(summaryText);
      expect(summary.generatedAt).toBeInstanceOf(Date);
      expect(summary.id).toMatch(/^summary_\d+_[a-z0-9]+$/);
    });
  });

  describe("Utility Methods", () => {
    test("should check if journey is complete", () => {
      expect(GuestExperienceService.isJourneyComplete("completed")).toBe(true);
      expect(GuestExperienceService.isJourneyComplete("conversation")).toBe(
        false,
      );
    });

    test("should get language display names", () => {
      expect(GuestExperienceService.getLanguageDisplayName("en")).toBe(
        "English",
      );
      expect(GuestExperienceService.getLanguageDisplayName("vi")).toBe(
        "Tiếng Việt",
      );
      expect(GuestExperienceService.getLanguageDisplayName("fr")).toBe(
        "Français",
      );
    });

    test("should validate journey state consistency", () => {
      expect(
        GuestExperienceService.validateJourneyState("welcome", false, false),
      ).toBe(true);
      expect(
        GuestExperienceService.validateJourneyState(
          "language-selection",
          false,
          false,
        ),
      ).toBe(true);
      expect(
        GuestExperienceService.validateJourneyState(
          "voice-interaction",
          true,
          false,
        ),
      ).toBe(true);
      expect(
        GuestExperienceService.validateJourneyState("conversation", true, true),
      ).toBe(true);
      expect(
        GuestExperienceService.validateJourneyState("completed", true, false),
      ).toBe(true);

      // Invalid states
      expect(
        GuestExperienceService.validateJourneyState(
          "conversation",
          false,
          true,
        ),
      ).toBe(false);
      expect(
        GuestExperienceService.validateJourneyState(
          "voice-interaction",
          false,
          false,
        ),
      ).toBe(false);
    });

    test("should calculate call duration", () => {
      const startTime = new Date("2024-01-01T10:00:00Z");
      const endTime = new Date("2024-01-01T10:02:30Z");

      const duration = GuestExperienceService.calculateCallDuration(
        startTime,
        endTime,
      );
      expect(duration).toBe(150); // 2 minutes 30 seconds = 150 seconds
    });

    test("should format call duration", () => {
      expect(GuestExperienceService.formatCallDuration(30)).toBe("30s");
      expect(GuestExperienceService.formatCallDuration(90)).toBe("1m 30s");
      expect(GuestExperienceService.formatCallDuration(120)).toBe("2m 0s");
    });
  });
});
