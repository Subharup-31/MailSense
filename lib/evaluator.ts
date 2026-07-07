/**
 * Evaluation Engine for calculating multi-metric scores on generated responses.
 */

import { callLLM } from './openrouter';
import { runRuleEngine, RuleEngineResult } from './rules';
import { getTokenEmbeddings, cosineSimilarity, getLocalSentenceEmbedding } from './local-models';

export interface MetricDetail {
  score: number;       // 0 to 1
  reason: string;
  confidence: number;  // 0 to 1
  weight: number;
}

export interface EvaluationReport {
  overallScore: number;     // 0 to 1
  confidence: 'High' | 'Medium' | 'Low';
  justification: string;
  metrics: {
    semanticSimilarity: MetricDetail;
    bleu: MetricDetail;
    rouge: MetricDetail;
    meteor: MetricDetail;
    bertScore: MetricDetail;
    intentAlignment: MetricDetail;
    completeness: MetricDetail;
    grounding: MetricDetail;
    hallucination: MetricDetail; // 0 = high hallucination, 1 = no hallucination
    professionalism: MetricDetail;
    safety: MetricDetail;
  };
  ruleEngine: RuleEngineResult;
}

/**
 * Basic Tokenizer helper.
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Calculate BLEU-4 score.
 */
export function calculateBLEU(reference: string, candidate: string): number {
  const refTokens = tokenize(reference);
  const candTokens = tokenize(candidate);

  if (refTokens.length === 0 || candTokens.length === 0) return 0;

  const countNGrams = (tokens: string[], n: number): Record<string, number> => {
    const counts: Record<string, number> = {};
    for (let i = 0; i <= tokens.length - n; i++) {
      const gram = tokens.slice(i, i + n).join(' ');
      counts[gram] = (counts[gram] || 0) + 1;
    }
    return counts;
  };

  const precisions: number[] = [];
  
  // Calculate precision for 1, 2, 3, 4-grams
  for (let n = 1; n <= 4; n++) {
    const refGrams = countNGrams(refTokens, n);
    const candGrams = countNGrams(candTokens, n);

    let matches = 0;
    let totalCandGrams = 0;

    for (const [gram, count] of Object.entries(candGrams)) {
      totalCandGrams += count;
      if (refGrams[gram]) {
        matches += Math.min(count, refGrams[gram]);
      }
    }

    if (totalCandGrams === 0) {
      precisions.push(0);
    } else {
      precisions.push(matches / totalCandGrams);
    }
  }

  // Geometric mean of precisions
  const logSum = precisions.reduce((sum, p) => sum + (p > 0 ? Math.log(p) : -999), 0);
  const geoMean = Math.exp(logSum / 4);

  // Brevity Penalty
  const r = refTokens.length;
  const c = candTokens.length;
  const brevityPenalty = c > r ? 1 : Math.exp(1 - r / c);

  return brevityPenalty * geoMean;
}

/**
 * Calculate ROUGE-L (Longest Common Subsequence) score.
 */
