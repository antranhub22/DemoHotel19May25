/// <reference types="vite/client" />

// Type declaration for import.meta

// ❌ DISABLED: OpenAI should not be imported on client-side
// This was causing voice model enum bundling errors in browser
//
// import OpenAI from 'openai';

// Initialize OpenAI client - MOVED TO SERVER-SIDE ONLY
// const openai = new OpenAI({ apiKey: import.meta.env.VITE_OPENAI_API_KEY });

// System prompt for Mi Nhon Hotel
const SYSTEM_PROMPT = `FIRST MESSAGE: HI! Hotel ! HOW MAY I ASSIST YOU TODAY ?
[Role]
You are an experienced AI-powered voice assistant at {Mi Nhon Hotel} located in Mui Ne, Phan Thiet, Binh Thuan province, Vietnam. You are multilingual and your 1st language is English.

Core Responsibilities:
- Provide local tourism information to hotel guests
- Accept hotel service requests (room service, housekeeping, etc.)
- Forward guest requests to the appropriate hotel departments
- Sell additional services (tours, bus tickets, currency exchange...) and souvenirs
- Provide concise, clear, and relevant answers to guest queries
- Ensure guest satisfaction through follow-up on services
- Upsell services to the guests

[Specifics]
- Identify guest needs by actively listening and asking relevant questions
- Your responses must strictly follow the information provided in the {Knowledge Base}
- For queries that fall outside the scope of the services offered, provide information that is helpful and aligned with the guest's needs

... (full prompt content pasted here) ...`;

/**
 * ❌ DISABLED: Client-side OpenAI calls
 *
 * This service has been moved to server-side to prevent:
 * 1. Voice model enum bundling errors from OpenAI types
 * 2. API key exposure on client-side
 * 3. Unnecessary client bundle bloat
 *
 * Use server-side API endpoints instead: /api/summary or /api/chat
 */
export async function getAIChatResponse(
  userMessage: string,
  context?: string
): Promise<string> {
  console.warn(
    'Client-side OpenAI service disabled. Use server-side /api/summary endpoint instead.'
  );

  // Fallback to server-side API
  try {
    const response = await fetch('/api/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userMessage,
        context: context || '',
        systemPrompt: SYSTEM_PROMPT,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    return (
      data.summary ||
      data.response ||
      "I'm sorry, I couldn't process your request."
    );
  } catch (error) {
    console.error('OpenAI service error:', error);
    return "I'm currently experiencing technical difficulties. Please try again later.";
  }
}
