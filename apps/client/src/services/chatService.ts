/// <reference types="vite/client" />

// Type declaration for import.meta

// ❌ DISABLED: OpenAI should not be imported on client-side
// This was causing voice model enum bundling errors in browser
//
// import OpenAI from 'openai';

// Load the system prompt from environment or inline it here
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

... (rest of the full prompt content) ...`;

/**
 * ❌ DISABLED: Client-side OpenAI calls
 *
 * This service has been disabled because:
 * 1. OpenAI imports on client-side cause voice model enum bundling errors
 * 2. API keys should not be exposed to client
 * 3. OpenAI calls should be server-side only
 *
 * Use server-side API endpoints instead: /api/chat or /api/summary
 */
export async function getAIChatResponse(
  userMessage: string,
  context?: string
): Promise<string> {
  console.warn(
    'Client-side OpenAI service disabled. Use server-side API endpoints instead.'
  );

  // Return fallback response or make API call to server
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        context: context || '',
        systemPrompt: SYSTEM_PROMPT,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    return data.response || "I'm sorry, I couldn't process your request.";
  } catch (error) {
    console.error('Chat service error:', error);
    return "I'm currently experiencing technical difficulties. Please try again later.";
  }
}
