import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface TrackEvent {
  event: string;
  pageId?: string;
  visitorId?: string;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  const body = await request.json();

  // Support both single event and batch format
  const events: TrackEvent[] = Array.isArray(body.events) ? body.events : [body];

  const validEvents = ['pageview', 'search', 'feedback'];
  for (const evt of events) {
    if (!validEvents.includes(evt.event)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
    }
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

  // Batch dedup: one SELECT for all pageview events
  const dedupedSet = new Set<string>();
  const pageviewEvents = events.filter(
    (e) => e.event === 'pageview' && e.visitorId && e.pageId
  );

  if (pageviewEvents.length > 0) {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const pageIds = [...new Set(pageviewEvents.map((e) => e.pageId!))];
    const visitorIds = [...new Set(pageviewEvents.map((e) => e.visitorId!))];

    const { data: existing } = await supabase
      .from('bb_analytics')
      .select('page_id, visitor_id')
      .eq('space_id', space.id)
      .eq('event', 'pageview')
      .in('page_id', pageIds)
      .in('visitor_id', visitorIds)
      .gte('created_at', fiveMinAgo);

    if (existing) {
      for (const row of existing) {
        dedupedSet.add(`${row.page_id}:${row.visitor_id}`);
      }
    }
  }

  // Build insert rows, filtering out duplicates
  const rows = events
    .filter((evt) => {
      if (evt.event === 'pageview' && evt.visitorId && evt.pageId) {
        return !dedupedSet.has(`${evt.pageId}:${evt.visitorId}`);
      }
      return true;
    })
    .map((evt) => ({
      space_id: space.id,
      page_id: evt.pageId || null,
      event: evt.event,
      metadata: evt.metadata || {},
      visitor_id: evt.visitorId || null,
    }));

  if (rows.length > 0) {
    const { error } = await supabase.from('bb_analytics').insert(rows);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, inserted: rows.length });
}
