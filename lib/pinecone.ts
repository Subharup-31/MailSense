/**
 * Pinecone Vector Database Integration & Retrieval Layer.
 */

import { Pinecone } from '@pinecone-database/pinecone';
import { supabase } from '../db/client';

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'email-eval-index';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-3-small';

let pineconeClient: Pinecone | null = null;

try {
  if (PINECONE_API_KEY) {
    pineconeClient = new Pinecone({
      apiKey: PINECONE_API_KEY,
    });
  } else {
    console.warn('WARNING: PINECONE_API_KEY is not set. Running in Local Database Search Fallback mode.');
  }
} catch (error) {
  console.error('Failed to initialize Pinecone Client:', error);
}

/**
 * Generate embedding vector using OpenRouter/OpenAI API or local fallback.
 * Standard vector size is 1536 dimensions.
 */
export async function getEmbedding(text: string): Promise<number[]> {
  if (!text) {
    return new Array(1536).fill(0);
  }

  // 1. Call OpenRouter / OpenAI embeddings API if API key is present
  if (OPENROUTER_API_KEY) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'AI Email Response & Evaluation Platform'
        },
        body: JSON.stringify({
          model: EMBEDDING_MODEL,
          input: text.replace(/\n/g, ' '),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter embeddings API error: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      if (result.data && result.data[0] && result.data[0].embedding) {
        return result.data[0].embedding;
      }
    } catch (error) {
      console.error('Failed to get remote embeddings:', error);
    }
  }

  // 2. Fallback: Generate a deterministic mock vector of 1536 dimensions for development/testing
  // This uses a simple hash function over the text to make it consistent for the same inputs.
  const vector = new Array(1536).fill(0);
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  for (let i = 0; i < 1536; i++) {
    const seed = Math.sin(hash + i) * 10000;
    vector[i] = seed - Math.floor(seed);
  }
  return vector;
}

/**
 * Upsert email records to Pinecone.
 */
export async function upsertEmailVector(
  emailId: string,
  text: string,
  metadata: {
    subject: string;
    category: string;
    tone: string;
    difficulty: string;
  }
): Promise<boolean> {
  if (!pineconeClient) {
    return false;
  }

  try {
    const embedding = await getEmbedding(text);
    const index = pineconeClient.index(PINECONE_INDEX_NAME);
    
    await index.upsert([
      {
        id: emailId,
        values: embedding,
        metadata: {
          email_id: emailId,
          subject: metadata.subject,
          category: metadata.category,
          tone: metadata.tone,
          difficulty: metadata.difficulty,
          body_preview: text.substring(0, 500),
        },
      },
    ]);
    
    // Update DB status using Supabase client
    await supabase
      .from('emails')
      .update({ embedding_status: 'synced' })
      .eq('id', emailId);
    
    return true;
  } catch (error) {
    console.error(`Failed to upsert vector for email ${emailId}:`, error);
    return false;
  }
}

export interface RetrievalResult {
  emailId: string;
  subject: string;
  body: string;
  reply: string;
  category: string;
  score: number;
}

/**
 * Search Pinecone for similar emails.
 * Falls back to SQL database text search if Pinecone is not configured.
 */
export async function retrieveSimilarEmails(
  queryText: string,
  category?: string,
  limit: number = 3
): Promise<RetrievalResult[]> {
  const start = Date.now();
  
  // 1. If Pinecone is configured, run vector search
  if (pineconeClient) {
    try {
      const embedding = await getEmbedding(queryText);
      const index = pineconeClient.index(PINECONE_INDEX_NAME);

      const filter: Record<string, any> = {};
      if (category) {
        filter.category = category;
      }

      const queryResponse = await index.query({
        vector: embedding,
        topK: limit,
        includeMetadata: true,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
      });

      if (queryResponse.matches && queryResponse.matches.length > 0) {
        const results: RetrievalResult[] = [];
        
        for (const match of queryResponse.matches) {
          const emailId = match.id;
          const score = match.score || 0;
          
          // Apply similarity threshold (e.g. 0.60) to avoid irrelevant context injection
          if (score < 0.60) {
            console.log(`Filtering out low similarity match ${emailId} with score ${score.toFixed(3)}`);
            continue;
          }
          
          // Get the full email details from the SQL database using Supabase
          const { data: dbData } = await supabase
            .from('emails')
            .select('subject, body, reply, category')
            .eq('id', emailId)
            .limit(1);

          if (dbData && dbData.length > 0) {
            const row = dbData[0];
            results.push({
              emailId,
              subject: row.subject,
              body: row.body,
              reply: row.reply,
              category: row.category,
              score,
            });
          }
        }
        
        console.log(`Pinecone retrieval completed in ${Date.now() - start}ms`);
        return results;
      }
    } catch (error) {
      console.error('Pinecone search failed, falling back to database text search:', error);
    }
  }

  // 2. Fallback / Hybrid: Run Supabase text search
  try {
    let dbQuery = supabase
      .from('emails')
      .select('id, subject, body, reply, category');

    if (category) {
      dbQuery = dbQuery.eq('category', category);
    }

    if (queryText) {
      const cleanQuery = queryText
        .replace(/[\(\),\r\n]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (cleanQuery) {
        // Use standard text search or fallback ilike matching
        dbQuery = dbQuery.or(`subject.ilike.%${cleanQuery}%,body.ilike.%${cleanQuery}%`);
      }
    }

    const { data: dbData, error } = await dbQuery.limit(limit);
    if (error) throw error;
    
    console.log(`Database text search retrieval completed in ${Date.now() - start}ms`);
    
    return (dbData || []).map((row: any) => ({
      emailId: row.id,
      subject: row.subject,
      body: row.body,
      reply: row.reply,
      category: row.category,
      score: 0.5,
    }));
  } catch (error) {
    console.error('Fallback database search failed:', error);
    return [];
  }
}
