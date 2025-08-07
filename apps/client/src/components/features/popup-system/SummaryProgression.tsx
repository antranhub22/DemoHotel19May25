import * as React from 'react';
import { AlertCircle, CheckCircle, Clock, Loader } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface SummaryProgressionProps {
  status: 'processing' | 'completed' | 'error' | 'idle';
  progress?: number; // 0-100
  currentStep?: string;
  totalSteps?: number;
  currentStepIndex?: number;
  estimatedTime?: number; // seconds
  errorMessage?: string;
}

export const SummaryProgression: React.FC<SummaryProgressionProps> = ({ status = 'idle', progress = 0, currentStep = '', totalSteps = 4, currentStepIndex = 0, estimatedTime = 30, errorMessage = '' }) => {
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (status === 'processing') {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      setTimeElapsed(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  // Define steps for summary generation
  const steps = [
    { name: 'Receiving Call Data', icon: '📞' },
    { name: 'Processing Transcript', icon: '🔄' },
    { name: 'Generating Summary', icon: '📝' },
    { name: 'Extracting Requests', icon: '🛎️' },
  ];

  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (status === 'completed') return 100;
    if (status === 'error') return 0;
    if (status === 'idle') return 0;

    // Calculate based on current step
    const stepProgress = (currentStepIndex / totalSteps) * 100;
    const stepInternalProgress = progress / totalSteps;
    return Math.min(stepProgress + stepInternalProgress, 100);
  };

  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'processing':
        return <Loader className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = getProgressPercentage();

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Status Header */}
      <div
        className={`flex items-center gap-3 p-4 rounded-lg border ${getStatusColor()}`}
      >
        {getStatusIcon()}
        <div className="flex-1">
          <h3 className="font-semibold text-sm">
            {status === 'completed' && 'Summary Generated'}
            {status === 'processing' && 'Generating Summary'}
            {status === 'error' && 'Generation Failed'}
            {status === 'idle' && 'Waiting for Call Data'}
          </h3>
          <p className="text-xs opacity-75">
            {status === 'processing' &&
              `${formatTime(timeElapsed)} / ~${formatTime(estimatedTime)}`}
            {status === 'completed' && 'Ready to review'}
            {status === 'error' && errorMessage}
            {status === 'idle' && 'Call in progress...'}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-gray-700">Progress</span>
          <span className="text-xs text-gray-500">
            {Math.round(progressPercentage)}%
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Steps Progress */}
      {status === 'processing' && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-700">
              Current Step
            </span>
            <span className="text-xs text-gray-500">
              {currentStepIndex + 1} of {totalSteps}
            </span>
          </div>

          <div className="space-y-2">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-2 rounded-md transition-all duration-200 ${
                  index < currentStepIndex
                    ? 'bg-green-50 text-green-700'
                    : index === currentStepIndex
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-gray-50 text-gray-500'
                }`}
              >
                <span className="text-sm">{step.icon}</span>
                <span className="text-xs font-medium flex-1">{step.name}</span>
                {index < currentStepIndex && (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                )}
                {index === currentStepIndex && status === 'processing' && (
                  <Loader className="w-4 h-4 text-blue-600 animate-spin" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Step Info */}
      {status === 'processing' && currentStep && (
        <div className="mt-3 p-3 bg-blue-50 rounded-md">
          <p className="text-xs text-blue-700 font-medium">Current Activity</p>
          <p className="text-xs text-blue-600 mt-1">{currentStep}</p>
        </div>
      )}

      {/* Completion Message */}
      {status === 'completed' && (
        <div className="mt-3 p-3 bg-green-50 rounded-md">
          <p className="text-xs text-green-700 font-medium">✅ Summary Ready</p>
          <p className="text-xs text-green-600 mt-1">
            Your call summary has been generated successfully and is ready for
            review.
          </p>
        </div>
      )}

      {/* Error Message */}
      {status === 'error' && errorMessage && (
        <div className="mt-3 p-3 bg-red-50 rounded-md">
          <p className="text-xs text-red-700 font-medium">
            ❌ Generation Failed
          </p>
          <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
        </div>
      )}
    </div>
  );
};
