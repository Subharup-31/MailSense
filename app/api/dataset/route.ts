import { NextResponse } from 'next/server';
import { supabase } from '../../../db/client';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10')));
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  const offset = (page - 1) * limit;

  try {
    let dbQuery = supabase
      .from('emails')
      .select('id, subject, body, reply, category, difficulty, tone, intent, entities, action_items, keywords, embedding_status, created_at', { count: 'exact' });

    if (category) {
      dbQuery = dbQuery.eq('category', category);
    }

    if (search) {
      const cleanSearch = search
        .replace(/[\(\),\r\n]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (cleanSearch) {
        dbQuery = dbQuery.or(`subject.ilike.%${cleanSearch}%,body.ilike.%${cleanSearch}%,category.ilike.%${cleanSearch}%`);
      }
    }

    const { data, error, count } = await dbQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      emails: data || [],
      total: count || 0,
      page,
      limit
    });
  } catch (error: any) {
    console.error('Failed to fetch dataset:', error);
    return NextResponse.json({ error: 'Failed to fetch dataset', details: error.message }, { status: 500 });
  }
}
