import * as React from 'react';
import {
  createVapiClient,
  VapiOfficial,
  VapiOfficialConfig,
} from '@/lib/vapiOfficial';
import logger from '../../../../../packages/shared/utils/logger';
import { useState } from 'react';


interface VapiTestButtonProps {
  className?: string;
  children?: React.ReactNode;
  // TODO: Add specific props for VapiTestButton
}

const VapiTestButton: React.FC<VapiTestButtonProps> = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [vapiClient, setVapiClient] = useState<VapiOfficial | null>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-10), `[${timestamp}] ${message}`]);
    logger.debug(message, 'VapiTestButton');
  };

  const config: VapiOfficialConfig = {
    publicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY || '',
    assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID || '',
    onCallStart: () => {
      setIsCallActive(true);
      addLog('📞 Call started');
    },
    onCallEnd: () => {
      setIsCallActive(false);
      addLog('📞 Call ended');
    },
    onMessage: message => {
      if (message.type === 'transcript') {
        addLog(`💬 ${message.role}: ${message.transcript.substring(0, 50)}...`);
      }
    },
    onError: error => {
      addLog(`❌ Error: ${error.message || error}`);
      setError(error.message || String(error));
    },
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
      addLog('🚀 Initializing VapiOfficial...');

      const client = createVapiClient(config);
      setVapiClient(client);
      setIsInitialized(true);

      addLog('✅ VapiOfficial initialized successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      addLog(`❌ Initialization failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartCall = async () => {
    if (!vapiClient) {
      addLog('❌ Vapi not initialized');
      return;
    }

    setIsLoading(true);
    try {
      addLog('📞 Starting call...');
      await vapiClient.startCall();
      addLog('✅ Call started successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      addLog(`❌ Call start failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndCall = async () => {
    if (!vapiClient) {
      addLog('❌ Vapi not initialized');
      return;
    }

    setIsLoading(true);
    try {
      addLog('⏹️ Ending call...');
      await vapiClient.endCall();
      addLog('✅ Call ended successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      addLog(`❌ Call end failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setError(null);
  };

  const getButtonStyle = (variant: 'primary' | 'success' | 'danger') => {
    const baseStyle =
      'px-4 py-2 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

    switch (variant) {
      case 'primary':
        return `${baseStyle} bg-blue-500 hover:bg-blue-600 text-white`;
      case 'success':
        return `${baseStyle} bg-green-500 hover:bg-green-600 text-white`;
      case 'danger':
        return `${baseStyle} bg-red-500 hover:bg-red-600 text-white`;
      default:
        return baseStyle;
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        🎙️ VapiOfficial Test Button
      </h2>

      <div className="space-y-4">
        {/* Status */}
        <div className="flex items-center space-x-4">
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              isInitialized
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {isInitialized ? '✅ Initialized' : '⚪ Not Initialized'}
          </div>

          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              isCallActive
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {isCallActive ? '📞 Call Active' : '📴 No Call'}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleInitialize}
            disabled={isLoading || isInitialized}
            className={getButtonStyle('primary')}
          >
            {isLoading ? '⏳ Initializing...' : '🚀 Initialize'}
          </button>

          <button
            onClick={handleStartCall}
            disabled={isLoading || !isInitialized || isCallActive}
            className={getButtonStyle('success')}
          >
            {isLoading ? '⏳ Starting...' : '📞 Start Call'}
          </button>

          <button
            onClick={handleEndCall}
            disabled={isLoading || !isCallActive}
            className={getButtonStyle('danger')}
          >
            {isLoading ? '⏳ Ending...' : '⏹️ End Call'}
          </button>

          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium transition-colors"
          >
            🗑️ Clear
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-500">❌</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Logs */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-gray-800 mb-2">📋 Logs</h3>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-sm text-gray-500">No logs yet...</p>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className="text-xs font-mono text-gray-700 bg-white p-2 rounded border"
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Environment Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>Public Key: {config.publicKey ? '✅ Set' : '❌ Missing'}</p>
          <p>Assistant ID: {config.assistantId ? '✅ Set' : '❌ Missing'}</p>
        </div>
      </div>
    </div>
  );
};

export default VapiTestButton;
