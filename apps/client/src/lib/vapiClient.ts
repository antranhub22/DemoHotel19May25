import Vapi from '@vapi-ai/web';

// Initialize with environment variable or fallback
const PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY || 'demo';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Option to force basic summary generation (for testing fallback)
export const FORCE_BASIC_SUMMARY = false; // Set to true to always use basic summary

// Define message types based on Vapi's API
type MessageRole = 'system' | 'user' | 'assistant' | 'tool' | 'function';

interface Message {
  role: MessageRole;
  content: string;
}

interface AddMessage {
  type: 'add-message';
  message: Message;
}

let vapiInstance: Vapi | null = null;

interface VapiConnectionStatus {
  status: 'connecting' | 'connected' | 'disconnected';
}

interface VapiMessage {
  type: string;
  content?: string;
  [key: string]: any;
}

export const initVapi = async (publicKey: string): Promise<Vapi> => {
  try {
    console.log('[vapiClient] Initializing Vapi with public key:', publicKey);
    
    // Always create a new instance to avoid stale connections
    if (vapiInstance) {
      console.log('[vapiClient] Cleaning up existing instance');
      try {
        vapiInstance.stop();
      } catch (e) {
        console.log('[vapiClient] Error stopping existing instance:', e);
      }
      vapiInstance = null;
    }
    
    console.log('[vapiClient] Creating new Vapi instance');
    vapiInstance = new Vapi(publicKey);

    // Add event listeners
    vapiInstance.on('call-start', () => {
      console.log('[vapiClient] Call started');
    });

    vapiInstance.on('call-end', () => {
      console.log('[vapiClient] Call ended');
    });

    vapiInstance.on('speech-start', () => {
      console.log('[vapiClient] Speech started');
    });

    vapiInstance.on('speech-end', () => {
      console.log('[vapiClient] Speech ended');
    });

    vapiInstance.on('volume-level', (volume) => {
      console.log(`[vapiClient] Volume level: ${volume}`);
    });

    vapiInstance.on('message', (message) => {
      console.log('[vapiClient] Message received:', message);
    });

    vapiInstance.on('error', (error) => {
      console.error('[vapiClient] Error:', error);
    });

    console.log('[vapiClient] Vapi instance created successfully');
    return vapiInstance;
  } catch (error) {
    console.error('[vapiClient] Failed to initialize Vapi:', error);
    vapiInstance = null;
    throw error;
  }
};

export const getVapiInstance = (): Vapi | null => {
  return vapiInstance;
};

export const isVapiInitialized = (): boolean => {
  return vapiInstance !== null;
};

export const startCall = async (assistantId: string, assistantOverrides?: any) => {
  if (!vapiInstance) {
    throw new Error('Vapi not initialized. Call initVapi first.');
  }

  try {
    const call = await vapiInstance.start(assistantId, assistantOverrides);
    return call;
  } catch (error) {
    console.error('Failed to start call:', error);
    throw error;
  }
};

export const stopCall = () => {
  if (!vapiInstance) {
    throw new Error('Vapi not initialized. Call initVapi first.');
  }

  try {
    vapiInstance.stop();
  } catch (error) {
    console.error('Failed to stop call:', error);
    throw error;
  }
};

export const setMuted = (muted: boolean) => {
  if (!vapiInstance) {
    throw new Error('Vapi not initialized. Call initVapi first.');
  }

  try {
    vapiInstance.setMuted(muted);
  } catch (error) {
    console.error('Failed to set mute state:', error);
    throw error;
  }
};

export const isMuted = (): boolean => {
  if (!vapiInstance) {
    throw new Error('Vapi not initialized. Call initVapi first.');
  }

  try {
    return vapiInstance.isMuted();
  } catch (error) {
    console.error('Failed to get mute state:', error);
    throw error;
  }
};

export const sendMessage = (content: string, role: 'system' | 'user' = 'system') => {
  if (!vapiInstance) {
    throw new Error('Vapi not initialized. Call initVapi first.');
  }

  try {
    vapiInstance.send({
      type: 'add-message',
      message: {
        role,
        content
      }
    });
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
};

export const say = (message: string, endCallAfterSpoken?: boolean) => {
  if (!vapiInstance) {
    throw new Error('Vapi not initialized. Call initVapi first.');
  }

  try {
    vapiInstance.say(message, endCallAfterSpoken);
  } catch (error) {
    console.error('Failed to say message:', error);
    throw error;
  }
};

export const buttonConfig = {
  position: "top",
                                   offset: "40px",
  width: "120px",
  height: "120px",
  idle: {
    color: `rgb(93, 254, 202)`,
    type: "round",
    title: "Have a quick question?",
    subtitle: "Talk with our AI assistant",
    icon: `https://unpkg.com/lucide-static@0.321.0/icons/phone.svg`,
  },
  loading: {
    color: `rgb(93, 124, 202)`,
    type: "round",
    title: "Connecting...",
    subtitle: "Please wait",
    icon: `https://unpkg.com/lucide-static@0.321.0/icons/loader-2.svg`,
  },
  active: {
    color: `rgb(255, 0, 0)`,
    type: "round",
    title: "Call is in progress...",
    subtitle: "End the call.",
    icon: `https://unpkg.com/lucide-static@0.321.0/icons/phone-off.svg`,
  },
};

export const resetVapi = () => {
  console.log('[vapiClient] Resetting Vapi instance');
  if (vapiInstance) {
    try {
      vapiInstance.stop();
    } catch (e) {
      console.log('[vapiClient] Error stopping instance during reset:', e);
    }
    vapiInstance = null;
  }
};
