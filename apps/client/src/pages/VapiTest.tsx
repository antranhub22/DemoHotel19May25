import VapiTestButton from '@/components/debug/VapiTestButton';
import React from 'react';

const VapiTest: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8">
            <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        🧪 Vapi Integration Testing
                    </h1>
                    <p className="text-gray-600">
                        Test page for debugging Vapi SDK integration issues
                    </p>
                </div>

                <VapiTestButton />

                <div className="mt-8 max-w-2xl mx-auto">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-800 mb-2">📝 Instructions:</h3>
                        <ol className="list-decimal list-inside text-blue-700 space-y-1">
                            <li>Click "Initialize Vapi" to set up the SDK</li>
                            <li>Click "Start Call" to begin a voice conversation</li>
                            <li>Speak when the call is active</li>
                            <li>Click "Stop Call" to end the conversation</li>
                            <li>Check the activity log and browser console for details</li>
                        </ol>
                    </div>

                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Troubleshooting:</h3>
                        <ul className="list-disc list-inside text-yellow-700 space-y-1">
                            <li>Make sure your microphone permissions are enabled</li>
                            <li>Ensure environment variables are properly configured</li>
                            <li>Check browser console for detailed error messages</li>
                            <li>Try refreshing the page if issues persist</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VapiTest; 