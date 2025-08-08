export const Z_INDEX = {
  // Base layers
  hide: -1,
  base: 0,
  content: 10,

  // UI Elements
  header: 20,
  navigation: 30,

  // Interactive elements
  dropdown: 40,
  tooltip: 45,

  // Overlays
  overlay: 50,
  modal: 60,
  popup: 70,

  // Top-level elements
  notification: 80,
  voiceAssistant: 90,
  debugTools: 100,
} as const;
