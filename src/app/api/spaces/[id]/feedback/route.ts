import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify ownership
  const { data: space } = await supabase
    .from('bb_spaces')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!space) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const url = new URL(request.url);
  const pageId = url.searchParams.get('page_id');

  let query = supabase
    .from('bb_feedback')
    .select('*')
    .eq('space_id', id)
    .order('created_at', { ascending: false });

  if (pageId) {
    query = query.eq('page_id', pageId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Compute per-page summaries
  const summaryMap = new Map<string, { helpful: number; not_helpful: number }>();
  for (const fb of data ?? []) {
    const entry = summaryMap.get(fb.page_id) ?? { helpful: 0, not_helpful: 0 };
    if (fb.helpful) entry.helpful++;
    else entry.not_helpful++;
    summaryMap.set(fb.page_id, entry);
  }

  const summaries = Array.from(summaryMap.entries()).map(([page_id, counts]) => {
    const total = counts.helpful + counts.not_helpful;
    return {
      page_id,
      helpful_count: counts.helpful,
      not_helpful_count: counts.not_helpful,
      total,
      helpful_pct: total > 0 ? Math.round((counts.helpful / total) * 100) : 0,
    };
  });

  return NextResponse.json({
    feedback: data ?? [],
    summaries,
  });
}
