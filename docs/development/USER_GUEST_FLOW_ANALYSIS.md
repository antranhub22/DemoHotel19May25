# User/Guest Flow Analysis - Siri Button to Summary Popup

## 🔍 **Phân tích luồng xử lý cho Stakeholder User/Guest**

### **📋 Tổng quan:**

Luồng xử lý từ lúc user nhấn nút Siri đến khi hoàn thành hiển thị Summary popup cho stakeholder
User/Guest.

## 🎯 **Complete User Flow:**

### **1. 🎯 User Interaction (Siri Button Click)**

#### **1.1 Siri Button Container (`SiriButtonContainer.tsx`)**

```typescript
// User clicks/touches Siri button
<SiriCallButton
  containerId="main-siri-button"
  isListening={isCallStarted}
  volumeLevel={micLevel}
  onCallStart={() => protectedOnCallStart(language)}
  onCallEnd={onCallEnd}
  language={language}
  colors={currentColors}
/>
```

#### **1.2 Siri Call Button (`SiriCallButton.tsx`)**

```typescript
// Unified touch/click handler for both mobile and desktop
const handleDirectTouch = useCallback(
  async (e: any) => {
    if (e.type !== 'touchend' && e.type !== 'click') return;

    // Prevent if already handling
    if (isHandlingClick.current) return;

    await handleCallAction(); // Calls onCallStart or onCallEnd
  },
  [handleCallAction, isHandlingClick]
);
```

#### **1.3 Siri Button State (`useSiriButtonState.ts`)**

```typescript
const handleCallAction = useCallback(async () => {
  if (!isListening && onCallStart) {
    // Start call
    setStatus('listening');
    await onCallStart();
  } else if (isListening && onCallEnd) {
    // End call
    setStatus('processing');
    onCallEnd();
  }
}, [isListening, onCallStart, onCallEnd]);
```

### **2. 🚀 Call Start Flow**

#### **2.1 Interface1 Hook (`useInterface1.ts`)**

```typescript
// Passes call handlers to SiriButtonContainer
const {
  isCallStarted,
  showConversation,
  handleCallStart,
  handleCallEnd,
} = conversationState;

<SiriButtonContainer
  onCallStart={async lang => {
    await handleCallStart(lang);
  }}
  onCallEnd={handleCallEnd}
/>
```

#### **2.2 Conversation State (`useConversationState.ts`)**

```typescript
const handleCallStart = useCallback(
  async (lang: Language) => {
    // Check environment and credentials
    const forceVapiInDev = import.meta.env.VITE_FORCE_VAPI_IN_DEV === 'true';
    const hasVapiCredentials =
      import.meta.env.VITE_VAPI_PUBLIC_KEY && import.meta.env.VITE_VAPI_ASSISTANT_ID;

    if (isDevelopment && !forceVapiInDev && !hasVapiCredentials) {
      // DEV MODE: Mock call with simulated transcripts
      setIsCallStarted(true);
      setManualCallStarted(true);
      setLanguage(lang);

      // Generate mock conversation
      const mockConversation = [
        { role: 'user', content: 'Xin chào, tôi muốn đặt room service' },
        { role: 'assistant', content: 'Chào bạn! Tôi có thể giúp bạn đặt room service...' },
        // ... more mock messages
      ];

      // Add mock transcripts with timing
      mockConversation.forEach((msg, index) => {
        setTimeout(() => {
          addTranscript({
            callId: mockCallId,
            content: msg.content,
            role: msg.role as 'user' | 'assistant',
            tenantId: 'tenant-default',
          });
        }, msg.delay);
      });

      return { success: true };
    }

    // PRODUCTION MODE: Real VAPI call
    setIsCallStarted(true);
    setManualCallStarted(true);
    await startCall(lang); // Calls VapiContextSimple.startCall()
    setLanguage(lang);

    return { success: true };
  },
  [startCall, setLanguage, addTranscript]
);
```

#### **2.3 Vapi Context (`VapiContextSimple.tsx`)**

