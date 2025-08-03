interface ScrollToTopButtonProps {
  show: boolean;
  onScrollToTop: () => void;
  onScrollToServices: () => void;
}

export const ScrollToTopButton = ({
  show,
  onScrollToTop,
  onScrollToServices,
}: ScrollToTopButtonProps): JSX.Element | null => {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      {/* Scroll to Services button - visible when hero is not visible */}
      <button
        className="bg-white/10 backdrop-blur-md p-3 rounded-full shadow-lg transition-all duration-300 hover:bg-white/20"
        onClick={onScrollToServices}
        aria-label="Scroll to services"
        title="View Services"
      >
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {/* Scroll to top button */}
      <button
        className="bg-white/10 backdrop-blur-md p-3 rounded-full shadow-lg transition-all duration-300 hover:bg-white/20"
        onClick={onScrollToTop}
        aria-label="Scroll to top"
        title="Back to Top"
      >
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
        </svg>
      </button>
    </div>
  );
};
