/**
 * OpenRouter LLM Provider Integration.
 */

import { supabase } from '../db/client';

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const DEFAULT_MODEL = process.env.LLM_MODEL || 'mistral-small-latest';

export interface GenerateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GenerationResult {
  text: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
}

/**
 * Compiles a prompt template by replacing {{variable}} placeholders with values.
 */
export function compilePrompt(template: string, variables: Record<string, string>): string {
  let compiled = template;
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    compiled = compiled.replace(placeholder, value || '');
  }
  return compiled;
}

/**
 * Calls Groq primarily (if GROQ_API_KEY is present) or OpenRouter as fallback.
 */
export async function callLLM(
  messages: Array<{ role: string; content: string }>,
  options: GenerateOptions = {}
): Promise<GenerationResult> {
  const primaryModel = options.model || DEFAULT_MODEL;
  const temperature = options.temperature !== undefined ? options.temperature : 0.7;
  const maxTokens = options.maxTokens || 1000;
  
  const start = Date.now();

  // 0. Try Mistral API first (primary provider)
  if (MISTRAL_API_KEY) {
    // Map generic model names to Mistral equivalents
    const mistralModel = primaryModel.includes('70b') || primaryModel.includes('medium')
      ? 'mistral-medium-latest'
      : 'mistral-small-latest';

    let mistralAttempts = 3;
    let mistralDelay = 1000;

    for (let attempt = 1; attempt <= mistralAttempts; attempt++) {
      try {
        console.log(`Calling Mistral API using model: ${mistralModel} (Attempt ${attempt}/${mistralAttempts})`);
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${MISTRAL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: mistralModel,
            messages,
            temperature,
            max_tokens: maxTokens,
          }),
        });

        const latencyMs = Date.now() - start;

        if (response.ok) {
          const data = await response.json();
          if (data.choices?.[0]?.message) {
            const text = data.choices[0].message.content.trim();
            return {
              text,
              model: `mistral/${mistralModel}`,
              usage: {
                promptTokens: data.usage?.prompt_tokens || 0,
                completionTokens: data.usage?.completion_tokens || 0,
                totalTokens: data.usage?.total_tokens || 0,
              },
              latencyMs,
            };
          }
        } else {
          const errText = await response.text();
          console.warn(`Mistral API returned status ${response.status}: ${errText}`);
          if (response.status === 429 && attempt < mistralAttempts) {
            console.log(`Rate limited on Mistral. Retrying in ${mistralDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, mistralDelay));
            mistralDelay *= 2;
            continue;
          }
        }
      } catch (err: any) {
        console.warn(`Error during Mistral call attempt ${attempt}:`, err.message || err);
        if (attempt < mistralAttempts) {
          await new Promise(resolve => setTimeout(resolve, mistralDelay));
          mistralDelay *= 2;
          continue;
        }
      }
      break;
    }
  }

  // 1. Try Groq API as secondary fallback
  if (GROQ_API_KEY) {
    // Map standard models to active Groq models
    let groqModel = 'llama-3.1-8b-instant';
    if (primaryModel.includes('70b') || primaryModel.includes('versatile')) {
      groqModel = 'llama-3.3-70b-versatile';
    }

    let groqAttempts = 3;
    let groqDelay = 1500;

    for (let attempt = 1; attempt <= groqAttempts; attempt++) {
      try {
        console.log(`Calling Groq API using model: ${groqModel} (Attempt ${attempt}/${groqAttempts})`);
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: groqModel,
            messages,
            temperature,
            max_tokens: maxTokens,
          }),
        });

        const latencyMs = Date.now() - start;

        if (response.ok) {
          const data = await response.json();
          if (data.choices && data.choices[0] && data.choices[0].message) {
            const text = data.choices[0].message.content.trim();
            const promptTokens = data.usage?.prompt_tokens || 0;
            const completionTokens = data.usage?.completion_tokens || 0;
            const totalTokens = data.usage?.total_tokens || 0;

            return {
              text,
              model: `groq/${groqModel}`,
              usage: {
                promptTokens,
                completionTokens,
                totalTokens
              },
              latencyMs
            };
          }
        } else {
          const errText = await response.text();
          console.warn(`Groq API returned failure status ${response.status}: ${errText}`);
          if (response.status === 429 && attempt < groqAttempts) {
            console.log(`Rate limited on Groq. Retrying in ${groqDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, groqDelay));
            groqDelay *= 2;
            continue;
          }
        }
      } catch (err: any) {
        console.warn(`Error during Groq call attempt ${attempt}:`, err.message || err);
        if (attempt < groqAttempts) {
          await new Promise(resolve => setTimeout(resolve, groqDelay));
          groqDelay *= 2;
          continue;
        }
      }
      break;
    }
  }

  // 2. Dry run / Fallback if OpenRouter API key is not configured either
  if (!OPENROUTER_API_KEY) {
    console.warn('WARNING: Neither Groq nor OpenRouter keys are active. Generating fallback mock reply.');
    const latencyMs = Date.now() - start;
    
    const userMessage = messages.find(m => m.role === 'user')?.content || '';
    let mockReply = 'Dear Customer, thank you for contacting us. We have received your request and our team is investigating. We appreciate your patience. Sincerely, Customer Support.';
    
    if (userMessage.toLowerCase().includes('refund')) {
      mockReply = 'Hello, thank you for your request. We have processed a refund for your order. The funds should show in your account in 3-5 business days. Best regards, Support Team.';
    } else if (userMessage.toLowerCase().includes('reschedule') || userMessage.toLowerCase().includes('calendar')) {
      mockReply = 'Hi, I can confirm we have rescheduled our meeting. The calendar invite has been updated. Talk to you soon. Sincerely, Team.';
    }
    
    return {
      text: mockReply,
      model: `${primaryModel}-mock`,
      usage: {
        promptTokens: 100,
        completionTokens: 80,
        totalTokens: 180
      },
      latencyMs
    };
  }

  // 3. Setup model rotation list for OpenRouter
  const models: string[] = [];
  models.push('openrouter/free');
  const fallbackModels = [
    'meta-llama/llama-3-8b-instruct:free',
    'qwen/qwen-2-7b-instruct:free',
    'mistralai/mistral-7b-instruct:free'
  ];
  
  fallbackModels.forEach(m => {
    if (!models.includes(m)) {
      models.push(m);
    }
  });

  let lastError: any = null;

  // Try each model in sequence
  for (const currentModel of models) {
    try {
      console.log(`Calling OpenRouter API using model: ${currentModel}`);
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'AI Email Response & Evaluation Platform'
        },
        body: JSON.stringify({
          model: currentModel,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      const latencyMs = Date.now() - start;

      if (!response.ok) {
        const errBody = await response.text();
        const status = response.status;
        console.warn(`Model ${currentModel} failed with status ${status}: ${errBody}`);
        lastError = new Error(`OpenRouter API responded with ${status}: ${errBody}`);
        
        // If rate limited or service unavailable, try the next model
        if (status === 429 || status === 503 || status === 502 || errBody.toLowerCase().includes('rate-limited') || errBody.toLowerCase().includes('rate limit')) {
          continue;
        }
        throw lastError;
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response structure from OpenRouter');
      }

      const text = data.choices[0].message.content.trim();
      const promptTokens = data.usage?.prompt_tokens || 0;
      const completionTokens = data.usage?.completion_tokens || 0;
      const totalTokens = data.usage?.total_tokens || 0;

      return {
        text,
        model: currentModel,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens
        },
        latencyMs
      };
    } catch (error: any) {
      console.error(`Error during callLLM for model ${currentModel}:`, error.message || error);
      lastError = error;
      
      if (
        error.message?.includes('429') || 
        error.message?.toLowerCase().includes('rate-limited') || 
        error.message?.toLowerCase().includes('rate limit') ||
        error.message?.toLowerCase().includes('fetch')
      ) {
        continue;
      }
      throw error;
    }
  }

  throw lastError || new Error('All OpenRouter models failed or were rate-limited.');
}

