import { NextResponse } from 'next/server';
import { z } from 'zod';
import { selfCorrectResponse } from '../../../lib/evaluator';
import { logEvent } from '../../../lib/logger';

const improveSchema = z.object({
  incomingEmail: z.string().min(1),
  referenceReply: z.string().min(1),
  originalResponse: z.string().min(1),
  evalReport: z.any(), // Accepts full EvaluationReport object
  model: z.string().optional(),
});

export async function POST(req: Request) {
  const start = Date.now();
  
  try {
    const body = await req.json();
    const parsed = improveSchema.parse(body);
    
    const result = await selfCorrectResponse(
      parsed.incomingEmail,
      parsed.referenceReply,
      parsed.originalResponse,
      parsed.evalReport,
      { model: parsed.model }
    );

    const latencyMs = Date.now() - start;
    await logEvent(
      'INFO',
      'Completed manual self-correction request',
      { beforeScore: result.beforeScore, afterScore: result.afterScore },
      latencyMs
    );

    return NextResponse.json(result);
  } catch (error: any) {
    const latencyMs = Date.now() - start;
    await logEvent(
      'ERROR',
      'API Self-Correction failed',
      { error: error.message || error },
      latencyMs
    );
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input parameters', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to run improvement loop', details: error.message }, { status: 500 });
  }
}
