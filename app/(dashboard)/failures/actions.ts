'use server';

import { supabase } from '@/db/client';

export interface FailureRecord {
  id: string;
  subject: string;
  body: string;
  category: string;
  referenceReply: string;
  originalResponse: string;
  currentResponse: string;
  scoreOverall: number;
  status: string;
  createdAt: string;
  metricsJson: any;
  rulesJson: any;
  critique: string | null;
}

/**
 * Server Action to fetch evaluation failures and self-corrections.
 */
export async function getFailuresAndCorrections(): Promise<FailureRecord[]> {
  try {
    const { data, error } = await supabase
      .from('responses')
      .select(`
        id,
        original_response,
        current_response,
        score_overall,
        status,
        created_at,
        evaluations!evaluations_response_id_fkey (
          metrics_json,
          rules_json,
          critique
        ),
        emails (
          subject,
          body,
          category,
          reply
        )
      `)
      .or('score_overall.lt.0.85,status.eq.improved')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    if (!data) return [];
    
    return data.map((row: any) => {
      // Supabase returns related objects. Handle both array and single formats.
      const email = Array.isArray(row.emails) ? row.emails[0] : row.emails;
      const evaluation = Array.isArray(row.evaluations) ? row.evaluations[0] : row.evaluations;

      return {
        id: row.id,
        subject: email?.subject || 'No Subject',
        body: email?.body || '',
        category: email?.category || 'General',
        referenceReply: email?.reply || '',
        originalResponse: row.original_response,
        currentResponse: row.current_response,
        scoreOverall: parseFloat(row.score_overall) || 0,
        status: row.status,
        createdAt: new Date(row.created_at).toISOString(),
        metricsJson: evaluation?.metrics_json || {},
        rulesJson: evaluation?.rules_json || {},
        critique: evaluation?.critique || null
      };
    });
  } catch (error) {
    console.error('Failed to fetch failure records:', error);
    return [];
  }
}
