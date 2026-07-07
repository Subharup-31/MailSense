import { describe, it, expect } from 'vitest';
import { calculateBLEU, calculateROUGEL, calculateMETEOR } from '../lib/evaluator';

describe('Lexical Metrics Calculators', () => {

  describe('BLEU Score', () => {
    it('should return 1.0 for identical sentences', () => {
      const ref = 'This is a test sentence for email response platform';
      const cand = 'This is a test sentence for email response platform';
      expect(calculateBLEU(ref, cand)).toBeCloseTo(1.0, 2);
    });

    it('should return 0.0 for completely unrelated sentences', () => {
      const ref = 'Apple juice';
      const cand = 'Standard operational database server';
      expect(calculateBLEU(ref, cand)).toBe(0.0);
    });

    it('should calculate fractional precision for partial matches', () => {
      const ref = 'the quick brown fox jumps over the lazy dog';
      const cand = 'the quick brown cat jumps over the lazy dog'; // replaced fox with cat
      const score = calculateBLEU(ref, cand);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(1.0);
    });
  });

  describe('ROUGE-L Score', () => {
    it('should return 1.0 for identical sentences', () => {
      const ref = 'Please verify that our Pinecone indices are populated';
      const cand = 'Please verify that our Pinecone indices are populated';
      expect(calculateROUGEL(ref, cand)).toBe(1.0);
    });

    it('should return 0.0 for completely unrelated sentences', () => {
      const ref = 'No matching values';
      const cand = 'Redistributed assets';
      expect(calculateROUGEL(ref, cand)).toBe(0.0);
    });

    it('should calculate longest common subsequence correctly', () => {
      const ref = 'This is a primary test for evaluation';
      const cand = 'This is test for evaluation'; // missed 'a primary'
      const score = calculateROUGEL(ref, cand);
      expect(score).toBeCloseTo(0.83, 2); // 5 common tokens over avg of 6 and 5 length
    });
  });

  describe('METEOR Score', () => {
    it('should return 1.0 for identical sentences', () => {
      const ref = 'Processing full refund for your order';
      const cand = 'Processing full refund for your order';
      expect(calculateMETEOR(ref, cand)).toBeCloseTo(1.0, 2);
    });

    it('should align stemmed words', () => {
      const ref = 'He is testing the email application';
      const cand = 'He tests the email application'; // tests aligned with testing
      const score = calculateMETEOR(ref, cand);
      expect(score).toBeGreaterThan(0.70);
    });
  });
});
