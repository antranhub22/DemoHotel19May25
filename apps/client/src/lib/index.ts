// Core utilities
export { cn } from './utils.ts';

// Auth utilities
export { getAuthToken } from './authHelper.ts';

// Vapi integration - REMOVED STATIC EXPORTS FOR CODE SPLITTING
// Use dynamic imports instead:
// const { initVapi, getVapiInstance } = await import('./vapiClient');
