import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '../../../db/client';
import { retrieveSimilarEmails } from '../../../lib/pinecone';
import { callLLM, compilePrompt, getActivePromptTemplate } from '../../../lib/openrouter';
import { evaluateResponse, selfCorrectResponse } from '../../../lib/evaluator';
import { logEvent } from '../../../lib/logger';

const generateSchema = z.object({
  subject: z.string().min(1),
  body: z.string().min(1),
  category: z.string().optional(),
  tone: z.string().optional().default('Professional'),
  model: z.string().optional(),
  temperature: z.number().optional().default(0.7),
  emailId: z.string().uuid().optional(), // If running against a specific seed email
});

export async function POST(req: Request) {
  const start = Date.now();
  
  try {
    const body = await req.json();
    const parsed = generateSchema.parse(body);
    
    // 1. Retrieve similar email threads for context
    const retrieved = await retrieveSimilarEmails(
      `${parsed.subject} ${parsed.body}`,
      parsed.category,
      3
    );
    
    // Format retrieved examples for the prompt builder
    const examplesText = retrieved.map((item, index) => {
      return `Example ${index + 1}:
Category: ${item.category}
Subject: ${item.subject}
Incoming Email: ${item.body}
Ideal Response: ${item.reply}
---`;
    }).join('\n\n');

    // 2. Fetch and compile prompt template
    const templateData = await getActivePromptTemplate();
    const compiledPromptText = compilePrompt(templateData.content, {
      subject: parsed.subject,
      body: parsed.body,
      tone: parsed.tone,
      examples: examplesText || 'No reference examples available.'
    });

    // 3. Request LLM response
    const llmResult = await callLLM([
      { 
        role: 'system', 
        content: 'You are a professional customer support representative and company agent. Your goal is to draft decisive, helpful corporate replies that answer customer questions directly and accurately, following our strict business context and reference examples. Do not ask redundant questions, and do not repeat customer questions verbatim.' 
      },
      { role: 'user', content: compiledPromptText }
    ], {
      model: parsed.model,
      temperature: parsed.temperature
    });

    // 4. Run Evaluation Framework
    // If the request contains a seed email ID, use its target reply as reference.
    // Otherwise, use the top retrieved match reply as reference.
    let referenceReply = 'Please write back to confirm our request.';
    if (parsed.emailId) {
      const { data: emailData } = await supabase
        .from('emails')
        .select('reply')
        .eq('id', parsed.emailId)
        .limit(1);
      if (emailData && emailData.length > 0) {
        referenceReply = emailData[0].reply;
      }
    } else if (retrieved.length > 0) {
      referenceReply = retrieved[0].reply;
    }

    const evalReport = await evaluateResponse(
      parsed.body,
      referenceReply,
      llmResult.text
    );

    // 5. Check Self-Correction Loop
    const threshold = parseFloat(process.env.EVALUATION_THRESHOLD || '0.80');
    let finalResponse = llmResult.text;
    let finalReport = evalReport;
    let originalResponse: string | null = null;
    let beforeScore: number | null = null;
    let afterScore: number | null = null;
    let critique: string | null = null;
    let status = 'generated';

    if (evalReport.overallScore < threshold) {
      console.log(`Score ${evalReport.overallScore.toFixed(3)} is below threshold ${threshold}. Triggering self-correction...`);
      status = 'improved';
      
      const correctionResult = await selfCorrectResponse(
        parsed.body,
        referenceReply,
        llmResult.text,
        evalReport,
        { model: parsed.model }
      );

      finalResponse = correctionResult.improvedResponse;
      finalReport = correctionResult.improvedReport;
      originalResponse = correctionResult.originalResponse;
      beforeScore = correctionResult.beforeScore;
      afterScore = correctionResult.afterScore;
      critique = correctionResult.critique;
    }

    // 6. Write details to Database using Supabase client
    const { data: responseData, error: responseError } = await supabase
      .from('responses')
      .insert({
        email_id: parsed.emailId || null,
        model: llmResult.model,
        prompt_version_id: templateData.id === 'default' ? null : templateData.id,
        original_response: originalResponse || llmResult.text,
        current_response: finalResponse,
        score_overall: finalReport.overallScore,
        confidence_score: finalReport.confidence,
        status
      })
      .select('id');

    if (responseError) throw responseError;
    if (!responseData || responseData.length === 0) throw new Error('Failed to insert response');
    const responseId = responseData[0].id;

    const { error: evalInsertError } = await supabase
      .from('evaluations')
      .insert({
        response_id: responseId,
        metrics_json: finalReport.metrics,
        rules_json: finalReport.ruleEngine,
        judge_json: { justification: finalReport.justification },
        overall_score: finalReport.overallScore,
        confidence: finalReport.confidence,
        status: finalReport.overallScore >= threshold ? 'passed' : 'failed',
        improved_from_response_id: status === 'improved' ? responseId : null,
        critique
      });

    if (evalInsertError) throw evalInsertError;

    const latencyMs = Date.now() - start;

    // Log the success
    await logEvent(
      'INFO',
      `Generated reply for subject "${parsed.subject}"`,
      {
        responseId,
        status,
        overallScore: finalReport.overallScore,
        latencyMs
      },
      latencyMs,
      llmResult.usage
    );

    return NextResponse.json({
      responseId,
      response: finalResponse,
      originalResponse,
      beforeScore,
      afterScore,
      critique,
      evaluationReport: finalReport,
      retrievedContext: retrieved,
      latencyMs
    });

  } catch (error: any) {
    const latencyMs = Date.now() - start;
    await logEvent(
      'ERROR',
      'API Generation failed',
      { error: error.message || error },
      latencyMs
    );
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input parameters', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to generate response', details: error.message }, { status: 500 });
  }
}
