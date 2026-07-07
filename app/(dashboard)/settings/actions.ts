'use server';

import { supabase } from '@/db/client';

export interface PromptTemplate {
  id: string;
  name: string;
  content: string;
  version: number;
  isActive: boolean;
  updatedAt: string;
}

/**
 * Fetch the active prompt template.
 */
export async function getActivePrompt(): Promise<PromptTemplate | null> {
  try {
    const { data, error } = await supabase
      .from('prompt_versions')
      .select('id, name, content, version, is_active, updated_at')
      .eq('is_active', true)
      .limit(1);

    if (error) throw error;
    if (data && data.length > 0) {
      const row = data[0];
      return {
        id: row.id,
        name: row.name,
        content: row.content,
        version: row.version,
        isActive: row.is_active,
        updatedAt: new Date(row.updated_at).toISOString()
      };
    }
  } catch (error) {
    console.error('Failed to fetch prompt template:', error);
  }
  return null;
}

/**
 * Save a new prompt template version.
 */
export async function saveNewPrompt(name: string, content: string): Promise<PromptTemplate | null> {
  try {
    // Get max version
    const { data: maxData, error: maxError } = await supabase
      .from('prompt_versions')
      .select('version')
      .order('version', { ascending: false })
      .limit(1);

    if (maxError) throw maxError;
    const maxVersion = maxData && maxData.length > 0 ? maxData[0].version : 0;
    const newVersion = maxVersion + 1;

    // Set all previous to inactive
    const { error: updateError } = await supabase
      .from('prompt_versions')
      .update({ is_active: false })
      .eq('is_active', true);

    if (updateError) throw updateError;

    // Insert new active prompt
    const { data: insertData, error: insertError } = await supabase
      .from('prompt_versions')
      .insert({
        name,
        content,
        version: newVersion,
        is_active: true
      })
      .select('id, name, content, version, is_active, updated_at');

    if (insertError) throw insertError;
    if (!insertData || insertData.length === 0) throw new Error('No data returned from insert');

    const row = insertData[0];
    return {
      id: row.id,
      name: row.name,
      content: row.content,
      version: row.version,
      isActive: row.is_active,
      updatedAt: new Date(row.updated_at).toISOString()
    };
  } catch (error) {
    console.error('Failed to save new prompt template version:', error);
    throw error;
  }
}
