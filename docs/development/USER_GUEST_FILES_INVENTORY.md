# User/Guest Files Inventory - Complete List

## 🔍 **Danh sách đầy đủ tất cả files liên quan tới Stakeholder User/Guest**

### **📋 Tổng quan:**

Liệt kê tất cả files liên quan tới User/Guest experience, chức năng của từng file, và kiểm tra trùng
lặp/conflicts.

## 🎯 **1. MAIN INTERFACE COMPONENTS**

### **1.1 Core Interface Components**

| File                                                        | Chức năng                                                                                   | Status    |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------- |
| `apps/client/src/components/business/Interface1.tsx`        | **Main Interface1 component** - Desktop layout với Siri button, conversation, summary popup | ✅ Active |
| `apps/client/src/components/business/Interface1Desktop.tsx` | **Desktop layout** - 3-column layout (Chat \| Siri \| Summary)                              | ✅ Active |
| `apps/client/src/components/business/Interface1Mobile.tsx`  | **Mobile layout** - Responsive mobile interface                                             | ✅ Active |
| `apps/client/src/components/business/VoiceAssistant.tsx`    | **Mobile-first guest experience** - Welcome modal, language selection, voice call           | ✅ Active |

### **1.2 Voice Assistant Components**

| File                                                                                       | Chức năng                                                                  | Status    |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- | --------- |
| `apps/client/src/components/features/voice-assistant/siri/SiriButtonContainer.tsx`         | **Main Siri button container** - Handles call start/end, responsive sizing | ✅ Active |
| `apps/client/src/components/features/voice-assistant/siri/SiriCallButton.tsx`              | **Siri button visual component** - Touch/click handlers, visual feedback   | ✅ Active |
| `apps/client/src/components/features/voice-assistant/siri/components/SiriButtonStatus.tsx` | **Status indicator** - Shows call status (idle/listening/processing)       | ✅ Active |
| `apps/client/src/components/features/voice-assistant/siri/components/SiriButtonVisual.tsx` | **Visual effects** - Animations, colors, glow effects                      | ✅ Active |
| `apps/client/src/components/features/voice-assistant/siri/hooks/useSiriButtonEvents.ts`    | **Event handlers** - Touch/click/mouse events                              | ✅ Active |
| `apps/client/src/components/features/voice-assistant/siri/hooks/useSiriButtonState.ts`     | **State management** - Call start/end logic                                | ✅ Active |
| `apps/client/src/components/features/voice-assistant/siri/hooks/useSiriButtonVisual.ts`    | **Visual state** - Colors, animations, responsive sizing                   | ✅ Active |
| `apps/client/src/components/features/voice-assistant/siri/hooks/useSiriResponsiveSize.ts`  | **Responsive sizing** - Dynamic button size based on screen                | ✅ Active |
| `apps/client/src/components/features/voice-assistant/siri/hooks/useLanguageColors.ts`      | **Language colors** - Color scheme per language                            | ✅ Active |
| `apps/client/src/components/features/voice-assistant/siri/hooks/useCallProtection.ts`      | **Call protection** - Prevents double-firing                               | ✅ Active |

### **1.3 Conversation Components**

| File                                                                             | Chức năng                                                   | Status    |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------- | --------- |
| `apps/client/src/components/features/conversation/RealtimeConversationPopup.tsx` | **Real-time conversation display** - Shows live transcripts | ✅ Active |
| `apps/client/src/components/features/conversation/ConversationDisplay.tsx`       | **Conversation UI** - Message bubbles, timestamps           | ✅ Active |
| `apps/client/src/components/features/conversation/TranscriptItem.tsx`            | **Individual transcript item** - Single message display     | ✅ Active |

## 🧠 **2. CONTEXT & STATE MANAGEMENT**

### **2.1 Main Contexts**

| File                                                     | Chức năng                                                             | Status        |
| -------------------------------------------------------- | --------------------------------------------------------------------- | ------------- |
| `apps/client/src/context/RefactoredAssistantContext.tsx` | **Main context** - Combines all sub-contexts, handles call start/end  | ✅ Active     |
| `apps/client/src/context/index.ts`                       | **Context exports** - Barrel file for all contexts                    | ✅ Active     |
| `apps/client/src/context/AssistantContext.tsx`           | **Legacy context** - Deprecated, alias for RefactoredAssistantContext | ⚠️ Deprecated |