```typescript
const startCall = async (language: string = 'en', assistantId?: string) => {
  // Initialize VapiOfficial with credentials
  const config: VapiOfficialConfig = {
    publicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY,
    assistantId: assistantIds[language] || assistantIds.en,
    onCallStart: () => {
      setIsCallActive(true);
      hadActiveCallRef.current = true;
      setMicLevel(0);
      // ✅ NEW: Use temporary call ID, will be updated when Vapi provides real callId
      const tempCallId = `temp-call-${Date.now()}`;
      setCurrentCallId(tempCallId);
    },
    onMessage: message => {
      if (message.type === 'transcript') {
        // ✅ NEW: Update callId if Vapi provides real callId
        if (message.call?.id && message.call.id !== currentCallId) {
          setCurrentCallId(message.call.id);
        }

        // Add transcript to context
        addTranscript({
          callId: currentCallId,
          content: message.transcript,
          role: message.role as 'user' | 'assistant',
          tenantId: getTenantId(),
        });
      }
    },
    onCallEnd: () => {
      // Call ended - will trigger summary popup
    },
  };

  // Start Vapi call
  await vapiClient.startCall(language, assistantId);
};
```

### **3. 🎤 Active Call State**

#### **3.1 Real-time Conversation Display**

```typescript
// Conversation state updates
useEffect(() => {
  const isActive = callDuration > 0;
  const shouldShowConversation = isActive || transcripts.length > 0 || manualCallStarted;

  if (showConversation !== shouldShowConversation) {
    setShowConversation(shouldShowConversation);
  }
}, [transcripts.length, manualCallStarted, callDuration]);

// Auto scroll to conversation
useEffect(() => {
  if (showConversation && conversationRef.current) {
    setTimeout(() => {
      conversationRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }, INTERFACE_CONSTANTS.AUTO_SCROLL_DELAY);
  }
}, [showConversation]);
```

#### **3.2 Transcript Processing**

```typescript
// Each transcript message updates UI
const addTranscript = useCallback(
  (transcript: TranscriptData) => {
    setTranscripts(prev => [...prev, transcript]);

    // Update call details
    setCallDetails(prev => ({
      id: transcript.callId,
      roomNumber: prev?.roomNumber || 'Unknown',
      duration: prev?.duration || '0:00',
      category: 'voice-assistant',
      language: language as Language,
      transcript: transcript.content,
      role: transcript.role,
    }));
  },
  [language]
);
```

### **4. 🛑 Call End Flow**

#### **4.1 User Ends Call (Siri Button)**

```typescript
// User clicks Siri button again to end call
const handleCallAction = useCallback(async () => {
  if (isListening && onCallEnd) {
    setStatus('processing');
    onCallEnd(); // Calls useConversationState.handleCallEnd()
  }
}, [isListening, onCallEnd]);
```

#### **4.2 Conversation State End Call (`useConversationState.ts`)**

```typescript
const handleCallEnd = useCallback(() => {
  // Step 1: Stop VAPI call
  try {
    endCall(); // Calls VapiContextSimple.endCall()
  } catch (endCallError) {
    // Continue with state cleanup even if endCall fails
  }

  // Step 2: Update UI state
  setIsCallStarted(false);
  setManualCallStarted(false);

  // Step 3: Check development mode
  if (isDevelopment && !forceVapiInDev && !hasVapiCredentials) {
    // DEV MODE: Simulated call end
    return;
  }

  // PRODUCTION MODE: Real call end completed
}, [endCall, isCallStarted]);
```

#### **4.3 Vapi Context End Call (`VapiContextSimple.tsx`)**

```typescript
const endCall = async (): Promise<void> => {
  try {
    if (!this._isCallActive) return;

    // Stop Vapi call
    await this.vapi.stop();
    this._isCallActive = false;

    // Clear timeout
    this.clearCallTimeout();

    // Trigger call end callback
    this.config.onCallEnd?.();

    logger.debug('✅ Call ended successfully', 'VapiOfficial');
  } catch (error) {
    logger.error('❌ Failed to end call', 'VapiOfficial', error);
    throw error;
  }
};
```

### **5. 🔄 Summary Trigger Flow**

#### **5.1 Refactored Assistant Context (`RefactoredAssistantContext.tsx`)**

```typescript
// Call end triggers enhancedEndCall
const enhancedEndCall = useCallback(async () => {
  // End Vapi call
  await vapi.endCall();
  await call.endCall();

  // Check if we have transcripts for summary
  if (transcript.transcripts.length >= 2) {
    const callId = `call-${Date.now()}`;

    // Set initial call summary
    order.setCallSummary({
      callId,
      tenantId: configuration.tenantId || 'default',
      content: '', // Will be filled by WebSocket
      timestamp: new Date(),
    });

    // ✅ NEW: Store callId globally for WebSocket integration
    if (window.storeCallId) {
      window.storeCallId(callId);
    }

    // ✅ NEW: Trigger summary popup via global function
    if (window.triggerSummaryPopup) {
      window.triggerSummaryPopup();
    }
  }
}, [call, vapi, transcript, order, configuration]);
```

