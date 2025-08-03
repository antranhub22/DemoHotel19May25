// Core utilities
export { cn } from './utils';

// Auth utilities
export { getAuthToken } from './authHelper';

// Vapi integration - REMOVED STATIC EXPORTS FOR CODE SPLITTING
// Use dynamic imports instead:
// const { initVapi, getVapiInstance } = await import('./vapiClient');