### **2.2 Sub-Contexts**

| File                                                        | Chức năng                                                 | Status     |
| ----------------------------------------------------------- | --------------------------------------------------------- | ---------- |
| `apps/client/src/context/contexts/CallContext.tsx`          | **Call state** - Duration, active state, listeners        | ✅ Active  |
| `apps/client/src/context/contexts/TranscriptContext.tsx`    | **Transcript management** - Store, add, clear transcripts | ✅ Active  |
| `apps/client/src/context/contexts/LanguageContext.tsx`      | **Language state** - Current language, translations       | ✅ Active  |
| `apps/client/src/context/contexts/OrderContext.tsx`         | **Order management** - Service requests, call summary     | ✅ Active  |
| `apps/client/src/context/contexts/ConfigurationContext.tsx` | **Hotel config** - Tenant info, hotel settings            | ✅ Active  |
| `apps/client/src/context/contexts/VapiContextSimple.tsx`    | **Vapi integration** - Vapi SDK wrapper, call handling    | ✅ Active  |
| `apps/client/src/context/contexts/VapiOfficialContext.tsx`  | **Legacy Vapi context** - Removed                         | ❌ Removed |

### **2.3 Popup Context**

| File                                       | Chức năng                                 | Status    |
| ------------------------------------------ | ----------------------------------------- | --------- |
| `apps/client/src/context/PopupContext.tsx` | **Popup management** - Global popup state | ✅ Active |

## 🎣 **3. HOOKS & LOGIC**

### **3.1 Main Hooks**

| File                                            | Chức năng                                                       | Status    |
| ----------------------------------------------- | --------------------------------------------------------------- | --------- |
| `apps/client/src/hooks/useInterface1.ts`        | **Main interface hook** - Orchestrates all interface logic      | ✅ Active |
| `apps/client/src/hooks/useConversationState.ts` | **Conversation state** - Call start/end, transcript handling    | ✅ Active |
| `apps/client/src/hooks/useConfirmHandler.ts`    | **Summary handling** - Auto-trigger summary, popup management   | ✅ Active |
| `apps/client/src/hooks/useWebSocket.ts`         | **WebSocket connection** - Real-time updates, summary reception | ✅ Active |

### **3.2 Utility Hooks**

| File                                             | Chức năng                                             | Status    |
| ------------------------------------------------ | ----------------------------------------------------- | --------- |
| `apps/client/src/hooks/useScrollBehavior.ts`     | **Scroll management** - Auto-scroll to conversation   | ✅ Active |
| `apps/client/src/hooks/useHotelConfiguration.ts` | **Hotel config** - Load hotel settings                | ✅ Active |
| `apps/client/src/hooks/useSiriResponsiveSize.ts` | **Responsive sizing** - Dynamic button sizing         | ✅ Active |
| `apps/client/src/hooks/useSummaryProgression.ts` | **Summary progression** - Progress bar, step tracking | ✅ Active |

## 🎨 **4. POPUP SYSTEM**

### **4.1 Popup Management**

| File                                                                | Chức năng                                   | Status    |
| ------------------------------------------------------------------- | ------------------------------------------- | --------- |
| `apps/client/src/components/features/popup-system/PopupManager.tsx` | **Popup manager** - Global popup control    | ✅ Active |
| `apps/client/src/components/features/popup-system/PopupContext.tsx` | **Popup context** - State management        | ✅ Active |
| `apps/client/src/components/features/popup-system/PopupStack.tsx`   | **Popup stack** - Multiple popup handling   | ✅ Active |
| `apps/client/src/components/features/popup-system/PopupCard.tsx`    | **Popup card** - Individual popup component | ✅ Active |

### **4.2 Summary Popup Components**

