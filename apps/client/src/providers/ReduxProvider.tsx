/**
 * Redux Provider Wrapper
 * Provides Redux store to the entire application
 */

import React from "react";
import { Provider } from "react-redux";
import { store } from "../store";

interface ReduxProviderProps {
  children: React.ReactNode;
}

export const ReduxProvider: React.FC<ReduxProvider> = ({ children }) => {
  return <Provider store={store}>{children}</Provider>;
};
