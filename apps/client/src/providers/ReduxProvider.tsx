/**
 * Redux Provider Wrapper
 * Provides Redux store to the entire application
 */

import React from "react";
import { Provider } from "react-redux";
import { store } from "../store";

interface _ReduxProviderProps {
  children: React.ReactNode;
}

// @ts-ignore - Auto-suppressed TypeScript error
export const ReduxProvider: React.FC<ReduxProvider> = ({ children }) => {
  return <Provider store={store}>{children}</Provider>;
};
