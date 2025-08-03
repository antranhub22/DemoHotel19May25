import { Language } from '@/context/RefactoredAssistantContext';

// Multi-language notification messages
export interface NotificationMessages {
  title: Record<Language, string>;
  message: Record<Language, string>;
}

// Common notification message templates
export const NOTIFICATION_TEMPLATES = {
  // Language switching
  languageChanged: {
    title: {
      en: 'Language Changed',
      vi: 'Đã Thay Đổi Ngôn Ngữ',
      fr: 'Langue Modifiée',
      zh: '语言已更改',
      ru: 'Язык Изменен',
      ko: '언어가 변경됨',
    },
    message: {
      en: 'Voice assistant switched to {language}',
      vi: 'Trợ lý giọng nói đã chuyển sang {language}',
      fr: 'Assistant vocal basculé vers {language}',
      zh: '语音助手已切换到{language}',
      ru: 'Голосовой помощник переключен на {language}',
      ko: '음성 어시스턴트가 {language}로 전환됨',
    },
  },

  // Service selection
  serviceSelected: {
    title: {
      en: 'Service Selected',
      vi: 'Đã Chọn Dịch Vụ',
      fr: 'Service Sélectionné',
      zh: '已选择服务',
      ru: 'Услуга Выбрана',
      ko: '서비스 선택됨',
    },
    message: {
      en: '{service} - Tap Siri button to request',
      vi: '{service} - Nhấn nút Siri để yêu cầu',
      fr: '{service} - Appuyez sur le bouton Siri pour demander',
      zh: '{service} - 点击Siri按钮请求',
      ru: '{service} - Нажмите кнопку Siri для запроса',
      ko: '{service} - 시리 버튼을 눌러 요청하세요',
    },
  },

  // Voice request started
  voiceRequestStarted: {
    title: {
      en: 'Voice Request Started',
      vi: 'Đã Bắt Đầu Yêu Cầu Giọng Nói',
      fr: 'Demande Vocale Démarrée',
      zh: '语音请求已开始',
      ru: 'Голосовой Запрос Начат',
      ko: '음성 요청 시작됨',
    },
    message: {
      en: 'Starting voice request for {service}',
      vi: 'Đang bắt đầu yêu cầu bằng giọng nói cho {service}',
      fr: 'Démarrage de la demande vocale pour {service}',
      zh: '正在开始{service}的语音请求',
      ru: 'Запуск голосового запроса для {service}',
      ko: '{service}에 대한 음성 요청을 시작합니다',
    },
  },

  // Voice request failed
  voiceRequestFailed: {
    title: {
      en: 'Voice Request Failed',
      vi: 'Yêu Cầu Giọng Nói Thất Bại',
      fr: 'Demande Vocale Échouée',
      zh: '语音请求失败',
      ru: 'Ошибка Голосового Запроса',
      ko: '음성 요청 실패',
    },
    message: {
      en: 'Unable to start voice request for {service}',
      vi: 'Không thể bắt đầu yêu cầu bằng giọng nói cho {service}',
      fr: 'Impossible de démarrer la demande vocale pour {service}',
      zh: '无法启动{service}的语音请求',
      ru: 'Невозможно запустить голосовой запрос для {service}',
      ko: '{service}에 대한 음성 요청을 시작할 수 없습니다',
    },
  },

  // Voice call completed
  voiceCallCompleted: {
    title: {
      en: 'Voice Call Completed',
      vi: 'Cuộc Gọi Giọng Nói Hoàn Thành',
      fr: 'Appel Vocal Terminé',
      zh: '语音通话已完成',
      ru: 'Голосовой Вызов Завершен',
      ko: '음성 통화 완료',
    },
    message: {
      en: 'Your request has been processed',
      vi: 'Yêu cầu của bạn đã được xử lý',
      fr: 'Votre demande a été traitée',
      zh: '您的请求已处理',
      ru: 'Ваш запрос обработан',
      ko: '요청이 처리되었습니다',
    },
  },

  // Voice context ready
  voiceContextReady: {
    title: {
      en: 'Voice Context Ready',
      vi: 'Ngữ Cảnh Giọng Nói Sẵn Sàng',
      fr: 'Contexte Vocal Prêt',
      zh: '语音上下文就绪',
      ru: 'Голосовой Контекст Готов',
      ko: '음성 컨텍스트 준비됨',
    },
    message: {
      en: 'Voice assistant optimized for {service}',
      vi: 'Trợ lý giọng nói được tối ưu hóa cho {service}',
      fr: 'Assistant vocal optimisé pour {service}',
      zh: '语音助手已为{service}优化',
      ru: 'Голосовой помощник оптимизирован для {service}',
      ko: '{service}에 최적화된 음성 어시스턴트',
    },
  },
} as const;

