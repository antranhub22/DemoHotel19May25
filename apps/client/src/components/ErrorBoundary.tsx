import React, { Component, ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, retryCount: 0 };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('🚨 [ErrorBoundary] Uncaught error in component tree:', error);
    console.error('🚨 [ErrorBoundary] Component stack:', info.componentStack);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, info);
    }
    
    // Auto-retry for certain types of errors (like temporary state issues)
    if (this.shouldAutoRetry(error) && this.state.retryCount < 2) {
      console.log('🔄 [ErrorBoundary] Attempting auto-recovery...');
      this.retryTimeoutId = setTimeout(() => {
        this.handleRetry();
      }, 1000);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  shouldAutoRetry = (error: Error): boolean => {
    // Auto-retry for certain recoverable errors
    const recoverableErrors = [
      'ChunkLoadError',
      'Loading chunk',
      'Failed to import',
      'NetworkError',
      'TypeError: Failed to fetch'
    ];
    
    return recoverableErrors.some(pattern => 
      error.message.includes(pattern) || error.name.includes(pattern)
    );
  };

  handleRetry = () => {
    console.log('🔄 [ErrorBoundary] Retrying after error...');
    this.setState(prevState => ({ 
      hasError: false, 
      error: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleResetToHome = () => {
    console.log('🏠 [ErrorBoundary] Resetting to home state...');
    
    try {
      // Clear any problematic state
      localStorage.removeItem('lastInterface');
      sessionStorage.clear();
      
      // Reset to home page
      window.location.href = '/';
    } catch (resetError) {
      console.error('🚨 [ErrorBoundary] Failed to reset to home:', resetError);
      // Last resort: full reload
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback component if provided
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent;
      }

      return (
        <div className="flex items-center justify-center h-screen p-4 bg-gray-50">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Tạm thời có lỗi</h1>
            <p className="text-gray-700 mb-4">
              Có lỗi không mong muốn xảy ra. Đừng lo lắng, chúng tôi sẽ đưa bạn về trang chủ.
            </p>
            
            <div className="space-y-3">
              {this.state.retryCount < 3 && (
                <button
                  onClick={this.handleRetry}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Thử lại ({3 - this.state.retryCount} lần còn lại)
                </button>
              )}
              
              <button
                onClick={this.handleResetToHome}
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                🏠 Về trang chủ
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                🔄 Tải lại trang
              </button>
            </div>
            
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">Chi tiết lỗi</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {this.state.error.toString()}
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