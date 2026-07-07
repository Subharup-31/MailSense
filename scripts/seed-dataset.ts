/**
 * Seeding script to populate the Supabase database with 55 high-quality,
 * answer-oriented email-response pairs across 11 business categories.
 * Also synchronizes vectors to Pinecone if configured.
 */

import { supabase } from '../db/client';
import { SEED_EMAILS } from './seed-data';
import { upsertEmailVector } from '../lib/pinecone';

async function seed() {
  console.log('--- STARTING HIGH-QUALITY DATASET SEEDING ---');

  try {
    // 1. Wipe existing tables to prevent duplicate or legacy noise
    console.log('Cleaning old evaluations...');
    await supabase.from('evaluations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('Cleaning old responses...');
    await supabase.from('responses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('Cleaning old emails...');
    const { error: deleteError } = await supabase
      .from('emails')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
      throw new Error(`Failed to clean tables: ${deleteError.message}`);
    }
    console.log('Database tables cleared successfully.\n');

    // Update active prompt template in database
    console.log('Updating active prompt template in database...');
    const newContent = `You are a professional customer support representative and company agent. Draft a decisive, helpful reply to the incoming email based on the context and reference examples provided.

Incoming Email Subject: {{subject}}
Incoming Email Body:
{{body}}

Business Context / Rules:
- Keep the tone {{tone}}
- Act as the company's voice.
- Answer every explicit question and resolve every point of clarification in the incoming email. Do not skip or ignore any customer requests.
- DO NOT invent or ask unnecessary clarification questions (e.g. asking for meeting dates, reference numbers, or timelines that are already clear or irrelevant).
- DO NOT repeat the customer's questions verbatim.
- If certain information required to answer is not in the context, clearly acknowledge it and state that you will follow up, rather than fabricating any details, dates, or policies.
- Keep the response concise, professional, and actionable.

Top Reference Examples:
{{examples}}

Draft the best response below. Do not include signatures or extra greetings unless appropriate.
Response:`;

    await supabase
      .from('prompt_versions')
      .update({ content: newContent })
      .eq('is_active', true);
    console.log('Active prompt template in database updated.');

    // 2. Insert new high-quality QA pairs
    console.log(`Inserting ${SEED_EMAILS.length} high-quality QA pairs...`);
    let count = 0;
    for (const item of SEED_EMAILS) {
      const { data, error } = await supabase
        .from('emails')
        .insert({
          subject: item.subject,
          body: item.body,
          reply: item.reply,
          category: item.category,
          difficulty: item.difficulty,
          tone: item.tone,
          intent: item.intent,
          entities: item.entities,
          action_items: item.action_items,
          keywords: item.keywords,
          embedding_status: 'pending'
        })
        .select('id')
        .single();

      if (error) {
        console.error(`Failed to insert email "${item.subject}":`, error.message);
        continue;
      }

      const emailId = data.id;
      count++;
      console.log(`[${count}/${SEED_EMAILS.length}] Seeded: "${item.subject}" (ID: ${emailId})`);

      // 3. Attempt to sync vector to Pinecone
      try {
        const synced = await upsertEmailVector(emailId, item.body, {
          subject: item.subject,
          category: item.category,
          tone: item.tone,
          difficulty: item.difficulty
        });
        if (synced) {
          console.log(`   -> Synced to Pinecone.`);
        } else {
          console.log(`   -> Pinecone not configured. Saved in local fallback mode.`);
        }
      } catch (err: any) {
        console.warn(`   -> Pinecone sync failed: ${err.message}`);
      }
    }

    console.log(`\nSeeding completed successfully! Seeded ${count} emails.`);
  } catch (error: any) {
    console.error('Seeding process failed:', error.message || error);
    process.exit(1);
  }
}

seed();
