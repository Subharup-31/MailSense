/**
 * Structured Logging & Auditing utility.
 * Saves operations, performance timing, token counts, and errors to the database.
 */

import { supabase } from '../db/client';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

/**
 * Logs a message to the database system_logs table and prints to console.
 */
export async function logEvent(
  level: LogLevel,
  message: string,
  metadata: Record<string, any> = {},
  latencyMs?: number,
  tokenUsage?: TokenUsage
): Promise<void> {
  const timestamp = new Date().toISOString();
  
  // Format console log
  const consoleMsg = `[${timestamp}] [${level}] ${message} ${
    latencyMs ? `(${latencyMs}ms)` : ''
  } ${tokenUsage ? `[Tokens: ${tokenUsage.totalTokens}]` : ''}`;

  if (level === 'ERROR') {
    console.error(consoleMsg, metadata);
  } else if (level === 'WARN') {
    console.warn(consoleMsg, metadata);
  } else {
    console.log(consoleMsg);
  }

  // Insert structured log into Supabase database
  try {
    await supabase.from('system_logs').insert({
      level,
      message,
      metadata_json: metadata,
      latency_ms: latencyMs !== undefined ? latencyMs : null,
      token_usage_json: tokenUsage || {}
    });
  } catch (error) {
    // If logging fails (e.g. database down), at least print to stderr
    console.error('Failed to save log event to database:', error);
  }
}
