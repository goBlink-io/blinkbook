import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const { space_id, page_id, is_helpful, comment } = body;

  if (!space_id || !page_id || typeof is_helpful !== 'boolean') {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { error } = await supabase.from('bb_feedback').insert({
    space_id,
    page_id,
    helpful: is_helpful,
    comment: comment || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
