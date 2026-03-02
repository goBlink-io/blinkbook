import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  const body = await request.json();
  const { event, pageId, metadata, visitorId } = body as {
    event: string;
    pageId?: string;
    metadata?: Record<string, unknown>;
    visitorId?: string;
  };

  if (!['pageview', 'search', 'feedback'].includes(event)) {
    return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
  }

  // Look up space
  const { data: space } = await supabase
    .from('bb_spaces')
    .select('id')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!space) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Basic dedup: skip if same visitor viewed same page in last 5 min
  if (event === 'pageview' && visitorId && pageId) {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('bb_analytics')
      .select('*', { count: 'exact', head: true })
      .eq('space_id', space.id)
      .eq('page_id', pageId)
      .eq('visitor_id', visitorId)
      .eq('event', 'pageview')
      .gte('created_at', fiveMinAgo);

    if (count && count > 0) {
      return NextResponse.json({ ok: true, deduped: true });
    }
  }

  const { error } = await supabase.from('bb_analytics').insert({
    space_id: space.id,
    page_id: pageId || null,
    event,
    metadata: metadata || {},
    visitor_id: visitorId || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
