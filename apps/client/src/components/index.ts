/**
 * 🎯 LAYER 1 REORGANIZED - Component Barrel Exports
 * New structure: ui/ | business/ | layout/ | features/
 */

// ========================================
// 🏢 BUSINESS LOGIC COMPONENTS
// ========================================
export { Interface1 } from './business/Interface1';
export { default as Reference } from './business/Reference';
export { default as VoiceAssistant } from './business/VoiceAssistant';

// ========================================
// 🏗️ LAYOUT COMPONENTS
// ========================================
export { default as ErrorBoundary } from './layout/ErrorBoundary';
export { default as InfographicSteps } from './layout/InfographicSteps';

// ========================================
// 🎨 UI COMPONENTS
// ========================================
export { EmailForm } from './ui/EmailForm';
export { default as TranscriptDisplay } from './ui/TranscriptDisplay';

// ========================================
// 🎯 FEATURE MODULES
// ========================================

// Voice Assistant Features
export { ErrorState } from './features/voice-assistant/interface1/ErrorState';
export { InterfaceContainer } from './features/voice-assistant/interface1/InterfaceContainer';
export { LoadingState } from './features/voice-assistant/interface1/LoadingState';
export { SiriButton } from './features/voice-assistant/siri/SiriButton';
export { SiriButtonContainer } from './features/voice-assistant/siri/SiriButtonContainer';

// Dashboard Features
export { default as AssistantConfigPanel } from './features/dashboard/dashboard/AssistantConfigPanel';
export { default as MetricCard } from './features/dashboard/dashboard/MetricCard';
export { default as Sidebar } from './features/dashboard/dashboard/Sidebar';
export { default as UsageChart } from './features/dashboard/dashboard/UsageChart';
export { default as StaffRequestDetailModal } from './features/dashboard/StaffRequestDetailModal';
export { UnifiedDashboardLayout } from './features/dashboard/unified-dashboard/UnifiedDashboardLayout';

// Popup System Features
export { default as RealtimeConversationPopup } from './features/popup-system/RealtimeConversationPopup';
export { default as ReferencePopup } from './features/popup-system/ReferencePopup';
export { default as RightPanelPopup } from './features/popup-system/RightPanelPopup';
export { default as StaffMessagePopup } from './features/popup-system/StaffMessagePopup';
export { default as SummaryPopup } from './features/popup-system/SummaryPopup';
export { default as WelcomePopup } from './features/popup-system/WelcomePopup';

// ========================================
// 🎯 LAYER 1.2 COMPLETE - ORGANIZED BY PURPOSE
// ========================================
// ✅ ui/ - Pure UI components
// ✅ business/ - Business logic components
// ✅ layout/ - Layout and structural components
// ✅ features/ - Feature-based modules (voice-assistant, dashboard, popup-system)
// ✅ _archive/ - Legacy code moved out of active development
