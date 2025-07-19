import { useCallback, createElement } from 'react';
import { usePopup } from '@/components/popup-system';

/**
 * Hook quản lý popup demo functions cho Interface1
 * Bao gồm: notification demo, summary demo, conversation demo
 */
export interface Interface1Popups {
  handleShowConversationPopup: () => void;
  handleShowNotificationDemo: () => void;
  handleShowSummaryDemo: () => void;
}

export const useInterface1Popups = (): Interface1Popups => {
  const { showNotification, showSummary } = usePopup();

  // Conversation demo - disabled, using ConversationSection instead
  const handleShowConversationPopup = useCallback(() => {
    console.log('Conversation demo disabled - using ConversationSection instead');
  }, []);

  // Notification demo
  const handleShowNotificationDemo = useCallback(() => {
    try {
      // Try to import DemoPopupContent dynamically
      import('../../components/popup-system/DemoPopupContent').then((module) => {
        const { NotificationDemoContent } = module;
        showNotification(
          createElement(NotificationDemoContent),
          { 
            title: 'Pool Maintenance',
            priority: 'medium' as const,
            badge: 1 
          }
        );
      }).catch(() => {
        // Fallback content if import fails
        showNotification(
          createElement('div', { style: { padding: '16px' } }, [
            createElement('h4', { key: 'title' }, 'Hotel Notification'),
            createElement('p', { key: 'content' }, 'Pool maintenance from 2-4 PM today.')
          ]),
          { 
            title: 'Pool Maintenance',
            priority: 'medium' as const,
            badge: 1 
          }
        );
      });
    } catch (error) {
      console.error('Error showing notification demo:', error);
    }
  }, [showNotification]);

  // Summary demo
  const handleShowSummaryDemo = useCallback(() => {
    try {
      // Try to import DemoPopupContent dynamically
      import('../../components/popup-system/DemoPopupContent').then((module) => {
        const { SummaryPopupContent } = module;
        showSummary(
          createElement(SummaryPopupContent),
          { 
            title: 'Call Summary',
            priority: 'high' as const
          }
        );
      }).catch(() => {
        // Fallback content if import fails
        showSummary(
          createElement('div', { style: { padding: '16px', fontSize: '12px' } }, [
            createElement('div', { key: 'title', style: { fontWeight: 'bold', marginBottom: '8px' } }, '📋 Call Summary'),
            createElement('div', { key: 'room' }, 'Room: 101'),
            createElement('div', { key: 'items' }, 'Items: 3 requests'),
            createElement('div', { key: 'time', style: { fontSize: '10px', color: '#666', marginTop: '8px' } }, 'Generated at ' + new Date().toLocaleTimeString())
          ]),
          { 
            title: 'Call Summary',
            priority: 'high' as const
          }
        );
      });
    } catch (error) {
      console.error('Error showing summary demo:', error);
    }
  }, [showSummary]);

  return {
    handleShowConversationPopup,
    handleShowNotificationDemo,
    handleShowSummaryDemo
  };
}; 