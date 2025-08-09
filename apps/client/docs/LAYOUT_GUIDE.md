# Layout System Guide

This document summarizes the layout conventions implemented for the Voice Assistant UI.

## Breakpoints

- Mobile: default (<640px)
- Tablet: ≥640px (sm), ≥768px (md)
- Desktop: ≥1024px (lg), ≥1280px (xl), ≥1536px (2xl)

Usage examples:

```tsx
// Visibility
// Mobile only
<div className="block sm:hidden" />
// Desktop only
<div className="hidden sm:block" />

// Spacing & sizing
<div className="px-2 sm:px-4 md:px-6 lg:px-8" />
<div className="min-h-[300px] sm:min-h-[350px] md:min-h-[400px]" />
```

## Grid patterns

Service grid (desktop/tablet):

```tsx
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6" />
```

Mobile list:

```tsx
<div className="block md:hidden space-y-2 sm:space-y-3 px-2 sm:px-4 py-3 sm:py-4" />
```

## Z-index layering

- content: base UI
- overlay: dim background / overlays
- modal: full-screen dialogs
- popup: floating components
- notification: toast/status
- voiceAssistant: Siri button

Avoid arbitrary z-[9999]; use component structure to keep stacking contexts predictable.

## Reduced motion

- The hook `useReducedMotion()` disables heavy transitions and blur effects when the OS-level setting "Reduce motion" is enabled.
- Components adapted: `SiriButtonContainer`, `ServiceGrid`, `RealtimeConversationPopup`.

## Component responsibilities

- Interface1Desktop: 1/2/3-column grid based on sm/md breakpoints.
- Interface1Mobile: mobile-only view with overlays for conversation and summary.
- ServiceGrid: responsive grid on desktop/tablet; list on mobile.
- RealtimeConversationPopup: grid mode (desktop column) vs overlay mode (mobile bottom sheet).

## Do/Don't

- Do: use responsive utility classes instead of fixed pixels where possible.
- Do: keep min-heights responsive to prevent layout jumps.
- Don't: introduce new z-index values beyond the established layers unless necessary.
- Don't: animate layout-affecting properties when transform/opacity will do.

## Checklist for new UI

- Visibility gates (`block sm:hidden` or `hidden sm:block`) are correct.
- Grid columns and gaps scale with breakpoints.
- z-index respects layering (popup < notification < voiceAssistant).
- Reduced motion renders without large transitions/blur.
