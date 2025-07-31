import { Language } from '@/types/interface1.types';
import { useMemo } from 'react';
import {
  LANGUAGE_COLORS,
  LanguageColorScheme,
} from '../constants/languageColors';

/**
 * Hook to get language-specific color scheme
 * @param language - Current language
 * @returns Color scheme for the language
 */
export const useLanguageColors = (language: Language): LanguageColorScheme => {
  return useMemo(() => {
    return LANGUAGE_COLORS[language] || LANGUAGE_COLORS['en'];
  }, [language]);
};
