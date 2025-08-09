import logger from "@shared/utils/logger";
import * as React from "react";
import { createContext, useCallback, useContext, useState } from "react";
export type Language = "en" | "fr" | "zh" | "ru" | "ko" | "vi";

export interface LanguageContextType {
  // Language state
  language: Language;
  setLanguage: (lang: Language) => void;

  // Translation state
  vietnameseSummary: string | null;
  setVietnameseSummary: (summary: string) => void;

  // Translation actions
  translateToVietnamese: (text: string) => Promise<string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  logger.debug("[LanguageProvider] Initializing...", "Component");

  const [language, setLanguageState] = useState<Language>(() => {
    // Load language from localStorage on init
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem(
        "selectedLanguage",
      ) as Language;
      if (
        savedLanguage &&
        ["en", "fr", "zh", "ru", "ko", "vi"].includes(savedLanguage)
      ) {
        logger.debug(
          "[LanguageContext] Loading saved language:",
          "Component",
          savedLanguage,
        );
        return savedLanguage;
      }
    }
    logger.debug("[LanguageContext] Using default language: en", "Component");
    return "en";
  });

  const [vietnameseSummary, setVietnameseSummary] = useState<string | null>(
    null,
  );

  // Language setter with persistence
  const setLanguage = useCallback((lang: Language) => {
    logger.debug(
      "[LanguageContext] setLanguage called with:",
      "Component",
      lang,
    );
    setLanguageState(lang);

    // Persist to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedLanguage", lang);
      logger.debug(
        "[LanguageContext] Language saved to localStorage:",
        "Component",
        lang,
      );
    }
  }, []);

  // Function to translate text to Vietnamese
  const translateToVietnamese = useCallback(
    async (text: string): Promise<string> => {
      try {
        logger.debug(
          "[LanguageContext] Requesting Vietnamese translation...",
          "Component",
        );

        const response = await fetch("/api/translate-to-vietnamese", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.translatedText) {
          // Save the translated text
          setVietnameseSummary(data.translatedText);
          logger.debug("[LanguageContext] Translation successful", "Component");
          return data.translatedText;
        } else {
          throw new Error("Translation failed");
        }
      } catch (error) {
        logger.error(
          "[LanguageContext] Error translating to Vietnamese:",
          "Component",
          error,
        );
        return "Không thể dịch nội dung này sang tiếng Việt. Vui lòng thử lại sau.";
      }
    },
    [],
  );

  const value: LanguageContextType = {
    language,
    setLanguage,
    vietnameseSummary,
    setVietnameseSummary,
    translateToVietnamese,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
