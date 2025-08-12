import React from "react";
import { ANIMATIONS } from "@/constants";

interface PerformanceWrapperProps {
  children: React.ReactNode;
}

export const PerformanceWrapper: React.FC<PerformanceWrapperProps> = ({
  children,
}) => {
  return (
    <div
      style={{
        willChange: "transform",
        backfaceVisibility: "hidden",
        transform: ANIMATIONS.transform.gpu,
      }}
    >
      {children}
    </div>
  );
};
