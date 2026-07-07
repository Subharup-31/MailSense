import { NextResponse } from 'next/server';
import { supabase } from '../../../db/client';

export async function GET() {
  const status: Record<string, any> = {
    database: 'disconnected',
    pinecone: 'not_configured',
    openrouter: 'not_configured',
  };
  
  let statusCode = 200;

  // 1. Check Database
  try {
    const { error } = await supabase
      .from('prompt_versions')
      .select('id')
      .limit(1);
      
    if (!error) {
      status.database = 'connected';
    } else {
      throw error;
    }
  } catch (error: any) {
    status.database = `error: ${error.message || error}`;
    statusCode = 500;
  }

  // 2. Check Pinecone configuration
  if (process.env.PINECONE_API_KEY) {
    status.pinecone = 'configured';
  }

  // 3. Check OpenRouter configuration
  if (process.env.OPENROUTER_API_KEY) {
    status.openrouter = 'configured';
  }

  return NextResponse.json({
    status: statusCode === 200 ? 'ok' : 'degraded',
    services: status,
    timestamp: new Date().toISOString()
  }, { status: statusCode });
}