// Language display names for notifications
export const LANGUAGE_DISPLAY_NAMES = {
  en: {
    en: 'English',
    vi: 'Tiếng Việt',
    fr: 'Français',
    zh: '中文',
    ru: 'Русский',
    ko: '한국어',
  },
  vi: {
    en: 'Tiếng Anh',
    vi: 'Tiếng Việt',
    fr: 'Tiếng Pháp',
    zh: 'Tiếng Trung',
    ru: 'Tiếng Nga',
    ko: 'Tiếng Hàn',
  },
  fr: {
    en: 'Anglais',
    vi: 'Vietnamien',
    fr: 'Français',
    zh: 'Chinois',
    ru: 'Russe',
    ko: 'Coréen',
  },
  zh: {
    en: '英语',
    vi: '越南语',
    fr: '法语',
    zh: '中文',
    ru: '俄语',
    ko: '韩语',
  },
  ru: {
    en: 'Английский',
    vi: 'Вьетнамский',
    fr: 'Французский',
    zh: 'Китайский',
    ru: 'Русский',
    ko: 'Корейский',
  },
  ko: {
    en: '영어',
    vi: '베트남어',
    fr: '프랑스어',
    zh: '중국어',
    ru: '러시아어',
    ko: '한국어',
  },
} as const;

// Helper function to get localized notification
export function getLocalizedNotification(
  template: keyof typeof NOTIFICATION_TEMPLATES,
  language: Language,
  variables: Record<string, string> = {}
) {
  const notificationTemplate = NOTIFICATION_TEMPLATES[template];

  if (!notificationTemplate) {
    console.warn(`Unknown notification template: ${template}`);
    return {
      title: 'Notification',
      message: 'Update available',
    };
  }

  let title: string =
    notificationTemplate.title[language] || notificationTemplate.title.en;
  let message: string =
    notificationTemplate.message[language] || notificationTemplate.message.en;

  // Replace variables in title and message
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    title = title.replace(placeholder, value);
    message = message.replace(placeholder, value);
  });

  return { title, message };
}

// Helper function to create multi-language notification
export function createMultiLanguageNotification(
  template: keyof typeof NOTIFICATION_TEMPLATES,
  currentLanguage,
  variables: Record<string, string> = {},
  options: {
    type?:
      | 'success'
      | 'error'
      | 'warning'
      | 'info'
      | 'call'
      | 'service'
      | 'guest';
    duration?: number;
    metadata?: Record<string, any>;
  } = {}
) {
  const { title, message } = getLocalizedNotification(
    template,
    currentLanguage,
    variables
  );

  return {
    type: options.type || 'info',
    title,
    message,
    duration: options?.duration || 3000,
    metadata: {
      template,
      language: currentLanguage,
      variables,
      ...options.metadata,
    },
  };
}

// Voice feedback helper for TTS
export function getVoiceFeedback(
  template: keyof typeof NOTIFICATION_TEMPLATES,
  language: Language,
  variables: Record<string, string> = {}
): string {
  const { message } = getLocalizedNotification(template, language, variables);
  return message;
}

// Helper to add notification to global notification system
export function addMultiLanguageNotification(
  template: keyof typeof NOTIFICATION_TEMPLATES,
  currentLanguage,
  variables: Record<string, string> = {},
  options: {
    type?:
      | 'success'
      | 'error'
      | 'warning'
      | 'info'
      | 'call'
      | 'service'
      | 'guest';
    duration?: number;
    metadata?: Record<string, any>;
  } = {}
) {
  // ✅ MIGRATION: Use PopupSystem instead of NotificationSystem
  // First try to use PopupSystem if available (new unified approach)
  if (typeof window !== 'undefined' && (window as any).unifiedPopupSystem) {
    const { showQuickNotification } = (window as any).unifiedPopupSystem;
    const { title, message } = getLocalizedNotification(
      template,
      currentLanguage,
      variables
    );

    return showQuickNotification(message, {
      type: options.type || 'info',
      title,
      duration: options.duration || 3000,
    });
  }

  // Fallback to old NotificationSystem (for backward compatibility during migration)
  if (typeof window !== 'undefined' && (window as any).addNotification) {
    const notification = createMultiLanguageNotification(
      template,
      currentLanguage,
      variables,
      options
    );
    (window as any).addNotification(notification);
    return notification;
  }

  // If neither system is available, log for debugging
  if (typeof window !== 'undefined') {
    console.warn('🔄 [Migration] No notification system available:', {
      template,
      currentLanguage,
      variables,
      options,
    });
  }

  return null;
}
