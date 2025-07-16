/* ========================================
   TYPES INDEX - CENTRALIZED TYPE EXPORTS
   ======================================== */

// ========================================
// CORE TYPES
// ========================================

export * from './core';

// ========================================
// API TYPES
// ========================================

export * from './api';

// ========================================
// UI TYPES
// ========================================

export * from './ui';

// ========================================
// INTERFACE COMPONENT TYPES
// ========================================

export * from './interface1-components';

// Interface1 specific types (avoiding conflicts)
export { 
  Interface1Props, 
  ServiceCategory, 
  SERVICE_CATEGORIES 
} from './interface1.types';

// ========================================
// LEGACY TYPES (for backwards compatibility)
// ========================================

// Note: All types are now consolidated in core.ts, api.ts, and ui.ts
// This file serves as the main export point for all types
