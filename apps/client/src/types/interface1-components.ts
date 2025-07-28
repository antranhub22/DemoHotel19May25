// === Hook Types ===

export interface UseScrollBehaviorProps {
  isActive: boolean;
}

export interface UseScrollBehaviorReturn {
  showScrollButton: boolean;
  scrollToTop: () => void;
  scrollToSection: (section: 'hero' | 'services' | 'conversation') => void;
  heroSectionRef: RefObject<HTMLDivElement>;
  serviceGridRef: RefObject<HTMLDivElement>;
  conversationRef: RefObject<HTMLDivElement>;
}

export interface UseConversationStateProps {
  conversationRef: RefObject<HTMLDivElement>;
}

export interface UseConversationStateReturn {
  isCallStarted: boolean;
  showConversation: boolean;
  handleCallStart: (
    lang: Language
  ) => Promise<{ success: boolean; error?: string }>;
  handleCallEnd: () => void;
}

// === Component Props Types ===

export interface InterfaceContainerProps {
  children: ReactNode;
  className?: string;
}

export interface InterfaceHeaderProps {
  title?: string;
  className?: string;
}

// ConversationSectionProps removed - replaced by unified ChatPopup component

export interface ScrollToTopButtonProps {
  show: boolean;
  onScrollToTop: () => void;
  onScrollToServices: () => void;
}

export interface LoadingStateProps {
  className?: string;
  message?: string;
}

export interface ErrorStateProps {
  error: string | Error;
  className?: string;
  onRetry?: () => void;
}

// === Utility Types ===

export type ScrollSection = 'hero' | 'services' | 'conversation';

export interface CallResult {
  success: boolean;
  error?: string;
}

// === Constants Types ===

export interface InterfaceConstants {
  readonly SCROLL_THRESHOLD: number;
  readonly THROTTLE_DELAY: number;
  readonly AUTO_SCROLL_DELAY: number;
  readonly COLORS: {
    readonly BACKGROUND: string;
  };
  readonly SPACING: {
    readonly CONTAINER_MARGIN_TOP: string;
    readonly MIN_HEIGHT: string;
  };
  readonly SCROLL_OFFSETS: {
    readonly NEGATIVE_TOP_THRESHOLD: number;
    readonly HERO_SCROLL_TRIGGER: number;
  };
}