export function calculateROUGEL(reference: string, candidate: string): number {
  const refTokens = tokenize(reference);
  const candTokens = tokenize(candidate);

  const rLen = refTokens.length;
  const cLen = candTokens.length;

  if (rLen === 0 || cLen === 0) return 0;

  // Dynamic Programming table for LCS
  const dp = Array.from({ length: rLen + 1 }, () => new Array(cLen + 1).fill(0));

  for (let i = 1; i <= rLen; i++) {
    for (let j = 1; j <= cLen; j++) {
      if (refTokens[i - 1] === candTokens[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const lcs = dp[rLen][cLen];
  const recall = lcs / rLen;
  const precision = lcs / cLen;

  if (recall + precision === 0) return 0;
  return (2 * recall * precision) / (recall + precision);
}

/**
 * Porter-like stemmer clean helper for METEOR.
 */
function stemWord(word: string): string {
  let stemmed = word.toLowerCase().trim();
  // Strip common suffixes
  if (stemmed.endsWith('ing')) stemmed = stemmed.slice(0, -3);
  else if (stemmed.endsWith('ed')) stemmed = stemmed.slice(0, -2);
  else if (stemmed.endsWith('es')) stemmed = stemmed.slice(0, -2);
  else if (stemmed.endsWith('s') && !stemmed.endsWith('ss')) stemmed = stemmed.slice(0, -1);
  else if (stemmed.endsWith('ly')) stemmed = stemmed.slice(0, -2);
  else if (stemmed.endsWith('ment')) stemmed = stemmed.slice(0, -4);
  return stemmed;
}

/**
 * Calculate METEOR score (simplified exact + stem word alignment).
 */
export function calculateMETEOR(reference: string, candidate: string): number {
  const refTokens = tokenize(reference);
  const candTokens = tokenize(candidate);

  if (refTokens.length === 0 || candTokens.length === 0) return 0;

  // Alignments: exact match
  const refUsed = new Set<number>();
  const candUsed = new Set<number>();
  let matches = 0;

  // 1. Exact matches
  for (let i = 0; i < refTokens.length; i++) {
    for (let j = 0; j < candTokens.length; j++) {
      if (!refUsed.has(i) && !candUsed.has(j) && refTokens[i] === candTokens[j]) {
        refUsed.add(i);
        candUsed.add(j);
        matches++;
        break;
      }
    }
  }

  // 2. Stem matches for remaining tokens
  for (let i = 0; i < refTokens.length; i++) {
    if (refUsed.has(i)) continue;
    const refStem = stemWord(refTokens[i]);
    for (let j = 0; j < candTokens.length; j++) {
      if (candUsed.has(j)) continue;
      const candStem = stemWord(candTokens[j]);
      if (refStem === candStem) {
        refUsed.add(i);
        candUsed.add(j);
        matches++;
        break;
      }
    }
  }

  const precision = matches / candTokens.length;
  const recall = matches / refTokens.length;

  if (precision + recall === 0) return 0;
  
  // Harmonic mean
  const fMean = (10 * precision * recall) / (recall + 9 * precision);

  // Penalty calculation based on chunk fragmentation
  // Group matches into adjacent chunks to evaluate ordering
  let chunks = 0;
  let lastRefIdx = -1;
  
  // Simple approximation of chunking penalty
  if (matches > 0) {
    chunks = 1;
    // Check if the order is broken
    // (This is a simplified chunk count estimator)
    for (let i = 0; i < refTokens.length; i++) {
      if (refUsed.has(i)) {
        if (lastRefIdx !== -1 && i !== lastRefIdx + 1) {
          chunks++;
        }
        lastRefIdx = i;
      }
    }
  }

  const penalty = 0.5 * Math.pow(chunks / matches, 3);
  return fMean * (1 - penalty);
}

/**
 * Calculates token-level BERTScore using local embeddings.
 */
export async function calculateBERTScore(
  reference: string,
  candidate: string
): Promise<number> {
  const refRes = await getTokenEmbeddings(reference);
  const candRes = await getTokenEmbeddings(candidate);

  if (refRes.embeddings.length === 0 || candRes.embeddings.length === 0) {
    return 0.5; // Fallback
  }

  // Compute similarity matrix [ref_len, cand_len]
  const similarities: number[][] = [];
  for (let r = 0; r < refRes.embeddings.length; r++) {
    similarities[r] = [];
    for (let c = 0; c < candRes.embeddings.length; c++) {
      similarities[r][c] = cosineSimilarity(refRes.embeddings[r], candRes.embeddings[c]);
    }
  }

  // Recall: average of max candidate similarity for each reference token
  let recallSum = 0;
  for (let r = 0; r < refRes.embeddings.length; r++) {
    let maxSim = -1;
    for (let c = 0; c < candRes.embeddings.length; c++) {
      if (similarities[r][c] > maxSim) maxSim = similarities[r][c];
    }
    recallSum += maxSim;
  }
  const recall = recallSum / refRes.embeddings.length;

  // Precision: average of max reference similarity for each candidate token
  let precisionSum = 0;
  for (let c = 0; c < candRes.embeddings.length; c++) {
    let maxSim = -1;
    for (let r = 0; r < refRes.embeddings.length; r++) {
      if (similarities[r][c] > maxSim) maxSim = similarities[r][c];
    }
    precisionSum += maxSim;
  }
  const precision = precisionSum / candRes.embeddings.length;

  if (precision + recall === 0) return 0;
  const f1 = (2 * precision * recall) / (precision + recall);
  
  // Scale score to sensible range (e.g. 0.0 - 1.0)
  return Math.max(0, f1);
}

/**
 * LLM Judge Qualitative Evaluation.
 */
async function runLLMJudge(
  incomingEmail: string,
  referenceReply: string,
  generatedReply: string
): Promise<Record<string, { score: number; reason: string; confidence: number }>> {
  const prompt = `You are an expert AI Email Auditor and Judge. Evaluate the generated email response against the incoming email and the target reference reply.
Analyze the qualitative aspects carefully and output a raw JSON object containing scores (between 0.0 and 1.0), justifications, and confidence ratings for the following metrics:

1. Intent Alignment: Does the reply align with the user intent?
2. Completeness: Are all customer questions and needs addressed?
3. Grounding: Is the reply fully grounded in facts?
4. Hallucination: Are there any fabricated facts or claims not supported by context? (1.0 = no hallucinations, 0.0 = high hallucinations)
5. Professionalism: Is the tone appropriate and polite?
6. Safety: Does the reply avoid leaking internal secrets, toxicity, or unsafe contents?
7. Action Item Accuracy: Are the next steps or links correct and consistent?

Incoming Email:
${incomingEmail}

Reference Reply:
${referenceReply}

Generated Reply:
${generatedReply}

Response MUST be a valid JSON object ONLY. Do not include markdown formatting or code blocks (e.g. do NOT wrap in JSON markers). Important: Make sure to escape any double quotes (\") or newlines (\n) inside the string fields to keep the JSON valid. Use exactly this JSON template:
{
  "intentAlignment": { "score": 0.9, "reason": "Reason details...", "confidence": 0.95 },
  "completeness": { "score": 0.8, "reason": "Reason details...", "confidence": 0.9 },
  "grounding": { "score": 1.0, "reason": "Reason details...", "confidence": 1.0 },
  "hallucination": { "score": 1.0, "reason": "Reason details...", "confidence": 1.0 },
  "professionalism": { "score": 0.9, "reason": "Reason details...", "confidence": 0.95 },
  "safety": { "score": 1.0, "reason": "Reason details...", "confidence": 1.0 },
  "actionItemAccuracy": { "score": 0.9, "reason": "Reason details...", "confidence": 0.9 }
}`;

  try {
    const result = await callLLM([
      { role: 'system', content: 'You are a precise evaluator. Output valid JSON only.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.1 });

    // Parse JSON
    const cleanText = result.text.substring(result.text.indexOf('{'), result.text.lastIndexOf('}') + 1);
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('LLM Judge failed, using fallback qualitative scores:', error);
    // Fallback template
    return {
      intentAlignment: { score: 0.8, reason: 'Fallback default evaluation.', confidence: 0.7 },
      completeness: { score: 0.8, reason: 'Fallback default evaluation.', confidence: 0.7 },
      grounding: { score: 0.8, reason: 'Fallback default evaluation.', confidence: 0.7 },
      hallucination: { score: 1.0, reason: 'Fallback default evaluation.', confidence: 0.7 },
      professionalism: { score: 0.9, reason: 'Fallback default evaluation.', confidence: 0.7 },
      safety: { score: 1.0, reason: 'Fallback default evaluation.', confidence: 0.7 },
      actionItemAccuracy: { score: 0.8, reason: 'Fallback default evaluation.', confidence: 0.7 }
    };
  }
}

/**
 * Orchestrates the full evaluation suite.
 */
export async function evaluateResponse(
  incomingEmail: string,
  referenceReply: string,
  generatedReply: string
): Promise<EvaluationReport> {
  const start = Date.now();
  console.log('Running evaluation suite...');

  // 1. Lexical Computations
  const bleuScore = calculateBLEU(referenceReply, generatedReply);
  const rougeScore = calculateROUGEL(referenceReply, generatedReply);
  const meteorScore = calculateMETEOR(referenceReply, generatedReply);

  // 2. Local Token Embeddings (BERTScore & Semantic Similarity)
  const bertScoreF1 = await calculateBERTScore(referenceReply, generatedReply);
  
  // Sentence embedding cosine similarity
  let semanticSim = 0.8;
  try {
    const refEmb = await getLocalSentenceEmbedding(referenceReply);
    const genEmb = await getLocalSentenceEmbedding(generatedReply);
    semanticSim = cosineSimilarity(refEmb, genEmb);
  } catch (err) {
    console.error('Failed to compute semantic similarity embedding:', err);
  }

  // 3. Rule Engine Validation
  const ruleResult = runRuleEngine(incomingEmail, referenceReply, generatedReply);

  // 4. LLM Judge Evaluation
  const judgeScores = await runLLMJudge(incomingEmail, referenceReply, generatedReply);

  // Define weights for each metric
  const weights = {
    semanticSimilarity: 0.15,
    bleu: 0.05,
    rouge: 0.05,
    meteor: 0.05,
    bertScore: 0.15,
    intentAlignment: 0.15,
    completeness: 0.10,
    grounding: 0.10,
    hallucination: 0.10,
    professionalism: 0.05,
    safety: 0.05
  };

  // Compile detailed metrics mapping
  const metrics = {
    semanticSimilarity: {
      score: semanticSim,
      reason: 'Cosine similarity of sentence embedding vector representations.',
      confidence: 0.9,
      weight: weights.semanticSimilarity
    },
    bleu: {
      score: bleuScore,
      reason: 'N-gram precision comparison over 4-grams with brevity penalty.',
      confidence: 0.95,
      weight: weights.bleu
    },
    rouge: {
      score: rougeScore,
      reason: 'F1 score based on the Longest Common Subsequence overlap.',
      confidence: 0.95,
      weight: weights.rouge
    },
    meteor: {
      score: meteorScore,
      reason: 'Harmonic mean of word stem alignments and ordering penalties.',
      confidence: 0.9,
      weight: weights.meteor
    },
    bertScore: {
      score: bertScoreF1,
      reason: 'Local word-level token vector alignment similarity scoring.',
      confidence: 0.8,
      weight: weights.bertScore
    },
    intentAlignment: {
      score: judgeScores.intentAlignment.score,
      reason: judgeScores.intentAlignment.reason,
      confidence: judgeScores.intentAlignment.confidence,
      weight: weights.intentAlignment
    },
    completeness: {
      score: judgeScores.completeness.score,
      reason: judgeScores.completeness.reason,
      confidence: judgeScores.completeness.confidence,
      weight: weights.completeness
    },
    grounding: {
      score: judgeScores.grounding.score,
      reason: judgeScores.grounding.reason,
      confidence: judgeScores.grounding.confidence,
      weight: weights.grounding
    },
    hallucination: {
      score: judgeScores.hallucination.score,
      reason: judgeScores.hallucination.reason,
      confidence: judgeScores.hallucination.confidence,
      weight: weights.hallucination
    },
    professionalism: {
      score: judgeScores.professionalism.score,
      reason: judgeScores.professionalism.reason,
      confidence: judgeScores.professionalism.confidence,
      weight: weights.professionalism
    },
    safety: {
      score: judgeScores.safety.score,
      reason: judgeScores.safety.reason,
      confidence: judgeScores.safety.confidence,
      weight: weights.safety
    }
  };

  // Weighted overall calculation
  let totalScore = 0;
  for (const [key, value] of Object.entries(metrics)) {
    totalScore += value.score * value.weight;
  }

  // Deterministic rule engine penalty: if a critical rule is violated, apply a cap or penalty
  let rulePenalty = 0;
  const criticalViolations = ruleResult.violations.filter(v => v.severity === 'critical' && !v.passed);
  if (criticalViolations.length > 0) {
    rulePenalty = 0.15 * criticalViolations.length; // deduct 15% per critical violation
  }
  const finalScore = Math.max(0, Math.min(1, totalScore - rulePenalty));

  // Determine Overall Confidence Estimation
  let confidence: 'High' | 'Medium' | 'Low' = 'High';
  let justification = 'The generated response exhibits excellent semantic, lexical, and deterministic alignments.';

  if (criticalViolations.length > 0 || finalScore < 0.70 || judgeScores.hallucination.score < 0.8) {
    confidence = 'Low';
    justification = `Evaluation reveals potential issues: ${criticalViolations.length} critical rule violations detected and/or low grounding probability.`;
  } else if (finalScore < 0.85 || ruleResult.violations.some(v => !v.passed)) {
    confidence = 'Medium';
    justification = 'The response passes critical constraints, but shows minor alignment variations or warning violations.';
  }

  console.log(`Evaluation suite completed in ${Date.now() - start}ms. Score: ${finalScore.toFixed(3)}`);

  return {
    overallScore: finalScore,
    confidence,
    justification,
    metrics,
    ruleEngine: ruleResult
  };
}

export interface SelfCorrectionResult {
  originalResponse: string;
  improvedResponse: string;
  beforeScore: number;
  afterScore: number;
  critique: string;
  improvedReport: EvaluationReport;
}

/**
 * Executes a feedback-critique self-correction loop on a low-scoring generated response.
 */
export async function selfCorrectResponse(
  incomingEmail: string,
  referenceReply: string,
  originalResponse: string,
  evalReport: EvaluationReport,
  options: { model?: string } = {}
): Promise<SelfCorrectionResult> {
  console.log('Initiating self-correction loop...');

  // 1. Gather issues
  const lowMetrics: string[] = [];
  for (const [key, value] of Object.entries(evalReport.metrics)) {
    if (value.score < 0.8) {
      lowMetrics.push(`${key} (Score: ${value.score.toFixed(2)} - ${value.reason})`);
    }
  }

  const failedRules = evalReport.ruleEngine.violations
    .filter(v => !v.passed)
    .map(v => `${v.rule} (${v.severity} - ${v.reason})`);

  // 2. Draft the critique prompt
  const critiquePrompt = `You are a critical AI evaluator. Analyze this draft response which failed our production-quality standards.
Identify the flaws, factual contradictions, or missing action items, and write a concise critique explaining how to fix the response.

Incoming Email:
${incomingEmail}

Reference Reply:
${referenceReply}

Failed Draft Response:
${originalResponse}

Failed Metrics:
${lowMetrics.length > 0 ? lowMetrics.join('\n') : 'None'}

Failed Rule Engine Constraints:
${failedRules.length > 0 ? failedRules.join('\n') : 'None'}

Justification:
${evalReport.justification}

Provide a structured, step-by-step critique on how to rewrite the draft to fix all these problems.
Critique:`;

  const critiqueResult = await callLLM([
    { role: 'system', content: 'You are a helpful and critical editor.' },
    { role: 'user', content: critiquePrompt }
  ], { model: options.model, temperature: 0.2 });

  const critique = critiqueResult.text;
  console.log('Generated critique analysis:', critique);

  // 3. Request improved response using critique
  const regenerationPrompt = `You are a senior professional writer. Rewrite the draft response to make it production-grade by incorporating the critique.

Incoming Email:
${incomingEmail}

Reference Reply:
${referenceReply}

Original Failed Draft:
${originalResponse}

Critique to Address:
${critique}

Provide only the final rewritten response. Do not include introductory notes, explanations, or signatures.
Revised Response:`;

  const improvedResult = await callLLM([
    { role: 'system', content: 'You write precise, corrected email responses.' },
    { role: 'user', content: regenerationPrompt }
  ], { model: options.model, temperature: 0.4 });

  const improvedResponse = improvedResult.text;

  // 4. Re-evaluate the improved response
  const improvedReport = await evaluateResponse(
    incomingEmail,
    referenceReply,
    improvedResponse
  );

  return {
    originalResponse,
    improvedResponse,
    beforeScore: evalReport.overallScore,
    afterScore: improvedReport.overallScore,
    critique,
    improvedReport
  };
}

