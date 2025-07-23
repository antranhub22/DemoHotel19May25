// Core modules for SiriButton refactored architecture
export { DebugManager, type DebugLevel } from './DebugManager';
export {
  EmergencyStopManager,
  type EmergencyState,
} from './EmergencyStopManager';
export { CanvasRenderer, type CanvasRenderState } from './CanvasRenderer';
export {
  AnimationController,
  type AnimationState,
} from './AnimationController';
export { DimensionsManager, type DimensionsState } from './DimensionsManager';
export {
  StateManager,
  type VisualState,
  type ExternalVisualState,
} from './StateManager';

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
