/**
 * Redux Store Hooks
 * Isolated hooks to avoid circular imports between store and domains
 */

import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

// Simple typed hooks without importing store types to break circular dependency
export const useAppDispatch = () => useDispatch();
export const useAppSelector: TypedUseSelectorHook<any> = useSelector;