#### **5.2 Confirm Handler (`useConfirmHandler.ts`)**

```typescript
// Global window function for triggering summary popup
const autoTriggerSummary = useCallback(() => {
  const popupId = showSummary(React.createElement(SummaryPopupContent), {
    title: 'Processing Call Summary',
    priority: 'high',
  });

  console.log('🎯 [DEBUG] Summary popup triggered with ID:', popupId);
}, [showSummary]);

// Connect to global window
useEffect(() => {
  window.triggerSummaryPopup = autoTriggerSummary;
  window.updateSummaryPopup = updateSummaryPopup;
  window.resetSummarySystem = resetSummarySystem;
  window.storeCallId = storeCallId;

  return () => {
    delete window.triggerSummaryPopup;
    delete window.updateSummaryPopup;
    delete window.resetSummarySystem;
    delete window.storeCallId;
  };
}, [autoTriggerSummary, updateSummaryPopup, resetSummarySystem, storeCallId]);
```

### **6. 📋 Summary Processing Flow**

#### **6.1 Server Webhook Processing (`webhook.ts`)**

```typescript
// Vapi sends webhook to server
router.post('/webhook/vapi', async (req, res) => {
  const message = req.body;
  const callId = message?.call?.id || `call-${Date.now()}`;

  // Step 1: Save end-of-call-report
  if (message?.type === 'end-of-call-report') {
    await storage.addCallSummary({
      call_id: callId,
      content: JSON.stringify(message),
      room_number: message.call?.customer?.number || null,
      duration: calculatedDuration,
    });
  }

  // Step 2: Process full transcript with OpenAI
  if (transcript && transcript.length > 0) {
    const language = detectLanguage(transcript);
    const summary = await generateCallSummary(transcript, language);
    const serviceRequests = await extractServiceRequests(summary);

    // Step 3: Save OpenAI summary to database
    await storage.addCallSummary({
      call_id: callId,
      content: summary,
      room_number: extractedRoomNumber,
      duration: calculatedDuration,
    });

    // Step 4: Send WebSocket updates
    const io = (req as any).app.get('io');
    if (io) {
      // Send progression updates
      io.emit('summary-progression', {
        type: 'summary-progression',
        callId: callId,
        status: 'processing',
        progress: 25,
        currentStep: 'Receiving call data from Vapi.ai',
      });

      // Send final summary
      io.emit('call-summary-received', {
        type: 'call-summary-received',
        callId: callId,
        summary,
        serviceRequests,
        timestamp: new Date().toISOString(),
      });
    }
  }
});
```

#### **6.2 WebSocket Client Processing (`useWebSocket.ts`)**

```typescript
// Client receives WebSocket messages
newSocket.on('message', (data: any) => {
  // Summary progression updates
  if (data.type === 'summary-progression') {
    if (window.updateSummaryProgression) {
      window.updateSummaryProgression(data);
    }
  }

  // Final summary received
  if (data.type === 'call-summary-received') {
    if (window.updateSummaryPopup) {
      window.updateSummaryPopup(data.summary, data.serviceRequests);
    } else {
      // Fallback: Update assistant context directly
      if (data.summary) {
        const serverCallId = data.callId; // Vapi SDK callId
        const storedCallId = (window as any).currentCallId; // Client callId
        const finalCallId = serverCallId || storedCallId || 'unknown';

        assistant.setCallSummary({
          callId: finalCallId,
          tenantId: 'default',
          content: data.summary,
          timestamp: data.timestamp,
        });
      }
    }
  }
});
```

#### **6.3 Summary Popup Update (`useConfirmHandler.ts`)**

