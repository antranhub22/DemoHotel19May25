# Summary Progression Guide

## Tổng quan

Summary Progression là một tính năng mới để hiển thị tiến độ tạo summary cho user một cách chuyên
nghiệp và rõ ràng. Tính năng này giúp user hiểu được quá trình xử lý và tạo summary sau mỗi cuộc
gọi.

## Các thành phần chính

### 1. SummaryProgression Component

**File:** `apps/client/src/components/features/popup-system/SummaryProgression.tsx`

**Tính năng:**

- Hiển thị progress bar với animation
- Hiển thị các bước xử lý với icons
- Timer hiển thị thời gian đã trôi qua
- Status indicators (processing, completed, error)
- Responsive design với Tailwind CSS

**Props:**

```typescript
interface SummaryProgressionProps {
  status: 'processing' | 'completed' | 'error' | 'idle';
  progress?: number; // 0-100
  currentStep?: string;
  totalSteps?: number;
  currentStepIndex?: number;
  estimatedTime?: number; // seconds
  errorMessage?: string;
}
```

### 2. useSummaryProgression Hook

**File:** `apps/client/src/hooks/useSummaryProgression.ts`

**Tính năng:**

- Quản lý state của progression
- Auto-detect completion khi có data
- Cung cấp các methods để update progress
- Tích hợp với useAssistant context

**Methods:**

```typescript
const { progression, startProcessing, updateProgress, completeStep, setError, complete, reset } =
  useSummaryProgression();
```

## Cách sử dụng

### 1. Trong SummaryPopupContent

```typescript
import { SummaryProgression } from './SummaryProgression';
import { useSummaryProgression } from '@/hooks/useSummaryProgression';

export const SummaryPopupContent: React.FC = () => {
  const { progression, startProcessing, complete } = useSummaryProgression();

  // Auto-start khi popup mở
  useEffect(() => {
    if (progression.status === 'idle' && !serviceRequests?.length) {
      startProcessing();
    }
  }, [progression.status, serviceRequests, startProcessing]);

  // Auto-complete khi có data
  useEffect(() => {
    if (progression.status === 'processing' && serviceRequests?.length > 0) {
      complete();
    }
  }, [progression.status, serviceRequests, complete]);

  return (
    <div>
      {/* Hiển thị progression khi chưa hoàn thành */}
      {progression.status !== 'completed' && (
        <SummaryProgression
          status={progression.status}
          progress={progression.progress}
          currentStep={progression.currentStep}
          totalSteps={progression.totalSteps}
          currentStepIndex={progression.currentStepIndex}
          estimatedTime={progression.estimatedTime}
          errorMessage={progression.errorMessage}
        />
      )}

      {/* Summary content */}
    </div>
  );
};
```

### 2. WebSocket Integration

**Server-side (webhook.ts):**

```typescript
// Send progression updates
io.emit('summary-progression', {
  type: 'summary-progression',
  callId: callId,
  status: 'processing',
  progress: 25,
  currentStep: 'Receiving call data from Vapi.ai',
  currentStepIndex: 0,
  timestamp: new Date().toISOString(),
});
```

**Client-side (useWebSocket.ts):**

```typescript
// Handle progression updates
if (data.type === 'summary-progression') {
  console.log('📊 [DEBUG] WebSocket received summary-progression:', {
    callId: data.callId,
    status: data.status,
    progress: data.progress,
    currentStep: data.currentStep,
    currentStepIndex: data.currentStepIndex,
  });

  // Update progression state if available
  if (window.updateSummaryProgression) {
    window.updateSummaryProgression(data);
  }
}
```

## Các bước xử lý Summary

1. **Receiving call data from Vapi.ai** 📞
   - Nhận dữ liệu từ webhook
   - Parse call information
   - Extract transcript

2. **Processing transcript with OpenAI** 🔄
   - Gửi transcript đến OpenAI
   - Xử lý ngôn ngữ
   - Generate summary

3. **Generating comprehensive summary** 📝
   - Format summary theo template
   - Extract room number
   - Calculate duration

4. **Extracting service requests** 🛎️
   - Parse service requests từ summary
   - Categorize requests
   - Prepare for front desk

## UI/UX Features

### 1. Progress Bar

- Gradient animation từ blue đến green
- Smooth transitions
- Percentage indicator

### 2. Step Indicators

- Icons cho từng bước
- Check marks cho completed steps
- Spinning loader cho current step
- Color coding (green: completed, blue: current, gray: pending)

### 3. Status Messages

- Real-time updates
- Error handling
- Completion confirmation

### 4. Timer

- Hiển thị thời gian đã trôi qua
- Estimated time remaining
- Format: MM:SS

## Demo Component

**File:** `apps/client/src/components/features/popup-system/SummaryProgressionDemo.tsx`

Sử dụng để test và demo progression component:

```typescript
import { SummaryProgressionDemo } from './SummaryProgressionDemo';

// Trong component
<SummaryProgressionDemo />
```

## Best Practices

### 1. Performance

- Sử dụng useCallback cho event handlers
- Memoize expensive calculations
- Cleanup intervals properly

### 2. Error Handling

- Graceful degradation khi WebSocket fail
- Fallback to basic progress
- Clear error messages

### 3. Accessibility

- ARIA labels cho progress bar
- Keyboard navigation
- Screen reader support

### 4. Responsive Design

- Mobile-friendly layout
- Touch-friendly controls
- Adaptive sizing

## Testing

### 1. Unit Tests

```typescript
// Test progression states
expect(progression.status).toBe('processing');
expect(progression.progress).toBe(25);
```

### 2. Integration Tests

```typescript
// Test WebSocket integration
socket.emit('summary-progression', testData);
expect(component.progression.status).toBe('processing');
```

### 3. E2E Tests

```typescript
// Test complete flow
await startCall();
await waitForSummaryPopup();
expect(progressionElement).toBeVisible();
await waitForCompletion();
expect(progressionElement).not.toBeVisible();
```

## Troubleshooting

### 1. Progression không hiển thị

- Kiểm tra WebSocket connection
- Verify progression state
- Check component mounting

### 2. Progress không update

- Verify WebSocket messages
- Check state management
- Debug useEffect dependencies

### 3. UI không responsive

- Check Tailwind classes
- Verify CSS imports
- Test on different screen sizes

## Future Enhancements

1. **Advanced Analytics**
   - Track processing time per step
   - Performance metrics
   - Error rate monitoring

2. **Customization**
   - Configurable steps
   - Custom themes
   - Localization support

3. **Real-time Updates**
   - Live progress from server
   - WebSocket streaming
   - Push notifications

4. **Advanced UI**
   - Animated transitions
   - 3D effects
   - Micro-interactions
