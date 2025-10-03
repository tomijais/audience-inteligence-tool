import OpenAI from 'openai';
import { readFile } from 'fs/promises';
import { join } from 'path';

export interface LLMResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Generate completion using OpenAI API
 */
export async function generateCompletion(messages: LLMMessage[]): Promise<LLMResponse> {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages,
    temperature: 0.7,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Empty response from LLM');
  }

  return {
    content,
    usage: completion.usage ? {
      prompt_tokens: completion.usage.prompt_tokens,
      completion_tokens: completion.usage.completion_tokens,
      total_tokens: completion.usage.total_tokens,
    } : undefined,
  };
}

/**
 * Load system prompt from file
 */
export async function loadSystemPrompt(): Promise<string> {
  const promptPath = join(process.cwd(), 'prompts', 'SYSTEM_PROMPT_AIT.md');
  return readFile(promptPath, 'utf-8');
}