```typescript
const updateSummaryPopup = useCallback(
  (summary: string, serviceRequests: any[]) => {
    // Update existing summary popup with real data
    const popupId = showSummary(
      React.createElement('div', { style: { padding: '20px' } }, [
        // Summary content
        React.createElement('h4', { key: 'title' }, 'Conversation Summary'),
        React.createElement('div', { key: 'summary' }, summary),

        // Service requests
        serviceRequests && serviceRequests.length > 0
          ? React.createElement('div', { key: 'requests' }, [
              React.createElement(
                'h4',
                { key: 'requests-title' },
                `🛎️ Service Requests (${serviceRequests.length})`
              ),
              ...serviceRequests.map((req, index) =>
                React.createElement(
                  'div',
                  { key: `request-${index}` },
                  `• ${req.service}: ${req.details}`
                )
              ),
            ])
          : null,
      ]),
      {
        title: 'Call Summary',
        priority: 'high',
      }
    );

    console.log('✅ [DEBUG] Summary popup updated with real data');
  },
  [showSummary, removePopup, setCallSummary, setServiceRequests]
);
```

### **7. 🎉 Summary Popup Display**

#### **7.1 Summary Popup Content (`SummaryPopupContent.tsx`)**

```typescript
export const SummaryPopupContent: React.FC = () => {
  const { serviceRequests, language, callDetails } = useAssistant();
  const { progression, startProcessing, complete } = useSummaryProgression();

  // Auto-start processing when popup opens
  useEffect(() => {
    if (progression.status === 'idle' && !serviceRequests?.length) {
      startProcessing();
    }
  }, [progression.status, serviceRequests, startProcessing]);

  // Auto-complete when data is available
  useEffect(() => {
    if (progression.status === 'processing' && serviceRequests?.length > 0) {
      complete();
    }
  }, [progression.status, serviceRequests, complete]);

  const summary = getSummaryData();

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      {/* Progression Component */}
      {!summary.hasData && (
        <div style={{ marginBottom: '20px' }}>
          <SummaryProgression {...progression} />
        </div>
      )}

      {/* Summary Content */}
      {summary.hasData && (
        <div style={{ marginBottom: '20px' }}>
          <h4>Conversation Summary</h4>
          <div>{summary.content}</div>
        </div>
      )}

      {/* Service Requests */}
      {serviceRequests && serviceRequests.length > 0 && (
        <div>
          <h4>🛎️ Service Requests ({serviceRequests.length})</h4>
          {serviceRequests.map((req, index) => (
            <div key={index}>• {req.service}: {req.details}</div>
          ))}
        </div>
      )}
    </div>
  );
};
```

## 📊 **Flow Summary:**

### **🔄 Complete User Journey:**

1. **🎯 User clicks Siri button** → `SiriButtonContainer` → `SiriCallButton` → `useSiriButtonState`
2. **🚀 Call starts** → `useInterface1` → `useConversationState` → `VapiContextSimple`
3. **🎤 Active call** → Real-time transcript processing → UI updates
4. **🛑 User ends call** → Siri button click → `handleCallEnd` → `enhancedEndCall`
5. **📋 Summary trigger** → `RefactoredAssistantContext` → `window.triggerSummaryPopup`
6. **🔄 Server processing** → Webhook → OpenAI → Database → WebSocket
7. **📱 Client update** → WebSocket → `updateSummaryPopup` → Summary popup display
8. **🎉 Summary shown** → `SummaryPopupContent` with progression and final data

### **⚡ Key Features:**

- **✅ Auto-trigger:** Summary popup appears automatically when call ends
- **✅ Real-time progression:** Shows processing steps with progress bar
- **✅ CallId integration:** Consistent callId between client and server
- **✅ Multi-language support:** Detects and processes different languages
- **✅ Service extraction:** Automatically extracts service requests
- **✅ Responsive UI:** Works on both desktop and mobile
- **✅ Error handling:** Graceful fallbacks and error recovery

### **🎯 User Experience:**

1. **Simple interaction:** One-click call start/end
2. **Visual feedback:** Real-time conversation display
3. **Automatic summary:** No manual confirmation needed
4. **Progress indication:** Shows processing steps
5. **Complete summary:** Conversation + service requests
6. **Professional UI:** Clean, modern interface

## 🚀 **Technical Benefits:**

- **Performance:** Optimized state management and minimal re-renders
- **Reliability:** Proper error handling and fallback mechanisms
- **Scalability:** Modular architecture with clear separation of concerns
- **Maintainability:** Well-documented code with clear flow
- **Integration:** Seamless Vapi SDK integration with consistent callId

**✅ User/Guest flow hoàn thành với trải nghiệm mượt mà và chuyên nghiệp!** 🎉
