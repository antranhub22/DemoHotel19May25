/**
 * Interface1 Hooks - Modular Architecture
 * 
 * Tách useInterface1 monolithic hook thành 5 hooks nhỏ hơn:
 * - useInterface1Layout: Quản lý refs cho layout
 * - useInterface1State: Quản lý states (loading, error, assistant data, UI)
 * - useInterface1Handlers: Quản lý event handlers (call, UI)
 * - useInterface1Scroll: Quản lý scroll behavior
 * - useInterface1Popups: Quản lý popup demo functions
 */

export { useInterface1Layout, type Interface1Layout } from './useInterface1Layout';
export { useInterface1State, type Interface1State } from './useInterface1State';
export { useInterface1Handlers, type Interface1Handlers } from './useInterface1Handlers';
export { useInterface1Scroll, type Interface1Scroll } from './useInterface1Scroll';
export { useInterface1Popups, type Interface1Popups } from './useInterface1Popups'; 