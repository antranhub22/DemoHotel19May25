// Core modules for SiriButton refactored architecture
export { DebugManager, type DebugLevel } from './DebugManager.ts';
export {
  EmergencyStopManager,
  type EmergencyState,
} from './EmergencyStopManager.ts';
export { CanvasRenderer, type CanvasRenderState } from './CanvasRenderer.ts';
export {
  AnimationController,
  type AnimationState,
} from './AnimationController.ts';
export { DimensionsManager, type DimensionsState } from './DimensionsManager.ts';
export {
  StateManager,
  type VisualState,
  type ExternalVisualState,
} from './StateManager.ts';

// Module metadata for debugging and introspection
export const SIRI_MODULES = {
  DEBUG: 'DebugManager',
  EMERGENCY: 'EmergencyStopManager',
  RENDERER: 'CanvasRenderer',
  ANIMATION: 'AnimationController',
  DIMENSIONS: 'DimensionsManager',
  STATE: 'StateManager',
} as const;

export type SiriModuleName = (typeof SIRI_MODULES)[keyof typeof SIRI_MODULES];
