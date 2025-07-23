import React from 'react';
import { PopupCard } from './PopupCard';
import styles from './PopupStack.module.css';
import { PopupState } from '@/context/PopupContext';

interface PopupStackProps {
  popups: PopupState[];
  activePopup: string | null;
  maxVisible?: number;
  onPopupSelect: (id: string) => void;
  onPopupDismiss: (id: string) => void;
  position?: 'top' | 'bottom' | 'center';
}

export const PopupStack: React.FC<PopupStackProps> = ({
  popups,
  activePopup,
  maxVisible = 4,
  onPopupSelect,
  onPopupDismiss,
  position = 'bottom',
}) => {
  if (popups.length === 0) {
    return null;
  }

  // Sort popups by priority and timestamp
  const sortedPopups = [...popups].sort((a, b) => {
    // Priority order: high -> medium -> low
    const priorityOrder = { high: 0, medium: 1, low: 2 };

    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }

    // If same priority, sort by timestamp (newest first)
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  return (
    <div
      className={styles.popupStack}
      style={{
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '400px',
        zIndex: 1000,
        pointerEvents: 'none',
        ...(position === 'top' && { top: '20px' }),
        ...(position === 'bottom' && { bottom: '260px' }),
        ...(position === 'center' && {
          top: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '90vw', // Better mobile support
          width: 'auto', // Let content determine width
        }),
      }}
    >
      <div
        className={styles.popupStackContainer}
        style={{
          display: 'flex',
          flexDirection: position === 'bottom' ? 'column-reverse' : 'column',
          gap: '4px',
          padding: position === 'center' ? '0' : '0 16px', // No padding for center modal
          pointerEvents: 'auto',
        }}
      >
        {/* Title when multiple popups */}
        {sortedPopups.length > 1 && (
          <div
            className={styles.popupStackHeader}
            style={{
              textAlign: 'center',
              padding: '8px 0',
              color: '#8E8E93',
              fontSize: '14px',
              fontWeight: '600',
              order: position === 'bottom' ? 1 : -1,
            }}
          >
            Notification Centre
          </div>
        )}

        {/* Active popup on top (or bottom based on position) */}
        {activePopup && (
          <div
            className={styles.popupStackActive}
            style={{
              order: position === 'bottom' ? 0 : 0,
            }}
          >
            {sortedPopups
              .filter(popup => popup.id === activePopup)
              .map((popup, index) => (
                <PopupCard
                  key={popup.id}
                  popup={popup}
                  index={0}
                  isActive={true}
                  onClick={() => onPopupSelect(popup.id)}
                  onDismiss={() => onPopupDismiss(popup.id)}
                  maxVisible={maxVisible}
                />
              ))}
          </div>
        )}

        {/* Stacked inactive popups */}
        <div
          className={styles.popupStackInactive}
          style={{
            order: position === 'bottom' ? 2 : 1,
          }}
        >
          {sortedPopups
            .filter(popup => popup.id !== activePopup)
            .slice(0, maxVisible - 1)
            .map((popup, index) => (
              <PopupCard
                key={popup.id}
                popup={popup}
                index={index + 1}
                isActive={false}
                onClick={() => onPopupSelect(popup.id)}
                onDismiss={() => onPopupDismiss(popup.id)}
                maxVisible={maxVisible}
              />
            ))}
        </div>

        {/* More indicator if there are hidden popups */}
        {sortedPopups.filter(p => p.id !== activePopup).length >
          maxVisible - 1 && (
          <div
            className={styles.popupStackMore}
            style={{
              textAlign: 'center',
              padding: '8px 0',
              color: '#8E8E93',
              fontSize: '12px',
              fontWeight: '500',
              order: position === 'bottom' ? 3 : 2,
            }}
          >
            +
            {sortedPopups.filter(p => p.id !== activePopup).length -
              (maxVisible - 1)}{' '}
            more
          </div>
        )}
      </div>
    </div>
  );
};
