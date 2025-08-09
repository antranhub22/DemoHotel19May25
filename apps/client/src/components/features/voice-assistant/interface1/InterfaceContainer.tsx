import { ReactNode } from "react";
import { INTERFACE_CONSTANTS } from "@/constants/interface1Constants";
import { designSystem } from "@/styles/designSystem";

interface InterfaceContainerProps {
  children: ReactNode;
  className?: string;
}

export const InterfaceContainer = ({
  children,
  className = "",
}: InterfaceContainerProps): JSX.Element => {
  return (
    <div
      className={`relative min-h-screen w-full scroll-smooth overflow-y-auto ${className}`}
      style={{
        fontFamily: designSystem.fonts.primary,
        backgroundColor: INTERFACE_CONSTANTS.COLORS.BACKGROUND,
      }}
    >
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-8 md:space-y-12">
          {children}
        </div>
      </div>
    </div>
  );
};
