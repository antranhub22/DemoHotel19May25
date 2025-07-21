import React from 'react';
import { InterfaceContainer } from './InterfaceContainer';
import { InterfaceHeader } from './InterfaceHeader';
import { logger } from '@shared/utils/logger';

interface Interface1ErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
}

export const Interface1ErrorFallback: React.FC<
  Interface1ErrorFallbackProps
> = ({ error, onRetry }) => {
  const handleReturnToInitial = () => {
    try {
      // Clear any problematic state
      localStorage.removeItem('conversationState');
      sessionStorage.removeItem('interface1State');

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Reload the page to reset all state
      if (onRetry) {
        onRetry();
      } else {
        window.location.reload();
      }
    } catch (resetError) {
      logger.error('Failed to reset Interface1', 'Interface1ErrorFallback', resetError);
      window.location.reload();
    }
  };

  return (
    <InterfaceContainer>
      <div className="relative">
        <InterfaceHeader />

        <div className="relative min-h-[400px] px-4 flex items-center justify-center">
          <div className="max-w-md text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Trợ lý tạm thời gặp sự cố
            </h2>
            <p className="text-white/80 mb-6">
              Đừng lo lắng! Chúng tôi sẽ khôi phục trợ lý về trạng thái ban đầu.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleReturnToInitial}
                className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-semibold transition-all duration-200 active:scale-95"
              >
                🔄 Khôi phục trợ lý
              </button>

              <button
                onClick={() => (window.location.href = '/')}
                className="w-full px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-full font-semibold transition-all duration-200 active:scale-95"
              >
                🏠 Về trang chủ
              </button>
            </div>

            {error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-white/60 hover:text-white/80">
                  Chi tiết kỹ thuật
                </summary>
                <pre className="mt-2 p-3 bg-black/20 rounded text-xs text-white/70 overflow-auto max-h-32">
                  {error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>
    </InterfaceContainer>
  );
};
