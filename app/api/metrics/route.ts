import { NextResponse } from 'next/server';
import { supabase } from '../../../db/client';

export async function GET() {
  try {
    const { data: logs, error } = await supabase
      .from('system_logs')
      .select('latency_ms, level, token_usage_json');

    if (error) throw error;

    let totalCalls = 0;
    let sumLatency = 0;
    let maxLatency = 0;
    let minLatency = Infinity;
    
    let totalTokens = 0;
    let promptTokens = 0;
    let completionTokens = 0;
    let systemErrorsCount = 0;

    (logs || []).forEach(log => {
      if (log.latency_ms !== null && log.latency_ms !== undefined) {
        totalCalls++;
        sumLatency += log.latency_ms;
        if (log.latency_ms > maxLatency) maxLatency = log.latency_ms;
        if (log.latency_ms < minLatency) minLatency = log.latency_ms;
      }
      
      if (log.level === 'ERROR') {
        systemErrorsCount++;
      }
      
      const usage = log.token_usage_json || {};
      const tot = parseInt(usage.totalTokens || usage.total || 0);
      const pr = parseInt(usage.promptTokens || usage.prompt || 0);
      const comp = parseInt(usage.completionTokens || usage.completion || 0);
      
      totalTokens += tot;
      promptTokens += pr;
      completionTokens += comp;
    });

    const avgLatencyMs = totalCalls > 0 ? sumLatency / totalCalls : 0;
    const finalMinLatency = minLatency === Infinity ? 0 : minLatency;

    // Token cost approximation (e.g. Llama 3 70b / Step 3.5: roughly $0.59 / million prompt tokens, $0.79 / million completion tokens)
    const promptCostPerToken = 0.59 / 1000000;
    const completionCostPerToken = 0.79 / 1000000;
    const totalCost = (promptTokens * promptCostPerToken) + (completionTokens * completionCostPerToken);

    return NextResponse.json({
      totalCalls,
      avgLatencyMs,
      maxLatencyMs: maxLatency,
      minLatencyMs: finalMinLatency,
      tokenUsage: {
        total: totalTokens,
        prompt: promptTokens,
        completion: completionTokens
      },
      estimatedCostUSD: totalCost,
      systemErrorsCount,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Failed to query metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics', details: error.message }, { status: 500 });
  }
}
