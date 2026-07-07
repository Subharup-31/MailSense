import { NextResponse } from 'next/server';
import { supabase } from '../../../db/client';

export async function GET(req: Request) {
  try {
    // 1. Fetch Evaluations
    const { data: evaluations, error: evalError } = await supabase
      .from('evaluations')
      .select('overall_score, confidence, metrics_json, rules_json');

    if (evalError) throw evalError;

    // 2. Fetch Responses with related email categories
    const { data: responses, error: respError } = await supabase
      .from('responses')
      .select(`
        id,
        current_response,
        status,
        score_overall,
        emails (
          category
        )
      `);

    if (respError) throw respError;

    // 3. Fetch System Logs
    const { data: logs, error: logsError } = await supabase
      .from('system_logs')
      .select('latency_ms, token_usage_json');

    if (logsError) throw logsError;

    // 4. Compute Metrics in JS
    let totalEvaluations = evaluations?.length || 0;
    let sumScore = 0;
    let confidenceHigh = 0;
    let confidenceMedium = 0;
    let confidenceLow = 0;

    let sumBleu = 0, sumRouge = 0, sumMeteor = 0, sumBert = 0, sumSemantic = 0;
    let sumIntent = 0, sumCompleteness = 0, sumGrounding = 0, sumHallucination = 0, sumProfessionalism = 0, sumSafety = 0;
    let countMetrics = 0;

    const ruleCounts: Record<string, { failed: number, total: number }> = {
      'Correct Dates': { failed: 0, total: 0 },
      'Correct Names & Entities': { failed: 0, total: 0 },
      'Mismatched Numbers': { failed: 0, total: 0 },
      'Attachment Consistency': { failed: 0, total: 0 },
      'Question Coverage': { failed: 0, total: 0 },
      'Action Item Accuracy': { failed: 0, total: 0 }
    };

    evaluations?.forEach(e => {
      sumScore += parseFloat(e.overall_score) || 0;
      if (e.confidence === 'High') confidenceHigh++;
      else if (e.confidence === 'Medium') confidenceMedium++;
      else if (e.confidence === 'Low') confidenceLow++;

      const metrics = e.metrics_json || {};
      if (metrics.bleu) {
        countMetrics++;
        sumBleu += parseFloat(metrics.bleu.score) || 0;
        sumRouge += parseFloat(metrics.rouge?.score) || 0;
        sumMeteor += parseFloat(metrics.meteor?.score) || 0;
        sumBert += parseFloat(metrics.bertScore?.score) || 0;
        sumSemantic += parseFloat(metrics.semanticSimilarity?.score) || 0;
        sumIntent += parseFloat(metrics.intentAlignment?.score) || 0;
        sumCompleteness += parseFloat(metrics.completeness?.score) || 0;
        sumGrounding += parseFloat(metrics.grounding?.score) || 0;
        sumHallucination += parseFloat(metrics.hallucination?.score) || 0;
        sumProfessionalism += parseFloat(metrics.professionalism?.score) || 0;
        sumSafety += parseFloat(metrics.safety?.score) || 0;
      }

      const violations = e.rules_json?.violations;
      if (Array.isArray(violations)) {
        violations.forEach((v: any) => {
          if (ruleCounts[v.rule]) {
            ruleCounts[v.rule].total++;
            if (!v.passed) {
              ruleCounts[v.rule].failed++;
            }
          }
        });
      }
    });

    const averageScore = totalEvaluations > 0 ? sumScore / totalEvaluations : 0;
    const avgMetric = (sum: number) => countMetrics > 0 ? sum / countMetrics : 0;

    // Aggregate category performance & lengths
    const categoriesMap: Record<string, { count: number, sumScore: number }> = {};
    let totalLength = 0;
    let totalRuns = responses?.length || 0;
    let improvedRuns = 0;

    responses?.forEach(r => {
      const email = Array.isArray(r.emails) ? r.emails[0] : r.emails;
      const cat = email?.category || 'General';
      if (!categoriesMap[cat]) {
        categoriesMap[cat] = { count: 0, sumScore: 0 };
      }
      categoriesMap[cat].count++;
      categoriesMap[cat].sumScore += parseFloat(r.score_overall) || 0;

      totalLength += (r.current_response || '').length;
      if (r.status === 'improved') {
        improvedRuns++;
      }
    });

    const categoryPerformance = Object.entries(categoriesMap).map(([category, val]) => ({
      category,
      count: val.count,
      averageScore: val.count > 0 ? val.sumScore / val.count : 0
    })).sort((a, b) => b.averageScore - a.averageScore);

    const avgLength = totalRuns > 0 ? totalLength / totalRuns : 0;

    // Aggregate log parameters
    let totalCalls = 0;
    let sumLatency = 0;
    let totalTokens = 0, promptTokens = 0, completionTokens = 0;

    logs?.forEach(log => {
      if (log.latency_ms !== null && log.latency_ms !== undefined) {
        totalCalls++;
        sumLatency += log.latency_ms;
      }
      const usage = log.token_usage_json || {};
      totalTokens += parseInt(usage.totalTokens || usage.total || 0);
      promptTokens += parseInt(usage.promptTokens || usage.prompt || 0);
      completionTokens += parseInt(usage.completionTokens || usage.completion || 0);
    });

    const avgLatency = totalCalls > 0 ? sumLatency / totalCalls : 0;

    return NextResponse.json({
      summary: {
        totalEvaluations,
        averageScore,
        averageLatencyMs: avgLatency,
        averageLengthChars: Math.round(avgLength),
        tokenUsage: {
          total: totalTokens,
          prompt: promptTokens,
          completion: completionTokens
        }
      },
      metricBreakdown: {
        semanticSimilarity: avgMetric(sumSemantic),
        bleu: avgMetric(sumBleu),
        rouge: avgMetric(sumRouge),
        meteor: avgMetric(sumMeteor),
        bertScore: avgMetric(sumBert),
        intentAlignment: avgMetric(sumIntent),
        completeness: avgMetric(sumCompleteness),
        grounding: avgMetric(sumGrounding),
        hallucination: avgMetric(sumHallucination),
        professionalism: avgMetric(sumProfessionalism),
        safety: avgMetric(sumSafety)
      },
      categoryPerformance,
      confidenceDistribution: {
        High: confidenceHigh,
        Medium: confidenceMedium,
        Low: confidenceLow
      },
      ruleEngineFailures: Object.entries(ruleCounts).map(([rule, val]) => ({
        rule,
        failCount: val.failed,
        passRate: val.total > 0 ? (val.total - val.failed) / val.total : 1.0
      })),
      selfCorrection: {
        totalResponses: totalRuns,
        improvedResponses: improvedRuns,
        improvementRate: totalRuns > 0 ? improvedRuns / totalRuns : 0
      }
    });

  } catch (error: any) {
    console.error('Failed to query analytics:', error);
    return NextResponse.json({ error: 'Failed to retrieve analytics', details: error.message }, { status: 500 });
  }
}
