# UI Layout QA Checklist (Voice Assistant)

Run on Mobile (375x667), Tablet (768x1024), Desktop (1280x800):

## Visibility & Structure

- Interface1Mobile visible only on mobile (<640px)
- Interface1Desktop visible from ≥640px
- Header does not overlap popups

## Spacing & Sizing

- Container padding scales: px-2 / px-4 / px-6 / px-8
- Services grid section spacing: mt-8 / mt-12 / mt-16
- No content touches viewport edges

## Grids

- ServiceGrid columns: 2 / 3 / 4 / 5 across sm / md / lg / xl
- Grid gaps scale: gap-3 / gap-4 / gap-6
- Mobile list items have consistent rhythm

## Popups & Overlays

- RealtimeConversationPopup (desktop) fits column width
- Mobile bottom sheet animates without layout shift
- Summary popup above overlays and dismissible

## Z-Index Layers

- Siri button above content but below summary modals
- Notifications visible above content, not masking modals

## Reduced Motion

- With OS "Reduce Motion":
  - Siri button transitions simplified
  - Grid hover/scale disabled
  - Popup header blur disabled

## CLS / Stability

- Switching breakpoints does not shift content unexpectedly
- Opening/closing popups does not push content vertically

## Cross-Browser

- Verify Chrome / Safari / Firefox latest
- Check iOS Safari (overflow & blur)

## Accessibility

- Siri button keyboard-operable (Enter/Space), aria-pressed correct
- Popup close buttons keyboard-reachable with labels

Record issues with viewport, steps to reproduce, screenshots.
