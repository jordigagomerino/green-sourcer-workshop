import { OpenAI } from "openai";
/**
 * Sum the usage of the previous and new completions
 * @param {OpenAI.CompletionUsage} prev - The previous usage
 * @param {OpenAI.CompletionUsage} current - The current usage
 * @returns {OpenAI.CompletionUsage} - The summed usage
 */
export default async function usage(prev, current) {
  return {
    completion_tokens: prev.completion_tokens + current.completion_tokens,
    prompt_tokens: prev.prompt_tokens + current.prompt_tokens,
    total_tokens: prev.total_tokens + current.total_tokens,
  };
}
/**
 * 
 * @returns {OpenAI.CompletionUsage}
 */
export function createUsage() {
  return {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0,
  };
}

export function usageToMoney(usage) {
  const inputPrice = 3/1_000_000;
  const outputPrice = 4/1_000_000;
  const inputCost = usage.prompt_tokens * inputPrice;
  const outputCost = usage.completion_tokens * outputPrice;
  const totalCost = inputCost + outputCost;
  return `Run cost: $${totalCost.toFixed(2)} - Input cost: $${inputCost.toFixed(2)} - Output cost: $${outputCost.toFixed(2)}`;
}