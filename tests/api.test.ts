import { describe, it, expect, vi } from 'vitest';
import { POST as evaluatePOST } from '../app/api/evaluate/route';
import { GET as healthGET } from '../app/api/health/route';

// Mock Supabase client for health route test stability
vi.mock('../db/client', () => {
  const mockChain = {
    select: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue({ data: [{ id: '1' }], error: null }),
    update: vi.fn().mockResolvedValue({ data: [{ id: '1' }], error: null }),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { id: '1' }, error: null }),
    then: (resolve: any) => Promise.resolve(resolve({ data: [{ id: '1' }], error: null }))
  };
  return {
    supabase: {
      from: vi.fn().mockReturnValue(mockChain)
    }
  };
});

// Mock local-models to prevent downloading 100MB model in tests
vi.mock('../lib/local-models', () => ({
  getTokenEmbeddings: vi.fn().mockImplementation((text: string) => Promise.resolve({
    tokens: text.split(/\s+/),
    embeddings: text.split(/\s+/).map(() => new Array(384).fill(0.1))
  })),
  getLocalSentenceEmbedding: vi.fn().mockImplementation(() => Promise.resolve(new Array(384).fill(0.1))),
  cosineSimilarity: vi.fn().mockReturnValue(0.9)
}));

describe('API Routes Integration Tests', () => {

  describe('GET /api/health', () => {
    it('should return health status successfully', async () => {
      const res = await healthGET();
      expect(res.status).toBe(200);
      
      const json = await res.json();
      expect(json.status).toBe('ok');
      expect(json.services.database).toBe('connected');
    });
  });

  describe('POST /api/evaluate', () => {
    it('should fail with 400 on empty parameters', async () => {
      const mockReq = new Request('http://localhost:3000/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incomingEmail: '',
          referenceReply: '',
          generatedReply: ''
        }),
      });

      const res = await evaluatePOST(mockReq);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('Invalid input parameters');
    });

    it('should run evaluation successfully with valid parameters', async () => {
      const mockReq = new Request('http://localhost:3000/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incomingEmail: 'Can you help with refund?',
          referenceReply: 'I have processed your refund.',
          generatedReply: 'Hello, your refund has been processed.'
        }),
      });

      const res = await evaluatePOST(mockReq);
      expect(res.status).toBe(200);
      
      const json = await res.json();
      expect(json).toHaveProperty('overallScore');
      expect(json).toHaveProperty('confidence');
      expect(json.metrics.bleu.score).toBeGreaterThan(0);
    });
  });
});
