# Interface1 Button Handlers - Separated Architecture

## 📂 File Structure

```
apps/client/src/hooks/
├── useCancelHandler.ts              # ❌ Cancel button logic
├── useConfirmHandler.ts             # ✅ Confirm button logic  
├── useSendToFrontDeskHandler.ts     # 🏨 Send to FrontDesk logic  
└── useInterface1.ts                 # 🎯 Main interface hook (uses above)
```

## 🎯 Purpose

**Problem**: Previously, button handlers were inline functions inside components, making them hard to find, test, and modify.

**Solution**: Separated into dedicated hooks for better maintainability and reusability.

## 📋 When to Modify Each Hook

### ❌ Cancel Button Changes → `useCancelHandler.ts`
**Use cases:**
- Change cancel behavior (reset flow)
- Modify popup cleanup logic
- Update scroll behavior on cancel
- Add/remove cancel steps

**Current Cancel Flow:**
1. Clear active popups
2. Reset conversation state  
3. Close right panel
4. Scroll to top

### ✅ Confirm Button Changes → `useConfirmHandler.ts` 
**Use cases:**
- Change confirm behavior (summary flow)
- Modify summary popup generation
- Update timeout/delay settings
- Add/remove confirm steps
- Change fallback strategies

**Current Confirm Flow:**
1. End call via conversationState
2. Wait for AI summary generation (1.5s)
3. Display summary popup with fallbacks
4. Handle multiple error scenarios

### 🏨 Send to FrontDesk Changes → `useSendToFrontDeskHandler.ts`
**Use cases:**
- Change order submission logic
- Modify data extraction from call summary
- Update API endpoint or payload format
- Add/remove order validation steps
- Change success/error handling

**Current Send to FrontDesk Flow:**
1. Extract order data from callSummary/serviceRequests
2. Generate order with unique reference (ORD-XXXXX)
3. Submit to /api/request endpoint
4. Update order state and show success/error

### 🎯 Integration Changes → `useInterface1.ts`
**Use cases:**
- Add new props to any handler
- Change handler dependencies
- Modify hook initialization
- Update return values

## 🔧 How to Use

```typescript
// In useInterface1.ts
const { handleCancel } = useCancelHandler({
  conversationState,
  conversationPopupId,
  setConversationPopupId,
  setShowRightPanel,
  transcripts
});

const { handleConfirm } = useConfirmHandler({
  endCall,
  transcripts,
  callSummary,
  serviceRequests
});

// In RightPanelPopup.tsx
const { handleSendToFrontDesk, isSubmitting } = useSendToFrontDeskHandler({
  onSuccess: () => {
    alert('✅ Request sent to Front Desk successfully!');
    onClose();
  },
  onError: (error) => {
    alert(`❌ ${error}`);
  }
});
```

## 🏗️ Hook Pattern

All button handlers follow the same pattern:

```typescript
interface UseHandlerProps {
  // Required dependencies
  param1: Type1;
  param2: Type2;
  // Optional callbacks
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UseHandlerReturn {
  handleAction: () => void;
  isLoading?: boolean;
}

export const useHandler = (props: UseHandlerProps): UseHandlerReturn => {
  // Implementation
  return { handleAction, isLoading };
};
```

## 🚀 Benefits

✅ **Easy to find**: Know exactly where to look for each button's logic
✅ **Reusable**: Same logic can be used in multiple components  
✅ **Testable**: Each hook can be tested independently
✅ **Maintainable**: Changes isolated to specific files
✅ **Type-safe**: Full TypeScript support with proper interfaces
✅ **Configurable**: Callbacks allow customization per use case

## 📍 Usage Locations

### useCancelHandler
- `useInterface1.ts` - Interface1 Cancel button
- Potential: Any component needing cancel functionality

### useConfirmHandler  
- `useInterface1.ts` - Interface1 Confirm button
- Potential: Any component needing call confirmation

### useSendToFrontDeskHandler
- `RightPanelPopup.tsx` - Summary popup Send to FrontDesk button
- Potential: Any component needing order submission to front desk

## 🔄 Future Extensions

The pattern can be extended for other actions:
- `useEmailSummaryHandler.ts` - Email summary functionality
- `useCallbackRequestHandler.ts` - Request callback functionality  
- `useServiceRequestHandler.ts` - General service request handling
- `useNotificationHandler.ts` - Push notification handling

Each new handler should follow the same pattern for consistency. 