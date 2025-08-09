import React from "react";
export interface InterfaceHeaderProps {
  className?: string;
  children?: React.ReactNode;
  // TODO: Add specific props for InterfaceHeader
}

const InterfaceHeader: React.FC<InterfaceHeaderProps> = () => {
  return (
    <div className="w-full" data-testid="interface1-header">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="rounded-xl bg-white/80 dark:bg-neutral-900/70 border border-gray-200 shadow-sm p-3 md:p-4 text-center">
          <h2 className="text-gray-800 text-sm md:text-base font-medium">
            Voice assistant ready. Press Space or Enter to start speaking.
          </h2>
        </div>
      </div>
    </div>
  );
};

export { InterfaceHeader };
