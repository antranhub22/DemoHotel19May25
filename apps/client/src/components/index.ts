/**
 * Barrel exports for components directory
 */

// Core components - Always loaded
export { Interface1 } from './Interface1';

// Legacy interfaces - Lazy loaded to reduce bundle size
export const Interface3 = React.lazy(() => import('./Interface3'));
export const Interface4 = React.lazy(() => import('./Interface4'));

// Shared components
export { default as ErrorBoundary } from './ErrorBoundary';
export { default as Reference } from './Reference';
export { default as SummaryPopup } from './SummaryPopup';
export { default as ChatPopup } from './ChatPopup';

// Import React for lazy loading
import React from 'react';

// Interface1 components
export { InterfaceContainer } from './interface1/InterfaceContainer';
export { InterfaceHeader } from './interface1/InterfaceHeader';
export { ServiceGridContainer } from './interface1/ServiceGridContainer';
export { RightPanelSection } from './interface1/RightPanelSection';
// ConversationSection removed - replaced by unified ChatPopup component

// Shared components
export { LoadingState } from './interface1/LoadingState';
export { ErrorState } from './interface1/ErrorState';
export { ServiceGrid } from './interface1/ServiceGrid';
export { ScrollToTopButton } from './interface1/ScrollToTopButton';
export { default as RealtimeConversationPopup } from './RealtimeConversationPopup';
export { default as SiriCallButton } from './siri/SiriCallButton';
export { default as StaffMessagePopup } from './StaffMessagePopup';
export { default as StaffRequestDetailModal } from './StaffRequestDetailModal';
export { default as TranscriptDisplay } from './TranscriptDisplay';
export { default as VoiceAssistant } from './VoiceAssistant';
export { default as WelcomePopup } from './WelcomePopup';

// Form components
export { EmailForm } from './EmailForm';

// Dashboard components
export { default as AssistantConfigPanel } from './dashboard/AssistantConfigPanel';
export { default as FeatureToggle } from './dashboard/FeatureToggle';
export { default as HotelResearchPanel } from './dashboard/HotelResearchPanel';
export { default as MetricCard } from './dashboard/MetricCard';
export { default as Sidebar } from './dashboard/Sidebar';
export { default as TopBar } from './dashboard/TopBar';
export { default as UsageChart } from './dashboard/UsageChart';
