import en from '@/i18n/en.json';
import fr from '@/i18n/fr.json';
import ko from '@/i18n/ko.json';
import ru from '@/i18n/ru.json';
import vi from '@/i18n/vi.json';
import zh from '@/i18n/zh.json';

export type Lang = 'en' | 'fr' | 'zh' | 'ru' | 'ko' | 'vi';

const resources = { en, fr, zh, ru, ko, vi };

export function t(key: string, lang: Lang = 'en'): string {
  return (resources[lang] as Record<string, string>)[key] || key;
}
