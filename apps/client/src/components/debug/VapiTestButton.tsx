import {
  createSimpleVapiClient,
  getSimpleVapiClient,
  type SimpleVapiConfig,
} from '@/lib/simpleVapiClient';
import { logger } from '@shared/utils/logger';
import React, { useEffect, useState } from 'react';

const VapiTestButton: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-10), `[${timestamp}] ${message}`]);
    logger.debug(message, 'VapiTestButton');
  };

  const config: SimpleVapiConfig = {
    publicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY || '',
    assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID || '',
  };

  const checkEnvironmentVars = (): boolean => {
    if (!config.publicKey) {
      setError('VITE_VAPI_PUBLIC_KEY not found in environment variables');
      addLog('❌ Missing VITE_VAPI_PUBLIC_KEY');
      return false;
    }
    if (!config.assistantId) {
      setError('VITE_VAPI_ASSISTANT_ID not found in environment variables');
      addLog('❌ Missing VITE_VAPI_ASSISTANT_ID');
      return false;
    }
    addLog('✅ Environment variables found');
    return true;
  };

  const handleInitialize = async () => {
    if (!checkEnvironmentVars()) return;

    setIsLoading(true);
    setError(null);

    try {
      addLog('🚀 Initializing Vapi...');

      const client = createSimpleVapiClient(config);
      await client.initialize();

      setIsInitialized(true);
      addLog('✅ Vapi initialized successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      addLog(`❌ Initialization failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartCall = async () => {
    const client = getSimpleVapiClient();
    if (!client) {
      setError('Vapi not initialized');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      addLog('📞 Starting call...');

      const call = await client.startCall();
      setIsCallActive(true);
      addLog(`✅ Call started: ${call?.id || 'unknown'}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      addLog(`❌ Call start failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopCall = () => {
    const client = getSimpleVapiClient();
    if (!client) return;

    try {
      addLog('🛑 Stopping call...');
      client.stopCall();
      setIsCallActive(false);
      addLog('✅ Call stopped');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      addLog(`❌ Stop call failed: ${errorMessage}`);
    }
  };

  // Check call status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const client = getSimpleVapiClient();
      if (client) {
        const isActive = client.isActive();
        if (isActive !== isCallActive) {
          setIsCallActive(isActive);
          addLog(
            isActive ? '📞 Call became active' : '📴 Call became inactive'
          );
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isCallActive]);

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🎙️ Vapi Integration Test</h2>

      {/* Environment Info */}
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Environment Info:</h3>
        <div className="text-sm">
          <div>
            Public Key:{' '}
            {config.publicKey
              ? `${config.publicKey.substring(0, 15)}...`
              : '❌ Not Set'}
          </div>
          <div>
            Assistant ID:{' '}
            {config.assistantId
              ? `${config.assistantId.substring(0, 15)}...`
              : '❌ Not Set'}
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleInitialize}
          disabled={isInitialized || isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading && !isInitialized
            ? '⏳ Initializing...'
            : '🚀 Initialize Vapi'}
        </button>

        <button
          onClick={handleStartCall}
          disabled={!isInitialized || isCallActive || isLoading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          {isLoading && isInitialized ? '⏳ Starting...' : '📞 Start Call'}
        </button>

        <button
          onClick={handleStopCall}
          disabled={!isCallActive}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
        >
          🛑 Stop Call
        </button>
      </div>

      {/* Status */}
      <div className="mb-4">
        <div
          className={`px-3 py-1 rounded text-sm ${
            isInitialized
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          Status:{' '}
          {isInitialized
            ? isCallActive
              ? '📞 Call Active'
              : '✅ Ready'
            : '⏳ Not Initialized'}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Logs */}
      <div className="bg-black text-green-400 p-3 rounded h-40 overflow-y-auto font-mono text-sm">
        <div className="font-bold mb-2">📋 Activity Log:</div>
        {logs.length === 0 && (
          <div className="text-gray-500">No activity yet...</div>
        )}
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        💡 Open DevTools Console to see detailed logs
      </div>
    </div>
  );
};

export default VapiTestButton;
