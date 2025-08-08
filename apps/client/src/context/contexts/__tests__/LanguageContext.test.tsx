import type { Language } from "@shared/types";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider, useLanguage } from "../LanguageContext";

// Mock fetch for translation API tests
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () =>
    Promise.resolve({
      success: true,
      translatedText: "Xin chào, tôi cần dịch vụ phòng",
    }),
});

// Test component that uses LanguageContext
const TestComponent = () => {
  const {
    language,
    setLanguage,
    vietnameseSummary,
    setVietnameseSummary,
    translateToVietnamese,
  } = useLanguage();

  const handleTranslation = async () => {
    try {
      const translation = await translateToVietnamese(
        "Hello, I need room service",
      );
      setVietnameseSummary(translation);
    } catch (error) {
      console.error("Translation failed:", error);
    }
  };

  return (
    <div>
      <div data-testid="current-language">{language}</div>
      <div data-testid="vietnamese-summary">
        {vietnameseSummary || "No summary"}
      </div>

      <button onClick={() => setLanguage("vi")} data-testid="set-vietnamese">
        Set Vietnamese
      </button>

      <button onClick={() => setLanguage("en")} data-testid="set-english">
        Set English
      </button>

      <button onClick={() => setLanguage("fr")} data-testid="set-french">
        Set French
      </button>

      <button onClick={() => setLanguage("zh")} data-testid="set-chinese">
        Set Chinese
      </button>

      <button onClick={() => setLanguage("ru")} data-testid="set-russian">
        Set Russian
      </button>

      <button onClick={() => setLanguage("ko")} data-testid="set-korean">
        Set Korean
      </button>

      <button
        onClick={() => setVietnameseSummary("Manual summary")}
        data-testid="set-manual-summary"
      >
        Set Manual Summary
      </button>

      <button onClick={handleTranslation} data-testid="translate-text">
        Translate Text
      </button>
    </div>
  );
};

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

describe("LanguageContext", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch mock for each test
    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          translatedText: "Xin chào, tôi cần dịch vụ phòng",
        }),
    } as Response);
  });

  it("should provide default language state", () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    expect(screen.getByTestId("current-language")).toHaveTextContent("en");
    expect(screen.getByTestId("vietnamese-summary")).toHaveTextContent(
      "No summary",
    );
  });

  it("should change language to Vietnamese", async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    await user.click(screen.getByTestId("set-vietnamese"));
    expect(screen.getByTestId("current-language")).toHaveTextContent("vi");
  });

  it("should change language to French", async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    await user.click(screen.getByTestId("set-french"));
    expect(screen.getByTestId("current-language")).toHaveTextContent("fr");
  });

  it("should change language to Chinese", async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    await user.click(screen.getByTestId("set-chinese"));
    expect(screen.getByTestId("current-language")).toHaveTextContent("zh");
  });

  it("should change language to Russian", async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    await user.click(screen.getByTestId("set-russian"));
    expect(screen.getByTestId("current-language")).toHaveTextContent("ru");
  });

  it("should change language to Korean", async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    await user.click(screen.getByTestId("set-korean"));
    expect(screen.getByTestId("current-language")).toHaveTextContent("ko");
  });

  it("should return to English", async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    // First change to Vietnamese
    await user.click(screen.getByTestId("set-vietnamese"));
    expect(screen.getByTestId("current-language")).toHaveTextContent("vi");

    // Then change back to English
    await user.click(screen.getByTestId("set-english"));
    expect(screen.getByTestId("current-language")).toHaveTextContent("en");
  });

  it("should set Vietnamese summary manually", async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    await user.click(screen.getByTestId("set-manual-summary"));
    expect(screen.getByTestId("vietnamese-summary")).toHaveTextContent(
      "Manual summary",
    );
  });

  it("should translate text to Vietnamese", async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    await act(async () => {
      await user.click(screen.getByTestId("translate-text"));
    });

    // Wait for translation to complete
    await vi.waitFor(() => {
      expect(screen.getByTestId("vietnamese-summary")).toHaveTextContent(
        "Xin chào, tôi cần dịch vụ phòng",
      );
    });
  });

  it("should throw error when used outside provider", () => {
    // Mock console.error to prevent error output in test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useLanguage must be used within a LanguageProvider");

    consoleSpy.mockRestore();
  });

  it("should handle translation errors gracefully", async () => {
    // Mock fetch to reject
    vi.mocked(global.fetch).mockRejectedValueOnce(
      new Error("Translation failed"),
    );

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    await act(async () => {
      await user.click(screen.getByTestId("translate-text"));
    });

    // Should log error but not crash - check that console.error was called (may have React warnings too)
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("should handle language changes in sequence", async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    // Test sequence of language changes
    const languages: Language[] = ["vi", "fr", "zh", "ru", "ko", "en"];
    const testIds = [
      "set-vietnamese",
      "set-french",
      "set-chinese",
      "set-russian",
      "set-korean",
      "set-english",
    ];

    for (let i = 0; i < languages.length; i++) {
      await user.click(screen.getByTestId(testIds[i]));
      expect(screen.getByTestId("current-language")).toHaveTextContent(
        languages[i],
      );
    }
  });

  it("should clear Vietnamese summary when set to empty string", async () => {
    const TestClearComponent = () => {
      const { vietnameseSummary, setVietnameseSummary } = useLanguage();

      return (
        <div>
          <div data-testid="vietnamese-summary">
            {vietnameseSummary || "No summary"}
          </div>
          <button
            onClick={() => setVietnameseSummary("Manual summary")}
            data-testid="set-manual-summary"
          >
            Set Manual Summary
          </button>
          <button
            onClick={() => setVietnameseSummary("")}
            data-testid="clear-summary"
          >
            Clear Summary
          </button>
        </div>
      );
    };

    render(
      <TestWrapper>
        <TestClearComponent />
      </TestWrapper>,
    );

    // First set a summary
    await user.click(screen.getByTestId("set-manual-summary"));
    expect(screen.getByTestId("vietnamese-summary")).toHaveTextContent(
      "Manual summary",
    );

    // Then clear it
    await user.click(screen.getByTestId("clear-summary"));
    expect(screen.getByTestId("vietnamese-summary")).toHaveTextContent(
      "No summary",
    );
  });
});