/**
 * Retrieve the active prompt template or fallback to default.
 */
export async function getActivePromptTemplate(): Promise<{ id: string; content: string }> {
  try {
    const { data, error } = await supabase
      .from('prompt_versions')
      .select('id, content')
      .eq('is_active', true)
      .limit(1);

    if (error) throw error;
    if (data && data.length > 0) {
      return { id: data[0].id, content: data[0].content };
    }
  } catch (error) {
    console.error('Failed to query prompt template from DB:', error);
  }

  // Default hardcoded fallback
  return {
    id: 'default',
    content: `You are a professional customer support representative and company agent. Draft a decisive, helpful reply to the incoming email based on the context and reference examples provided.

Incoming Email Subject: {{subject}}
Incoming Email Body:
{{body}}

Business Context / Rules:
- Keep the tone {{tone}}
- Act as the company's voice.
- Answer every explicit question and resolve every point of clarification in the incoming email. Do not skip or ignore any customer requests.
- DO NOT invent or ask unnecessary clarification questions (e.g. asking for meeting dates, reference numbers, or timelines that are already clear or irrelevant).
- DO NOT repeat the customer's questions verbatim.
- If certain information required to answer is not in the context, clearly acknowledge it and state that you will follow up, rather than fabricating any details, dates, or policies.
- Keep the response concise, professional, and actionable.

Top Reference Examples:
{{examples}}

Draft the best response below. Do not include signatures or extra greetings unless appropriate.
Response:`
  };
}
