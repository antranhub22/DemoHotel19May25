import Vapi from '@vapi-ai/web';

if (!process.env.VITE_VAPI_PUBLIC_KEY) {
  throw new Error('VITE_VAPI_PUBLIC_KEY is not set in environment variables');
}

export const vapi = new Vapi(process.env.VITE_VAPI_PUBLIC_KEY);

// Function to start a call
export async function startCall(assistantId: string, assistantOverrides?: any) {
  try {
    const call = await vapi.start(assistantId, assistantOverrides);
    return call;
  } catch (error) {
    console.error('Error starting call:', error);
    throw error;
  }
}

// Function to end a call
export async function endCall() {
  try {
    await vapi.stop();
  } catch (error) {
    console.error('Error ending call:', error);
    throw error;
  }
}

// Function to get call status (not directly supported in SDK, placeholder)
export async function getCallStatus() {
  try {
    // No direct API, return dummy status or implement as needed
    return { status: 'unknown' };
  } catch (error) {
    console.error('Error getting call status:', error);
    throw error;
  }
}

// Function to get call transcript (not directly supported in SDK, placeholder)
export async function getCallTranscript() {
  try {
    // No direct API, return dummy transcript or implement as needed
    return [];
  } catch (error) {
    console.error('Error getting call transcript:', error);
    throw error;
  }
}

// Lấy language từ request (giả sử truyền qua query hoặc body)
function getLanguage(req: any) {
  return req.query?.language || req.body?.language || 'en';
}

// Lấy publicKey và assistantId theo ngôn ngữ
function getVapiConfig(language: string) {
  return {
    publicKey: language === 'fr'
      ? process.env.VITE_VAPI_PUBLIC_KEY_FR
      : process.env.VITE_VAPI_PUBLIC_KEY,
    assistantId: language === 'fr'
      ? process.env.VITE_VAPI_ASSISTANT_ID_FR
      : process.env.VITE_VAPI_ASSISTANT_ID,
  };
}

// Khi sử dụng:
// const { publicKey, assistantId } = getVapiConfig(getLanguage(req)); 