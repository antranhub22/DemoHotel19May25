import { useEffect, useState } from "react";

/**
 * Custom hook to detect mobile screen size
 * Returns true for screen widths < 768px (md breakpoint in Tailwind)
 */
export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    // Function to check if screen is mobile
    const checkIsMobile = () => {
      return window.innerWidth < 768; // Tailwind md breakpoint
    };

    // Set initial value
    setIsMobile(checkIsMobile());

    // Handle resize events
    const handleResize = () => {
      setIsMobile(checkIsMobile());
    };

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup event listener
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return isMobile;
};
