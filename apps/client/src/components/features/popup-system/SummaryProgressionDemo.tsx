import * as React from 'react';
import { useEffect, useState } from 'react';
import { SummaryProgression } from './SummaryProgression.tsx';

export 
interface SummaryProgressionDemoProps {
  className?: string;
  children?: React.ReactNode;
  // TODO: Add specific props for SummaryProgressionDemo
}

const SummaryProgressionDemo: React.FC<SummaryProgressionDemoProps> = () => {
  const [status, setStatus] = useState<
    'idle' | 'processing' | 'completed' | 'error'
  >('idle');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = [
    'Receiving call data from Vapi.ai',
    'Processing transcript with OpenAI',
    'Generating comprehensive summary',
    'Extracting service requests',
  ];

  useEffect(() => {
    if (status === 'processing') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setStatus('completed');
            return 100;
          }
          return prev + 10;
        });
      }, 1000);

      const stepInterval = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= steps.length - 1) {
            return prev;
          }
          setCurrentStep(steps[prev + 1]);
          return prev + 1;
        });
      }, 3000);

      return () => {
        clearInterval(interval);
        clearInterval(stepInterval);
      };
    }
  }, [status, steps]);

  const startDemo = () => {
    setStatus('processing');
    setProgress(0);
    setCurrentStepIndex(0);
    setCurrentStep(steps[0]);
  };

  const resetDemo = () => {
    setStatus('idle');
    setProgress(0);
    setCurrentStepIndex(0);
    setCurrentStep('');
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Summary Progression Demo</h2>
        <div className="flex gap-2">
          <button
            onClick={startDemo}
            disabled={status === 'processing'}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Start Processing
          </button>
          <button
            onClick={resetDemo}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Reset
          </button>
        </div>
      </div>

      <SummaryProgression
        status={status}
        progress={progress}
        currentStep={currentStep}
        totalSteps={steps.length}
        currentStepIndex={currentStepIndex}
        estimatedTime={30}
        errorMessage=""
      />
    </div>
  );
};
