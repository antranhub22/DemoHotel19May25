import React from 'react';
import { X } from 'lucide-react';
import { PopupState, POPUP_TYPES } from '@/context/PopupContext';
import styles from './PopupCard.module.css';

interface PopupCardProps {
  popup: PopupState;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onDismiss: () => void;
  maxVisible?: number;
}

export const PopupCard: React.FC<PopupCardProps> = ({
  popup,
  index,
  isActive,
  onClick,
  onDismiss,
  maxVisible = 3,
}) => {
  const config = POPUP_TYPES[popup.type];
  const isVisible = index < maxVisible;

  // Calculate transform for stacking effect
  const stackOffset = Math.min(index, maxVisible - 1);
  const scale = 1 - stackOffset * 0.03;
  const translateY = stackOffset * 12;
  const opacity = isVisible ? 1 - stackOffset * 0.1 : 0;
  const zIndex = 1000 - index;

  // Format timestamp
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (!isVisible && index >= maxVisible) {
    return null;
  }

  const cardClasses = [
    styles.popupCard,
    isActive ? styles.popupCardActive : '',
    index === 0 ? styles.popupCardTop : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cardClasses}
      style={
        {
          transform: `translateY(${translateY}px) scale(${scale})`,
          opacity,
          zIndex,
          '--translate-y': `${translateY}px`,
          '--scale-hover': scale * 1.02,
        } as React.CSSProperties
      }
      onClick={onClick}
    >
      <div className={styles.popupCardInner}>
        {/* Header */}
        <div
          className={styles.popupCardHeader}
          style={{ background: config.bgColor }}
        >
          <div className={styles.popupCardInfo}>
            <div className={styles.popupCardIcon}>{config.icon}</div>
            <div className={styles.popupCardTitleWrapper}>
              <span
                className={styles.popupCardTitle}
                style={{ color: config.color }}
              >
                {config.title}
              </span>
              {popup.badge && popup.badge > 0 && (
                <span
                  className={styles.popupCardBadge}
                  style={{ background: config.color }}
                >
                  {popup.badge}
                </span>
              )}
            </div>
          </div>
          <div className={styles.popupCardMeta}>
            <span className={styles.popupCardTimestamp}>
              {formatTime(popup.timestamp)}
            </span>
            <button
              className={styles.popupCardDismiss}
              onClick={e => {
                e.stopPropagation();
                onDismiss();
              }}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Content Preview (only for non-active cards) */}
        {!isActive && (
          <div className={styles.popupCardPreview}>
            <span className={styles.popupCardPreviewText}>{popup.title}</span>
          </div>
        )}

        {/* Full Content (only for active card) */}
        {isActive && (
          <div className={styles.popupCardContent}>{popup.content}</div>
        )}
      </div>
    </div>
  );
};
