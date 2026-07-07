/**
 * Verification script to test Pinecone indexing and similarity search.
 */

import { upsertEmailVector, retrieveSimilarEmails } from '../lib/pinecone';
import { supabase } from '../db/client';

async function main() {
  console.log('--- Testing Pinecone & Embeddings Layer ---');
  
  try {
    // 1. Fetch some seeded emails
    console.log('Fetching emails from SQL database...');
    const { data: rows, error } = await supabase
      .from('emails')
      .select('id, subject, body, category, tone, difficulty')
      .limit(3);
    
    if (error) throw error;
    
    if (!rows || rows.length === 0) {
      console.warn('No emails found in database. Please run npm run db:seed first.');
      return;
    }

    console.log(`Found ${rows.length} emails. Starting vector uploads...`);

    // 2. Try upserting to Pinecone
    for (const email of rows) {
      console.log(`Upserting vector for: "${email.subject}"...`);
      const success = await upsertEmailVector(email.id, email.body, {
        subject: email.subject,
        category: email.category,
        tone: email.tone,
        difficulty: email.difficulty
      });
      console.log(`Upsert result: ${success ? 'SUCCESS (or fallback mode)' : 'FAILED'}`);
    }

    // 3. Test retrieval
    const searchQuery = 'refund subscription premium order';
    console.log(`\nTesting similarity search for query: "${searchQuery}"...`);
    const matches = await retrieveSimilarEmails(searchQuery, undefined, 2);
    
    console.log('\nSearch Results:');
    matches.forEach((match, index) => {
      console.log(`${index + 1}. [Score: ${match.score.toFixed(4)}] ${match.subject} (${match.category})`);
      console.log(`   Preview: ${match.body.substring(0, 80)}...`);
    });

    console.log('\n--- Pinecone Test Complete ---');
  } catch (error) {
    console.error('Error during Pinecone testing:', error);
  }
}

main();
