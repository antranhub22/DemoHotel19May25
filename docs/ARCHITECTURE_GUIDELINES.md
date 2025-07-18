# 🏗️ Architecture Guidelines - Siri System

## 📋 RESPONSIBILITY MATRIX

### Core Principle: **Single Responsibility + Clear Boundaries**

| Component | PRIMARY Responsibility | ALLOWED | FORBIDDEN |
|-----------|----------------------|---------|-----------|
| **SiriButton.ts** | Visual rendering & animations | Canvas operations, Drawing methods, Animation loops, Color management | Event handling, Business logic, API calls, React lifecycle |
| **SiriCallButton.tsx** | Event handling & business logic | Touch/click events, Device detection, Business callbacks, React hooks | Canvas drawing, Direct visual effects, DOM manipulation of canvas |
| **SiriButtonContainer.tsx** | Layout & theming | UI composition, Language themes, Container styling, Button positioning | Event handling, Canvas operations, Direct touch events |
| **index.ts** | Module interface | Exports, Type definitions | Implementation logic, Business logic |

---

## 🔧 CHANGE DECISION TREE

### When making changes, follow this decision tree:

```
🤔 What am I changing?
├── Visual effects / Canvas drawing / Animations
│   └── ✅ EDIT: SiriButton.ts ONLY
│       └── ⚠️  FORBIDDEN: Don't add event listeners
├── Event handling / Touch events / Business logic
│   └── ✅ EDIT: SiriCallButton.tsx ONLY
│       └── ⚠️  FORBIDDEN: Don't draw on canvas directly
├── Layout / Styling / Theme colors
│   └── ✅ EDIT: SiriButtonContainer.tsx ONLY
│       └── ⚠️  FORBIDDEN: Don't handle events directly
├── Module exports / Types
│   └── ✅ EDIT: index.ts ONLY
└── Adding new functionality?
    └── 🔍 ANALYZE: Which component's responsibility?
        ├── Visual? → SiriButton.ts
        ├── Interaction? → SiriCallButton.tsx
        ├── Layout? → SiriButtonContainer.tsx
        └── 🚨 Multiple components? → DESIGN REVIEW NEEDED
```

---

## 🚫 ANTI-PATTERNS TO AVOID

### ❌ NEVER DO THESE:

1. **Event Handling in SiriButton.ts**
   ```typescript
   // ❌ WRONG
   container.addEventListener('click', handler);
   container.addEventListener('touchstart', handler);
   ```

2. **Canvas Drawing in SiriCallButton.tsx**
   ```typescript
   // ❌ WRONG
   const canvas = document.createElement('canvas');
   ctx.fillRect(x, y, width, height);
   ```

3. **Business Logic in SiriButton.ts**
   ```typescript
   // ❌ WRONG
   async function startCall() { await api.call(); }
   onCallStart?.();
   ```

4. **Direct DOM Events in SiriButtonContainer.tsx**
   ```typescript
   // ❌ WRONG
   <div onClick={handleDirectClick}>
   element.addEventListener('touchstart', ...);
   ```

---

## ✅ CORRECT PATTERNS

### 1. **Visual Changes → SiriButton.ts**
```typescript
// ✅ CORRECT: Pure visual methods
public setVisualMode(mode: VisualMode): void {
  this.updateAnimations(mode);
  this.redraw();
}

private drawVisualEffect(): void {
  // Canvas drawing only
}
```

### 2. **Event Changes → SiriCallButton.tsx**
```typescript
// ✅ CORRECT: Event handling + control SiriButton
const handleTouch = useCallback((e: TouchEvent) => {
  // Business logic
  if (shouldStartCall) await onCallStart();
  
  // Control visual via public interface
  buttonRef.current?.setVisualMode('active');
}, []);
```

### 3. **Layout Changes → SiriButtonContainer.tsx**
```typescript
// ✅ CORRECT: Layout + theming only
return (
  <div style={dynamicTheme}>
    <SiriCallButton 
      onCallStart={businessCallback}
      colors={themeColors}
    />
  </div>
);
```

---

## 🔄 COMMUNICATION PATTERNS

### **Allowed Communication Flow:**
```
SiriButtonContainer → SiriCallButton → SiriButton
     (props)           (public methods)

❌ NEVER: SiriButton → SiriCallButton (upward dependency)
❌ NEVER: Direct DOM manipulation across components
```

### **Adding New Features Decision Matrix:**

| Feature Type | Primary File | Secondary Changes | Validation Required |
|--------------|-------------|-------------------|-------------------|
| New visual effect | SiriButton.ts | None | Visual-only check |
| New interaction type | SiriCallButton.tsx | Public interface in SiriButton.ts | Event-flow check |
| New layout option | SiriButtonContainer.tsx | Props in SiriCallButton.tsx | Layout-only check |
| New color theme | SiriButtonContainer.tsx | Color handling in SiriButton.ts | Theme-only check |

---

## 🎯 ARCHITECTURE VALIDATION CHECKLIST

Before committing changes, verify:

- [ ] ✅ Each file maintains its primary responsibility
- [ ] ✅ No event handling in SiriButton.ts
- [ ] ✅ No canvas drawing in SiriCallButton.tsx  
- [ ] ✅ No direct event handling in SiriButtonContainer.tsx
- [ ] ✅ Communication follows one-way flow
- [ ] ✅ No circular dependencies
- [ ] ✅ Public interfaces are minimal and clear
- [ ] ✅ Changes don't break mobile/desktop separation

---

## 🚨 RED FLAGS - IMMEDIATE REVIEW NEEDED

If you find yourself wanting to:
- Add event listeners in SiriButton.ts → ❌ STOP - Use SiriCallButton.tsx
- Draw on canvas in SiriCallButton.tsx → ❌ STOP - Use SiriButton.ts public interface
- Handle touch events in SiriButtonContainer.tsx → ❌ STOP - Use SiriCallButton.tsx
- Access DOM directly across components → ❌ STOP - Redesign communication

**When in doubt → ASK: "Does this belong to this component's PRIMARY responsibility?"** 