/**
 * 🎯 LAYER 1 REORGANIZED - Component Barrel Exports
 * New structure: ui/ | business/ | layout/ | features/
 */

// ========================================
// 🏢 BUSINESS LOGIC COMPONENTS
// ========================================
export { Interface1 } from './business/Interface1.tsx';
export { default as Reference } from './business/Reference.tsx';
export { default as VoiceAssistant } from './business/VoiceAssistant.tsx';

// ========================================
// 🏗️ LAYOUT COMPONENTS
// ========================================
export { default as ErrorBoundary } from './layout/ErrorBoundary.tsx';
export { default as InfographicSteps } from './layout/InfographicSteps.tsx';

// ========================================
// 🎨 UI COMPONENTS
// ========================================
export { EmailForm } from './ui/EmailForm.tsx';
export { default as TranscriptDisplay } from './ui/TranscriptDisplay.tsx';

// ========================================
// 🎯 FEATURE MODULES
// ========================================

// Voice Assistant Features
export { ErrorState } from './features/voice-assistant/interface1/ErrorState.tsx';
export { InterfaceContainer } from './features/voice-assistant/interface1/InterfaceContainer.tsx';
export { LoadingState } from './features/voice-assistant/interface1/LoadingState.tsx';
export { SiriButton } from './features/voice-assistant/siri/SiriButton.ts';
export { SiriButtonContainer } from './features/voice-assistant/siri/SiriButtonContainer.tsx';

// Dashboard Features
export { default as AssistantConfigPanel } from './features/dashboard/dashboard/AssistantConfigPanel.tsx';
export { default as MetricCard } from './features/dashboard/dashboard/MetricCard.tsx';
export { default as Sidebar } from './features/dashboard/dashboard/Sidebar.tsx';
export { default as UsageChart } from './features/dashboard/dashboard/UsageChart.tsx';
export { default as StaffRequestDetailModal } from './features/dashboard/StaffRequestDetailModal.tsx';
export { UnifiedDashboardLayout } from './features/dashboard/unified-dashboard/UnifiedDashboardLayout.tsx';

// Popup System Features
export { default as RealtimeConversationPopup } from './features/popup-system/RealtimeConversationPopup.tsx';
export { default as ReferencePopup } from './features/popup-system/ReferencePopup.tsx';
export { default as RightPanelPopup } from './features/popup-system/RightPanelPopup.tsx';
export { default as StaffMessagePopup } from './features/popup-system/StaffMessagePopup.tsx';
export { SummaryPopup } from './features/popup-system/SummaryPopup.tsx';
export { default as WelcomePopup } from './features/popup-system/WelcomePopup.tsx';

// ========================================
// 🎯 LAYER 1.2 COMPLETE - ORGANIZED BY PURPOSE
// ========================================
// ✅ ui/ - Pure UI components
// ✅ business/ - Business logic components
// ✅ layout/ - Layout and structural components
// ✅ features/ - Feature-based modules (voice-assistant, dashboard, popup-system)
// ✅ _archive/ - Legacy code moved out of active development
