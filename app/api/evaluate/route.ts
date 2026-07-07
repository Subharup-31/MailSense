import { NextResponse } from 'next/server';
import { z } from 'zod';
import { evaluateResponse } from '../../../lib/evaluator';
import { logEvent } from '../../../lib/logger';

const evaluateSchema = z.object({
  incomingEmail: z.string().min(1),
  referenceReply: z.string().min(1),
  generatedReply: z.string().min(1),
});

export async function POST(req: Request) {
  const start = Date.now();
  
  try {
    const body = await req.json();
    const parsed = evaluateSchema.parse(body);
    
    const report = await evaluateResponse(
      parsed.incomingEmail,
      parsed.referenceReply,
      parsed.generatedReply
    );

    const latencyMs = Date.now() - start;
    await logEvent(
      'INFO',
      'Completed manual evaluation request',
      { overallScore: report.overallScore },
      latencyMs
    );

    return NextResponse.json(report);
  } catch (error: any) {
    const latencyMs = Date.now() - start;
    await logEvent(
      'ERROR',
      'API Evaluation failed',
      { error: error.message || error },
      latencyMs
    );
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input parameters', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to run evaluation', details: error.message }, { status: 500 });
  }
}
