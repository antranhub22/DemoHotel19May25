import React, { useState, useEffect } from 'react';
import { validateVapiCredentials, initVapiFix, startCallFix, resetVapiFix } from '@/lib/vapiClientFix';
import { getVapiPublicKeyByLanguage, getVapiAssistantIdByLanguage } from '@/hooks/useHotelConfiguration';
import { useHotelConfiguration } from '@/hooks/useHotelConfiguration';
import { useAssistant } from '@/context/AssistantContext';
import { logger } from '@shared/utils/logger';

interface VapiTestResult {
  step: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export const VapiTestComponent: React.FC = () => {
  const [testResults, setTestResults] = useState<VapiTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const { config: hotelConfig } = useHotelConfiguration();
  const { language } = useAssistant();

  const addTestResult = (result: VapiTestResult) => {
    setTestResults(prev => [...prev, result]);
  };

  const updateLastResult = (updates: Partial<VapiTestResult>) => {
    setTestResults(prev => {
      const newResults = [...prev];
      const lastIndex = newResults.length - 1;
      if (lastIndex >= 0) {
        newResults[lastIndex] = { ...newResults[lastIndex], ...updates };
      }
      return newResults;
    });
  };

  const runVapiTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    setCurrentStep('Starting VAPI Test');

    try {
      // Step 1: Check Environment Variables
      setCurrentStep('Checking Environment Variables');
      addTestResult({
        step: 'Environment Variables',
        status: 'pending',
        message: 'Checking VAPI environment variables...'
      });

      const publicKeyEnv = import.meta.env.VITE_VAPI_PUBLIC_KEY;
      const assistantIdEnv = import.meta.env.VITE_VAPI_ASSISTANT_ID;
      const apiKeyEnv = import.meta.env.VAPI_API_KEY;

      let envStatus: 'success' | 'warning' | 'error' = 'success';
      const envDetails = {
        hasPublicKey: !!publicKeyEnv,
        hasAssistantId: !!assistantIdEnv,
        hasApiKey: !!apiKeyEnv,
        publicKeyFormat: publicKeyEnv?.startsWith('pk_'),
        assistantIdFormat: assistantIdEnv?.startsWith('asst_'),
        hasLanguageSupport: !!(import.meta.env.VITE_VAPI_PUBLIC_KEY_VI || import.meta.env.VITE_VAPI_PUBLIC_KEY_FR)
      };

      let envMessage = 'Environment variables check completed';
      if (!publicKeyEnv || !assistantIdEnv) {
        envStatus = 'error';
        envMessage = 'Missing required VAPI environment variables';
      } else if (!envDetails.publicKeyFormat || !envDetails.assistantIdFormat) {
        envStatus = 'warning';
        envMessage = 'Invalid VAPI credential formats detected';
      }

      updateLastResult({
        status: envStatus,
        message: envMessage,
        details: envDetails
      });

      if (envStatus === 'error') {
        throw new Error('Environment variables validation failed');
      }

      // Step 2: Get Configuration Keys
      setCurrentStep('Getting VAPI Configuration');
      addTestResult({
        step: 'Configuration',
        status: 'pending',
        message: 'Retrieving VAPI configuration...'
      });

      let publicKey: string;
      let assistantId: string;

      try {
        if (hotelConfig) {
          publicKey = await getVapiPublicKeyByLanguage(language, hotelConfig);
          assistantId = await getVapiAssistantIdByLanguage(language, hotelConfig);
        } else {
          publicKey = publicKeyEnv;
          assistantId = assistantIdEnv;
        }

        updateLastResult({
          status: 'success',
          message: 'VAPI configuration retrieved successfully',
          details: {
            source: hotelConfig ? 'Hotel Configuration' : 'Environment Variables',
            language,
            publicKeyLength: publicKey?.length || 0,
            assistantIdLength: assistantId?.length || 0
          }
        });
      } catch (configError) {
        updateLastResult({
          status: 'error',
          message: `Failed to get VAPI configuration: ${configError instanceof Error ? configError.message : String(configError)}`,
          details: { error: configError }
        });
        throw configError;
      }

      // Step 3: Validate Credentials
      setCurrentStep('Validating VAPI Credentials');
      addTestResult({
        step: 'Credential Validation',
        status: 'pending',
        message: 'Validating VAPI credentials format...'
      });

      const validation = validateVapiCredentials(publicKey);
      if (!validation.isValid) {
        updateLastResult({
          status: 'error',
          message: `Credential validation failed: ${validation.error}`,
          details: validation.details
        });
        throw new Error(validation.error);
      }

      updateLastResult({
        status: 'success',
        message: 'VAPI credentials validation passed',
        details: validation.details
      });

      // Step 4: Initialize VAPI
      setCurrentStep('Initializing VAPI SDK');
      addTestResult({
        step: 'VAPI Initialization',
        status: 'pending',
        message: 'Initializing VAPI SDK...'
      });

      try {
        // Reset any existing instance first
        resetVapiFix();
        
        const vapiInstance = await initVapiFix(publicKey);
        
        updateLastResult({
          status: 'success',
          message: 'VAPI SDK initialized successfully',
          details: {
            instanceType: typeof vapiInstance,
            hasStartMethod: typeof vapiInstance?.start === 'function',
            hasStopMethod: typeof vapiInstance?.stop === 'function',
            timestamp: new Date().toISOString()
          }
        });
      } catch (initError) {
        updateLastResult({
          status: 'error',
          message: `VAPI initialization failed: ${initError instanceof Error ? initError.message : String(initError)}`,
          details: { error: initError }
        });
        throw initError;
      }

      // Step 5: Test Call Start (Optional)
      setCurrentStep('Testing Call Start');
      addTestResult({
        step: 'Call Test',
        status: 'pending',
        message: 'Testing VAPI call start...'
      });

      try {
        // Note: We don't actually start a full call, just test the call setup
        const testCall = await startCallFix(assistantId);
        
        // Immediately stop the test call
        if (testCall && typeof testCall.stop === 'function') {
          await testCall.stop();
        }

        updateLastResult({
          status: 'success',
          message: 'VAPI call test completed successfully',
          details: {
            callId: testCall?.id || 'unknown',
            callType: typeof testCall,
            timestamp: new Date().toISOString()
          }
        });
      } catch (callError) {
        const errorMessage = callError instanceof Error ? callError.message : String(callError);
        
        // Categorize the error
        let errorType = 'unknown';
        if (errorMessage.includes('authentication') || errorMessage.includes('token') || errorMessage.includes('401')) {
          errorType = 'authentication';
        } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
          errorType = 'network';
        } else if (errorMessage.includes('assistant')) {
          errorType = 'assistant';
        }

        updateLastResult({
          status: 'error',
          message: `VAPI call test failed: ${errorMessage}`,
          details: { 
            error: callError,
            errorType,
            assistantId: assistantId?.substring(0, 15) + '...'
          }
        });
        
        // Don't throw here - call test failure doesn't mean complete failure
        logger.warn('VAPI call test failed but continuing...', 'VapiTest', callError);
      }

      setCurrentStep('Test Completed');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('VAPI test failed:', 'VapiTest', error);
      
      addTestResult({
        step: 'Test Failed',
        status: 'error',
        message: `Test failed: ${errorMessage}`,
        details: { error }
      });
    } finally {
      setIsRunning(false);
      setCurrentStep('');
    }
  };

  const getStatusIcon = (status: VapiTestResult['status']) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status: VapiTestResult['status']) => {
    switch (status) {
      case 'pending':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const clearResults = () => {
    setTestResults([]);
    setCurrentStep('');
  };

  const exportResults = () => {
    const report = {
      timestamp: new Date().toISOString(),
      language,
      environment: import.meta.env.MODE,
      results: testResults,
      summary: {
        total: testResults.length,
        success: testResults.filter(r => r.status === 'success').length,
        warning: testResults.filter(r => r.status === 'warning').length,
        error: testResults.filter(r => r.status === 'error').length,
      }
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vapi-test-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🔧 VAPI Connection Test
        </h2>
        <p className="text-gray-600">
          Test your VAPI configuration and troubleshoot authentication issues
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={runVapiTest}
          disabled={isRunning}
          className={`px-6 py-2 rounded-lg font-medium ${
            isRunning
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isRunning ? '🔄 Running Test...' : '🚀 Run VAPI Test'}
        </button>

        <button
          onClick={clearResults}
          disabled={isRunning || testResults.length === 0}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          🧹 Clear Results
        </button>

        <button
          onClick={exportResults}
          disabled={isRunning || testResults.length === 0}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          📄 Export Report
        </button>
      </div>

      {currentStep && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 font-medium">
            🔄 Current Step: {currentStep}
          </p>
        </div>
      )}

      {testResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Test Results:</h3>
          
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-4 border rounded-lg ${
                result.status === 'error'
                  ? 'border-red-200 bg-red-50'
                  : result.status === 'warning'
                  ? 'border-yellow-200 bg-yellow-50'
                  : result.status === 'success'
                  ? 'border-green-200 bg-green-50'
                  : 'border-blue-200 bg-blue-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-800">
                  {getStatusIcon(result.status)} {result.step}
                </h4>
                <span className={`text-sm font-medium ${getStatusColor(result.status)}`}>
                  {result.status.toUpperCase()}
                </span>
              </div>
              
              <p className="text-gray-700 mb-2">{result.message}</p>
              
              {result.details && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                    View Details
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {testResults.length === 0 && !isRunning && (
        <div className="text-center py-8 text-gray-500">
          <p>Click "Run VAPI Test" to check your VAPI configuration</p>
        </div>
      )}
    </div>
  );
};