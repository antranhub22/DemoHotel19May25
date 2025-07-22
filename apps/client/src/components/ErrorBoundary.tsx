import React, { Component, ReactNode, ErrorInfo } from 'react';
import { logger } from '@shared/utils/logger';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
  isRecovering: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackComponent?: React.ComponentType<{
    error?: Error;
    onRetry?: () => void;
  }>;
  onError?: (error: Error, info: ErrorInfo) => void;
  maxRetries?: number;
  autoRetryDelay?: number;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
      isRecovering: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error('🚨 [ErrorBoundary] Uncaught error in component tree:', 'Component', error);
    logger.error('🚨 [ErrorBoundary] Component stack:', 'Component', info.componentStack);

    // ✅ IMPROVED: Better error categorization
    const errorCategory = this.categorizeError(error);
    logger.debug('🔍 [ErrorBoundary] Error category:', 'Component', errorCategory);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, info);
    }

    this.setState({ errorInfo: info });

    // ✅ IMPROVED: Smart auto-retry logic based on error type
    const maxRetries = this.props.maxRetries || 2;
    if (
      this.shouldAutoRetry(error, errorCategory) &&
      this.state.retryCount < maxRetries
    ) {
      logger.debug('🔄 [ErrorBoundary] Attempting auto-recovery for:', 'Component', errorCategory);
      this.setState({ isRecovering: true });

      const delay = this.getRetryDelay(errorCategory);
      this.retryTimeoutId = setTimeout(() => {
        this.handleRetry();
      }, delay);
    }
  }

  // ✅ IMPROVED: Better error categorization
  private categorizeError(error: Error): string {
    const message = (error as Error).message.toLowerCase();
    const stack = (error as Error).stack?.toLowerCase() || '';

    if (message.includes('chunk') || message.includes('loading chunk')) {
      return 'chunk-loading';
    }
    if (message.includes('network') || message.includes('fetch')) {
      return 'network';
    }
    if (message.includes('vapi') || message.includes('webCallUrl')) {
      return 'vapi';
    }
    if (
      message.includes('hook') ||
      stack.includes('useeffect') ||
      stack.includes('usestate')
    ) {
      return 'react-hooks';
    }
    if (message.includes('render') || stack.includes('render')) {
      return 'react-render';
    }
    if (message.includes('canvas') || message.includes('siri')) {
      return 'canvas-siri';
    }

    return 'unknown';
  }

  // ✅ IMPROVED: Smart retry logic based on error category
  private shouldAutoRetry(error: Error, category: string): boolean {
    // Don't retry certain types of errors
    const nonRetryableCategories = ['react-hooks', 'canvas-siri'];
    if (nonRetryableCategories.includes(category)) {
      logger.debug('🚫 [ErrorBoundary] Non-retryable error category:', 'Component', category);
      return false;
    }

    // Retry transient errors
    const retryableCategories = [
      'chunk-loading',
      'network',
      'vapi',
      'react-render',
    ];
    return retryableCategories.includes(category);
  }

  // ✅ IMPROVED: Different retry delays for different error types
  private getRetryDelay(category: string): number {
    const delays = {
      'chunk-loading': 1000,
      network: 2000,
      vapi: 1500,
      'react-render': 500,
      unknown: 1000,
    };

    return delays[category as keyof typeof delays] || 1000;
  }

  private handleRetry = () => {
    logger.debug('🔄 [ErrorBoundary] Executing retry attempt:', 'Component', this.state.retryCount + 1);

    // ✅ IMPROVED: Clear problematic state before retry
    try {
      // Clear localStorage items that might cause issues
      const problematicKeys = [
        'conversationState',
        'interface1State',
        'vapiState',
      ];
      problematicKeys.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      logger.debug('🧹 [ErrorBoundary] Cleared problematic state', 'Component');
    } catch (cleanupError) {
      logger.warn('⚠️ [ErrorBoundary] Error during state cleanup:', 'Component', cleanupError);
    }

    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1,
      isRecovering: false,
    }));

    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = null;
    }
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallbackComponent;

      // ✅ IMPROVED: Show recovery state
      if (this.state.isRecovering) {
        return (
          <div className="flex items-center justify-center min-h-[400px] bg-gradient-to-br from-blue-50 to-white">
            <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Đang khôi phục trợ lý...
              </h3>
              <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
            </div>
          </div>
        );
      }

      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={this.state.error}
            onRetry={this.handleRetry}
          />
        );
      }

      // ✅ IMPROVED: Default fallback with better UX
      return (
        <div className="flex items-center justify-center min-h-[400px] bg-gradient-to-br from-red-50 to-white">
          <div className="text-center p-8 bg-white/90 backdrop-blur-sm rounded-2xl border border-red-200 max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Có lỗi xảy ra
            </h2>
            <p className="text-gray-600 mb-6">
              Trợ lý gặp sự cố tạm thời. Chúng tôi sẽ thử khôi phục tự động.
            </p>

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-semibold transition-all duration-200 active:scale-95"
              >
                🔄 Thử lại ({this.state.retryCount + 1}/
                {this.props.maxRetries || 2})
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full font-semibold transition-all duration-200 active:scale-95"
              >
                🔄 Tải lại trang
              </button>
            </div>

            {this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Chi tiết lỗi
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-600 overflow-auto max-h-32">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack && (
                    <>
                      {'\n\nComponent Stack:'}
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