| File                                                                       | Chức năng                                              | Status    |
| -------------------------------------------------------------------------- | ------------------------------------------------------ | --------- |
| `apps/client/src/components/features/popup-system/SummaryPopup.tsx`        | **Summary popup** - Main summary display               | ✅ Active |
| `apps/client/src/components/features/popup-system/SummaryPopupContent.tsx` | **Summary content** - Summary text, service requests   | ✅ Active |
| `apps/client/src/components/features/popup-system/SummaryProgression.tsx`  | **Progress component** - Progress bar, step indicators | ✅ Active |
| `apps/client/src/components/features/popup-system/DesktopSummaryPopup.tsx` | **Desktop summary** - Desktop-specific layout          | ✅ Active |
| `apps/client/src/components/features/popup-system/MobileSummaryPopup.tsx`  | **Mobile summary** - Mobile-specific layout            | ✅ Active |

### **4.3 Demo Components**

| File                                                                          | Chức năng                                   | Status    |
| ----------------------------------------------------------------------------- | ------------------------------------------- | --------- |
| `apps/client/src/components/features/popup-system/SummaryProgressionDemo.tsx` | **Demo component** - Testing progression UI | ✅ Active |
| `apps/client/src/components/features/popup-system/DemoPopupContent.tsx`       | **Demo content** - Test popup content       | ✅ Active |

## 📝 **5. TYPES & CONSTANTS**

### **5.1 Type Definitions**

| File                                             | Chức năng                                           | Status    |
| ------------------------------------------------ | --------------------------------------------------- | --------- |
| `apps/client/src/types/interface1.types.ts`      | **Interface1 types** - Language, call details, etc. | ✅ Active |
| `apps/client/src/types/interface1-components.ts` | **Component types** - Props interfaces              | ✅ Active |
| `apps/client/src/types/interface1.refactored.ts` | **Refactored types** - Updated type definitions     | ✅ Active |
| `apps/client/src/types/core.ts`                  | **Core types** - Base interfaces                    | ✅ Active |

### **5.2 Constants**

| File                                               | Chức năng                                            | Status    |
| -------------------------------------------------- | ---------------------------------------------------- | --------- |
| `apps/client/src/constants/interface1Constants.ts` | **Interface1 constants** - Timeouts, delays, configs | ✅ Active |

## 🔧 **6. UTILITIES & LIBRARIES**

### **6.1 Vapi Integration**

| File                                  | Chức năng                                        | Status     |
| ------------------------------------- | ------------------------------------------------ | ---------- |
| `apps/client/src/lib/vapiOfficial.ts` | **Vapi SDK wrapper** - Official Vapi integration | ✅ Active  |
| `apps/client/src/lib/vapiSimple.ts`   | **Legacy Vapi wrapper** - Removed                | ❌ Removed |

### **6.2 API & WebSocket**

| File                                     | Chức năng                             | Status    |
| ---------------------------------------- | ------------------------------------- | --------- |
| `apps/client/src/lib/apiClient.ts`       | **API client** - HTTP requests        | ✅ Active |
| `apps/client/src/lib/vapiProxyClient.ts` | **Vapi proxy** - Proxy for Vapi calls | ✅ Active |

## 🧪 **7. TESTING & DEBUG**

### **7.1 Test Files**

| File                                             | Chức năng                          | Status    |
| ------------------------------------------------ | ---------------------------------- | --------- |
| `tests/e2e/interface1/interface1.spec.ts`        | **E2E tests** - Interface1 testing | ✅ Active |
| `tests/e2e/utils/page-objects/Interface1Page.ts` | **Page objects** - Test helpers    | ✅ Active |

### **7.2 Debug Files**

| File                                            | Chức năng                              | Status    |
| ----------------------------------------------- | -------------------------------------- | --------- |
| `apps/client/public/test-siri-button-vapi.html` | **Debug page** - Siri button testing   | ✅ Active |
| `apps/client/public/debug-vapi-flow.js`         | **Debug script** - Vapi flow debugging | ✅ Active |

## 📚 **8. DOCUMENTATION**

### **8.1 Development Docs**

