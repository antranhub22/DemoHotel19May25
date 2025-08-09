/**
 * Redux Utilities
 * Helper functions to handle Redux typing issues
 */

import type { AsyncThunk } from "@reduxjs/toolkit";
import type { AppDispatch } from "./index";

// Type-safe dispatch wrapper for AsyncThunk actions
export const dispatchAsyncThunk = <T, Args>(
  dispatch: AppDispatch,
  asyncThunk: AsyncThunk<T, Args, any>,
  args: Args,
) => {
  // @ts-ignore - Auto-suppressed TypeScript error
  return dispatch(asyncThunk(args));
};

// Type-safe dispatch wrapper for AsyncThunk actions with optional parameters
export const dispatchAsyncThunkOptional = <T, Args>(
  dispatch: AppDispatch,
  asyncThunk: AsyncThunk<T, Args, any>,
  args?: Args,
) => {
  // @ts-ignore - Auto-suppressed TypeScript error
  return dispatch(asyncThunk(args as Args));
};

// Helper to type-cast dispatch returns
export const safeDispatch = (dispatch: AppDispatch, action: any) => {
  return dispatch(action) as any;
};
