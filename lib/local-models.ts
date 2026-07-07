/**
 * Local Machine Learning Models using HuggingFace Transformers.js.
 * This runs local WASM embeddings and tokenizations for semantic and BERTScore evaluations.
 */

import { pipeline, env } from '@huggingface/transformers';

// Configure transformers cache directory
env.cacheDir = './.cache/transformers';

let featureExtractor: any = null;
let hasFailedToLoad = false;

/**
 * Initialize and retrieve the feature extraction pipeline.
 * Uses a small, fast 384-dimensional SentenceTransformer model.
 */
export async function getFeatureExtractor() {
  if (!featureExtractor && !hasFailedToLoad) {
    try {
      console.log('Loading local HuggingFace feature-extraction model (Xenova/all-MiniLM-L6-v2)...');
      featureExtractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      console.log('Local feature-extraction model loaded successfully.');
    } catch (error) {
      console.error('Failed to load local HuggingFace model:', error);
      hasFailedToLoad = true;
      featureExtractor = null;
    }
  }
  return featureExtractor;
}

/**
 * Compute cosine similarity between two vectors.
 */
export function cosineSimilarity(v1: number[], v2: number[]): number {
  if (v1.length !== v2.length) return 0;
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  for (let i = 0; i < v1.length; i++) {
    dotProduct += v1[i] * v2[i];
    norm1 += v1[i] * v1[i];
    norm2 += v2[i] * v2[i];
  }
  if (norm1 === 0 || norm2 === 0) return 0;
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

export interface TokenEmbeddingsResult {
  tokens: string[];
  embeddings: number[][]; // [token_count, 384]
}

/**
 * Extract token-level embeddings for a given text.
 */
export async function getTokenEmbeddings(text: string): Promise<TokenEmbeddingsResult> {
  const extractor = await getFeatureExtractor();
  if (!extractor) {
    // Fallback: tokenize by simple word split
    const tokens = text.split(/\s+/).filter(Boolean);
    return { tokens, embeddings: tokens.map(() => new Array(384).fill(0.1)) };
  }

  try {
    // Run the model to get the feature tensor
    const output = await extractor(text);
    
    // The output tensor has shape [1, num_tokens, 384]
    const data = output.data; // Flat Float32Array
    const shape = output.dims; // [1, num_tokens, 384]
    const numTokens = shape[1];
    const dim = shape[2];

    const embeddings: number[][] = [];
    for (let t = 0; t < numTokens; t++) {
      const tokenVec: number[] = [];
      const offset = t * dim;
      for (let d = 0; d < dim; d++) {
        tokenVec.push(data[offset + d]);
      }
      embeddings.push(tokenVec);
    }

    // Tokenize manually to map token names (simple clean approximation matching the model's sequence length)
    // Note: The model returns embeddings for WordPiece tokens including [CLS] and [SEP]
    const tokens = new Array(numTokens).fill('').map((_, i) => {
      if (i === 0) return '[CLS]';
      if (i === numTokens - 1) return '[SEP]';
      return `t_${i}`;
    });

    return { tokens, embeddings };
  } catch (error) {
    console.error('Error extracting token embeddings, using fallback:', error);
    const tokens = text.split(/\s+/).filter(Boolean);
    return { tokens, embeddings: tokens.map(() => new Array(384).fill(0.1)) };
  }
}

/**
 * Calculates a local sentence-level embedding (mean pooling of token embeddings).
 */
export async function getLocalSentenceEmbedding(text: string): Promise<number[]> {
  const extractor = await getFeatureExtractor();
  if (!extractor) {
    return new Array(384).fill(0);
  }

  try {
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  } catch (error) {
    console.error('Error calculating local sentence embedding:', error);
    return new Array(384).fill(0);
  }
}
