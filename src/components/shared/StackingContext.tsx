import React from "react";
import { Z_INDEX } from "@/constants";

interface StackingContextProps {
  layer: keyof typeof Z_INDEX;
  modifier?: number;
  children: React.ReactNode;
}

export const StackingContext: React.FC<StackingContextProps> = ({
  layer,
  modifier = 0,
  children,
}) => {
  const zIndex = Z_INDEX[layer] + modifier;

  return (
    <div className="relative" style={{ zIndex }}>
      {children}
    </div>
  );
};