| File                                              | Chức năng                                        | Status    |
| ------------------------------------------------- | ------------------------------------------------ | --------- |
| `docs/development/USER_GUEST_FLOW_ANALYSIS.md`    | **Flow analysis** - User journey documentation   | ✅ Active |
| `docs/development/CALLID_INTEGRATION_ANALYSIS.md` | **CallId analysis** - Integration documentation  | ✅ Active |
| `docs/development/FUNCTION_MERGE_SUMMARY.md`      | **Function merge** - Consolidation documentation | ✅ Active |
| `docs/legacy/INTERFACE1_REFACTOR.md`              | **Legacy docs** - Refactoring history            | ⚠️ Legacy |

## ⚠️ **9. POTENTIAL CONFLICTS & DUPLICATIONS**

### **9.1 Context Conflicts**

| Issue                                              | Files Involved                                             | Status                                    |
| -------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------- |
| **AssistantContext vs RefactoredAssistantContext** | `AssistantContext.tsx` vs `RefactoredAssistantContext.tsx` | ✅ Resolved - AssistantContext is alias   |
| **VapiContextSimple vs VapiOfficialContext**       | `VapiContextSimple.tsx` vs `VapiOfficialContext.tsx`       | ✅ Resolved - VapiOfficialContext removed |
| **VapiSimple vs VapiOfficial**                     | `vapiSimple.ts` vs `vapiOfficial.ts`                       | ✅ Resolved - VapiSimple removed          |

### **9.2 Hook Conflicts**

| Issue                                     | Files Involved                                  | Status                                     |
| ----------------------------------------- | ----------------------------------------------- | ------------------------------------------ |
| **endCall vs enhancedEndCall**            | Multiple files                                  | ✅ Resolved - Merged into single endCall() |
| **useInterface1 vs useConversationState** | `useInterface1.ts` vs `useConversationState.ts` | ✅ Resolved - Clear separation of concerns |

### **9.3 Component Conflicts**

| Issue                            | Files Involved                                    | Status                            |
| -------------------------------- | ------------------------------------------------- | --------------------------------- |
| **Interface1 vs VoiceAssistant** | `Interface1.tsx` vs `VoiceAssistant.tsx`          | ✅ Resolved - Different use cases |
| **Desktop vs Mobile layouts**    | `Interface1Desktop.tsx` vs `Interface1Mobile.tsx` | ✅ Resolved - Responsive design   |

## 🎯 **10. RECOMMENDATIONS**

### **10.1 Cleanup Needed**

1. **Remove deprecated files:**
   - `AssistantContext.tsx` (keep as alias only)
   - `VapiOfficialContext.tsx` (removed)
   - `vapiSimple.ts` (removed)

2. **Consolidate similar files:**
   - Consider merging `useInterface1.ts` and `useConversationState.ts` if logic overlaps
   - Review if both `DesktopSummaryPopup.tsx` and `MobileSummaryPopup.tsx` are needed

### **10.2 Architecture Improvements**

1. **Clear separation of concerns:**
   - Interface components (UI)
   - Context providers (State)
   - Hooks (Logic)
   - Utilities (Helpers)

2. **Consistent naming:**
   - All User/Guest related files should have clear prefixes
   - Avoid similar names that could cause confusion

### **10.3 Documentation**

1. **Update documentation:**
   - Remove references to deprecated files
   - Update flow diagrams
   - Add clear file purpose descriptions

## ✅ **11. FINAL STATUS**

### **✅ Active Files (Core Functionality):**

- **Interface Components:** 4 files
- **Voice Assistant:** 10 files
- **Contexts:** 8 files
- **Hooks:** 8 files
- **Popup System:** 9 files
- **Types & Constants:** 4 files
- **Utilities:** 4 files
- **Testing:** 2 files
- **Documentation:** 4 files

### **⚠️ Deprecated Files (To Clean Up):**

- `AssistantContext.tsx` (alias only)
- `VapiOfficialContext.tsx` (removed)
- `vapiSimple.ts` (removed)

### **✅ No Major Conflicts Found:**

- Clear separation of concerns
- Proper async/await handling
- Consistent naming conventions
- Well-documented flows

**✅ User/Guest files inventory hoàn thành! Không có conflicts nghiêm trọng, chỉ cần cleanup một số
deprecated files.** 🚀
