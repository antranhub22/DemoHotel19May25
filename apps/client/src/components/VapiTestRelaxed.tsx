import React, { useState, useEffect } from 'react';
import { 
  initVapiRelaxed, 
  startCallRelaxed, 
  stopCallRelaxed,
  setVapiDebugLevel,
  getVapiDebugLogs,
  getVapiStateRelaxed,
  resetVapiRelaxed 
} from '@/lib/vapiClientRelaxed';
import { getVapiPublicKeyByLanguage, getVapiAssistantIdByLanguage } from '@/hooks/useHotelConfiguration';
import { useHotelConfiguration } from '@/hooks/useHotelConfiguration';
import { useAssistant } from '@/context/AssistantContext';
import { logger } from '@shared/utils/logger';

interface TestResult {
  step: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export const VapiTestRelaxed: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [debugLogs, setDebugLogs] = useState<any[]>([]);
  const [isCallActive, setIsCallActive] = useState(false);

  const { language, currentConfig } = useHotelConfiguration();
  const { setIsListening } = useAssistant();

  useEffect(() => {
    // Set debug level to verbose for testing
    setVapiDebugLevel('verbose');
  }, []);

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result]);
  };

  const updateLastTestResult = (updates: Partial<TestResult>) => {
    setTestResults(prev => {
      const newResults = [...prev];
      if (newResults.length > 0) {
        newResults[newResults.length - 1] = { ...newResults[newResults.length - 1], ...updates };
      }
      return newResults;
    });
  };

  const refreshDebugLogs = () => {
    const logs = getVapiDebugLogs();
    setDebugLogs(logs);
  };

  const runFullTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    setCurrentStep('Starting full VAPI test...');

    try {
      // Step 1: Check Environment Variables
      setCurrentStep('1. Checking environment variables');
      addTestResult({
        step: '1. Environment Variables',
        status: 'pending',
        message: 'Checking VAPI environment variables...'
      });

      const publicKeyEnv = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || process.env.VITE_VAPI_PUBLIC_KEY;
      const assistantIdEnv = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || process.env.VITE_VAPI_ASSISTANT_ID;

      updateLastTestResult({
        status: publicKeyEnv && assistantIdEnv ? 'success' : 'warning',
        message: `Public Key: ${publicKeyEnv ? 'Present' : 'Missing'}, Assistant ID: ${assistantIdEnv ? 'Present' : 'Missing'}`,
        details: {
          publicKey: publicKeyEnv ? `${publicKeyEnv.substring(0, 10)}...` : 'Not found',
          assistantId: assistantIdEnv ? `${assistantIdEnv.substring(0, 10)}...` : 'Not found'
        }
      });

      // Step 2: Get Configuration-based credentials
      setCurrentStep('2. Getting hotel configuration credentials');
      addTestResult({
        step: '2. Hotel Configuration',
        status: 'pending',
        message: 'Getting VAPI credentials from hotel configuration...'
      });

      const publicKey = getVapiPublicKeyByLanguage(language);
      const assistantId = getVapiAssistantIdByLanguage(language);

      updateLastTestResult({
        status: publicKey && assistantId ? 'success' : 'error',
        message: `Language: ${language}, Public Key: ${publicKey ? 'Present' : 'Missing'}, Assistant ID: ${assistantId ? 'Present' : 'Missing'}`,
        details: {
          language,
          publicKey: publicKey ? `${publicKey.substring(0, 10)}...` : 'Not found',
          assistantId: assistantId ? `${assistantId.substring(0, 10)}...` : 'Not found',
          actualPublicKeyLength: publicKey?.length || 0,
          actualAssistantIdLength: assistantId?.length || 0
        }
      });

      if (!publicKey || !assistantId) {
        throw new Error('Missing VAPI credentials from configuration');
      }

      // Step 3: Initialize VAPI (Relaxed)
      setCurrentStep('3. Initializing VAPI with relaxed validation');
      addTestResult({
        step: '3. VAPI Initialization',
        status: 'pending',
        message: 'Initializing VAPI with your actual credentials...'
      });

      const initResult = await initVapiRelaxed(publicKey);
      
      updateLastTestResult({
        status: initResult.success ? 'success' : 'error',
        message: initResult.success ? 'VAPI initialized successfully' : `Failed: ${initResult.error}`,
        details: {
          success: initResult.success,
          error: initResult.error,
          hasInstance: !!initResult.instance
        }
      });

      if (!initResult.success) {
        throw new Error(initResult.error || 'Failed to initialize VAPI');
      }

      // Step 4: Test Call Start
      setCurrentStep('4. Testing call start');
      addTestResult({
        step: '4. Call Start Test',
        status: 'pending',
        message: 'Attempting to start VAPI call...'
      });

      const callResult = await startCallRelaxed(assistantId);
      
      updateLastTestResult({
        status: callResult.success ? 'success' : 'error',
        message: callResult.success ? 'Call started successfully!' : `Failed: ${callResult.error}`,
        details: {
          success: callResult.success,
          error: callResult.error,
          callId: callResult.callId
        }
      });

      if (callResult.success) {
        setIsCallActive(true);
        setIsListening(true);
        
        // Wait a bit to let the call establish
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Step 5: Test Call Stop
        setCurrentStep('5. Testing call stop');
        addTestResult({
          step: '5. Call Stop Test',
          status: 'pending',
          message: 'Stopping VAPI call...'
        });

        const stopResult = await stopCallRelaxed();
        
        updateLastTestResult({
          status: stopResult.success ? 'success' : 'warning',
          message: stopResult.success ? 'Call stopped successfully' : `Warning: ${stopResult.error}`,
          details: stopResult
        });

        setIsCallActive(false);
        setIsListening(false);
      }

      // Step 6: Get final state
      setCurrentStep('6. Getting final state');
      addTestResult({
        step: '6. Final State',
        status: 'success',
        message: 'VAPI test completed',
        details: getVapiStateRelaxed()
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('VAPI Test Error:', error);
      
      addTestResult({
        step: 'Error',
        status: 'error',
        message: `Test failed: ${errorMessage}`,
        details: error
      });
    } finally {
      setIsRunning(false);
      setCurrentStep('');
      refreshDebugLogs();
    }
  };

  const testCallOnly = async () => {
    if (isCallActive) {
      // Stop call
      setCurrentStep('Stopping call...');
      const result = await stopCallRelaxed();
      setIsCallActive(false);
      setIsListening(false);
      refreshDebugLogs();
    } else {
      // Start call
      setCurrentStep('Starting call...');
      const publicKey = getVapiPublicKeyByLanguage(language);
      const assistantId = getVapiAssistantIdByLanguage(language);

      if (!publicKey || !assistantId) {
        alert('Missing VAPI credentials. Run full test first.');
        return;
      }

      // Initialize if needed
      const initResult = await initVapiRelaxed(publicKey);
      if (!initResult.success) {
        alert(`Failed to initialize VAPI: ${initResult.error}`);
        return;
      }

      const callResult = await startCallRelaxed(assistantId);
      if (callResult.success) {
        setIsCallActive(true);
        setIsListening(true);
      } else {
        alert(`Failed to start call: ${callResult.error}`);
      }
      refreshDebugLogs();
    }
    setCurrentStep('');
  };

  const resetTest = async () => {
    await resetVapiRelaxed();
    setTestResults([]);
    setDebugLogs([]);
    setIsCallActive(false);
    setIsListening(false);
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'pending': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'pending': return '⏳';
      default: return '⭕';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          🔧 VAPI Test - Relaxed Validation (Your Format)
        </h2>

        {/* Current Configuration */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Current Configuration:</h3>
          <div className="text-sm text-blue-800">
            <p><strong>Language:</strong> {language}</p>
            <p><strong>Hotel:</strong> {currentConfig?.hotelName || 'Not set'}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={runFullTest}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? 'Running Test...' : '🔍 Run Full Test'}
          </button>

          <button
            onClick={testCallOnly}
            disabled={isRunning}
            className={`px-4 py-2 rounded-lg text-white ${
              isCallActive 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isCallActive ? '🛑 Stop Call' : '📞 Test Call'}
          </button>

          <button
            onClick={resetTest}
            disabled={isRunning}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🔄 Reset
          </button>

          <button
            onClick={refreshDebugLogs}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            📋 Refresh Logs
          </button>
        </div>

        {/* Current Step */}
        {currentStep && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              <span className="font-semibold">Current Step:</span> {currentStep}
            </p>
          </div>
        )}

        {/* Call Status */}
        {isCallActive && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">
              <span className="font-semibold">🔴 CALL ACTIVE:</span> VAPI call is running. Speak to test!
            </p>
          </div>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Test Results:</h3>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg bg-gray-50"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">{getStatusIcon(result.status)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{result.step}</span>
                        <span className={`text-sm ${getStatusColor(result.status)}`}>
                          ({result.status})
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{result.message}</p>
                      {result.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-blue-600 cursor-pointer">Show Details</summary>
                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Debug Logs */}
        {debugLogs.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Debug Logs: ({debugLogs.length})</h3>
            <div className="max-h-96 overflow-y-auto border rounded-lg bg-gray-50 p-3">
              {debugLogs.map((log, index) => (
                <div key={index} className="text-xs mb-2 border-b border-gray-200 pb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{log.timestamp}</span>
                    <span className={`font-medium ${
                      log.level === 'error' ? 'text-red-600' : 
                      log.level === 'info' ? 'text-blue-600' : 
                      'text-gray-600'
                    }`}>
                      [{log.level.toUpperCase()}]
                    </span>
                  </div>
                  <p className="text-gray-800">{log.message}</p>
                  {log.data && (
                    <pre className="text-gray-600 mt-1 overflow-auto">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Note */}
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>📝 Note:</strong> This relaxed version does NOT require your credentials to start with "pk_" or "asst_". 
            It will work with whatever format you already have that was working before.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VapiTestRelaxed;