# Guest Experience Domain

**Domain-Driven Architecture for Guest Journey Management**

## 🎯 Overview

The Guest Experience domain manages the complete guest journey from first visit to voice interaction completion. It uses Redux Toolkit for state management and provides clean separation of business logic from UI components.

## 📁 Structure

```
guest-experience/
├── types/               # Domain type definitions
├── store/              # Redux Toolkit slices & selectors
├── services/           # Business logic services
├── hooks/              # Custom React hooks
├── adapters/           # Legacy compatibility layers
├── index.ts            # Public API exports
└── README.md          # This file
```

## 🔧 Core Components

### Types (`types/guestExperience.types.ts`)

- `Language`: Supported languages (en, vi, fr, zh, ru, ko)
- `GuestJourneyStep`: Journey progression stages
- `VoiceInteractionState`: Voice call state management
- `ConversationState`: Real-time conversation state
- `CallSession`: Complete call session data
- `CallSummary`: AI-generated call summaries

### Store (`store/guestJourneySlice.ts`)

Redux Toolkit slice managing:

- Guest journey progression
- Language selection
- Voice interaction state
- Conversation transcripts
- Call summaries

### Services (`services/guestExperienceService.ts`)

Business logic functions:

- Journey initialization
- Language management
- Call session creation
- Transcript processing
- Summary data extraction

### Hooks (`hooks/useGuestExperience.ts`)

React hooks providing:

- `useGuestExperience()`: Complete domain interface
- `useLanguageSelection()`: Language-specific operations
- `useVoiceInteraction()`: Voice call management
- `useConversation()`: Real-time conversation handling

## 🚀 Quick Start

### 1. Setup Redux Store

```typescript
// store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import guestExperienceReducer from "../domains/guest-experience/store/guestJourneySlice";

export const store = configureStore({
  reducer: {
    guestExperience: guestExperienceReducer,
  },
});
```

### 2. Wrap App with Redux Provider

```typescript
// App.tsx
import { ReduxProvider } from './providers/ReduxProvider';

function App() {
  return (
    <ReduxProvider>
      <YourAppContent />
    </ReduxProvider>
  );
}
```

### 3. Use in Components

```typescript
// components/VoiceAssistant.tsx
import { useGuestExperience } from '@/domains/guest-experience';

const VoiceAssistant = () => {
  const {
    journey,
    selectedLanguage,
    initializeJourney,
    selectLanguage,
    startCall,
    endCall,
  } = useGuestExperience();

  useEffect(() => {
    initializeJourney();
  }, []);

  return (
    <div>
      {journey.showWelcome && <WelcomeModal />}
      {!journey.hasSelectedLanguage && (
        <LanguageSelector onSelect={selectLanguage} />
      )}
      {journey.hasSelectedLanguage && (
        <VoiceInterface onStartCall={startCall} onEndCall={endCall} />
      )}
    </div>
  );
};
```

## 🔄 Migration Guide

### From useAssistant Context

**Before:**

```typescript
import { useAssistant } from "@/context";

const MyComponent = () => {
  const { language, setLanguage } = useAssistant();
  // ...
};
```

**After:**

```typescript
import { useLanguageSelection } from "@/domains/guest-experience";

const MyComponent = () => {
  const { selectedLanguage, selectLanguage } = useLanguageSelection();
  // ...
};
```

### Using Adapter for Gradual Migration

```typescript
import { useAssistantAdapter } from "@/domains/guest-experience";

const LegacyComponent = () => {
  // Drop-in replacement for useAssistant
  const { language, setLanguage } = useAssistantAdapter();
  // Component code unchanged
};
```

## 📊 Guest Journey Flow

```
1. Welcome (first-time users)
   ↓
2. Language Selection
   ↓
3. Voice Interaction
   ↓
4. Real-time Conversation
   ↓
5. Call Summary
   ↓
6. Journey Complete
```

Each step is managed by the domain with proper state transitions and validation.

## 🔍 Key Features

### ✅ Business Logic Separation

- All business logic centralized in services
- Components focus purely on UI
- Easy to test and modify business rules

### ✅ Type Safety

- Complete TypeScript coverage
- Strong typing for all domain operations
- Runtime validation where needed

### ✅ State Management

- Redux Toolkit for predictable state updates
- Optimistic updates for better UX
- Proper error handling and loading states

### ✅ Backward Compatibility

- Adapter layer for existing code
- Gradual migration path
- No breaking changes to existing APIs

### ✅ Performance

- Memoized selectors
- Efficient state updates
- Lazy loading support

## 🔄 State Flow Example

```typescript
// 1. Initialize guest journey
dispatch(initializeGuestJourney({ isFirstTime: true }));

// 2. User selects language
dispatch(setLanguage("vi"));

// 3. Start voice call
const callId = GuestExperienceService.generateCallId();
dispatch(startVoiceCall({ callId, language: "vi" }));

// 4. Add conversation transcripts
const transcript = GuestExperienceService.createTranscript(
  "Tôi muốn đặt phòng",
  "user",
  "vi",
);
dispatch(addTranscript(transcript));

// 5. End call with summary
const summary = GuestExperienceService.createCallSummary(
  callId,
  "Guest wants to book a room...",
);
dispatch(endVoiceCall({ callId, summary }));
```

## 🧪 Testing

The domain provides pure functions and Redux reducers that are easy to test:

```typescript
// Test business logic
describe("GuestExperienceService", () => {
  test("should create valid call session", () => {
    const session = GuestExperienceService.createCallSession("en");
    expect(session.language).toBe("en");
    expect(session.status).toBe("active");
  });
});

// Test Redux reducers
describe("guestJourneySlice", () => {
  test("should handle language selection", () => {
    const state = guestJourneySlice.reducer(initialState, setLanguage("vi"));
    expect(state.selectedLanguage).toBe("vi");
    expect(state.journey.hasSelectedLanguage).toBe(true);
  });
});
```

## 🚀 Next Steps

1. **Request Management Domain**: Handle service requests from voice calls
2. **Staff Management Domain**: Manage staff interactions and notifications
3. **Hotel Operations Domain**: Analytics, monitoring, and guest management

## 📝 Notes

- **API Compatibility**: This domain does NOT modify existing API endpoints or database schemas
- **Gradual Migration**: Use adapters to migrate components one by one
- **Performance**: Domain state is optimized for minimal re-renders
- **Extensibility**: Easy to add new features within the domain boundaries
