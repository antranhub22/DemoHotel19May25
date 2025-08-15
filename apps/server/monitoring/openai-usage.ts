// ✅ OPENAI USAGE MONITORING
import { logger } from "@shared/utils/logger";
import { TimerManager } from "../utils/TimerManager";

interface UsageStats {
  totalCalls: number;
  totalTokens: number;
  estimatedCost: number;
  byModel: Record<string, { calls: number; tokens: number; cost: number }>;
  lastReset: number;
}

// In-memory usage tracking (in production, use Redis or database)
let usageStats: UsageStats = {
  totalCalls: 0,
  totalTokens: 0,
  estimatedCost: 0,
  byModel: {},
  lastReset: Date.now(),
};

// Model pricing (per 1M tokens) - Updated as of Jan 2025
const MODEL_PRICING = {
  "gpt-4o": { input: 5.0, output: 15.0 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "gpt-4": { input: 30.0, output: 60.0 },
  "gpt-3.5-turbo": { input: 0.5, output: 1.5 },
};

export function trackOpenAIUsage(
  model: string,
  inputTokens: number,
  outputTokens: number,
  operation: string,
) {
  const pricing = MODEL_PRICING[model as keyof typeof MODEL_PRICING];
  if (!pricing) {
    logger.warn(`[USAGE] Unknown model pricing: ${model}`, "Usage");
    return;
  }

  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  const totalCost = inputCost + outputCost;
  const totalTokens = inputTokens + outputTokens;

  // Update global stats
  usageStats.totalCalls++;
  usageStats.totalTokens += totalTokens;
  usageStats.estimatedCost += totalCost;

  // Update per-model stats
  if (!usageStats.byModel[model]) {
    usageStats.byModel[model] = { calls: 0, tokens: 0, cost: 0 };
  }
  usageStats.byModel[model].calls++;
  usageStats.byModel[model].tokens += totalTokens;
  usageStats.byModel[model].cost += totalCost;

  logger.debug(`💰 [USAGE] ${operation}`, "Usage", {
    model,
    inputTokens,
    outputTokens,
    cost: `$${totalCost.toFixed(4)}`,
    totalCostToday: `$${usageStats.estimatedCost.toFixed(2)}`,
  });

  // Alert if daily cost exceeds threshold
  if (usageStats.estimatedCost > 10) {
    // $10 threshold
    logger.warn(
      `🚨 [COST-ALERT] Daily OpenAI usage: $${usageStats.estimatedCost.toFixed(2)}`,
      "Usage",
    );
  }
}

export function getUsageStats(): UsageStats {
  return { ...usageStats };
}

export function resetUsageStats() {
  usageStats = {
    totalCalls: 0,
    totalTokens: 0,
    estimatedCost: 0,
    byModel: {},
    lastReset: Date.now(),
  };
  logger.info("[USAGE] Usage stats reset", "Usage");
}

// Auto-reset daily at midnight
TimerManager.setInterval(() => {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    logger.info(
      `[USAGE] Daily reset - Total cost: $${usageStats.estimatedCost.toFixed(2)}`,
      "Usage",
      "auto-generated-interval-14",
    );
    resetUsageStats();
  }
}, 60000); // Check every minute
