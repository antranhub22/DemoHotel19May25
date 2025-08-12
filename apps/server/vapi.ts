import { logger } from "@shared/utils/logger";
import Vapi from "@vapi-ai/web";

if (!process.env.VITE_VAPI_PUBLIC_KEY) {
  throw new Error("VITE_VAPI_PUBLIC_KEY is not set in environment variables");
}

export const vapi = new Vapi(process.env.VITE_VAPI_PUBLIC_KEY);

// Function to start a call
export async function startCall(assistantId: string, assistantOverrides?: any) {
  try {
    const call = await vapi.start(assistantId, assistantOverrides);
    return call;
  } catch (error) {
    logger.error("Error starting call:", "Component", error);
    throw error;
  }
}

// Function to end a call
export async function endCall() {
  try {
    await vapi.stop();
  } catch (error) {
    logger.error("Error ending call:", "Component", error);
    throw error;
  }
}

// Function to get call status (not directly supported in SDK, placeholder)
export async function getCallStatus() {
  try {
    // No direct API, return dummy status or implement as needed
    return { status: "unknown" };
  } catch (error) {
    logger.error("Error getting call status:", "Component", error);
    throw error;
  }
}

// Function to get call transcript (not directly supported in SDK, placeholder)
export async function getCallTranscript() {
  try {
    // No direct API, return dummy transcript or implement as needed
    return [];
  } catch (error) {
    logger.error("Error getting call transcript:", "Component", error);
    throw error;
  }
}

// Lấy language từ request (giả sử truyền qua query hoặc body)

// Lấy publicKey và assistantId theo ngôn ngữ

// Khi sử dụng:
// const { publicKey, assistantId } = getVapiConfig(getLanguage(req));
