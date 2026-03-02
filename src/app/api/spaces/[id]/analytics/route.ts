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

  const url = new URL(request.url);
  const period = url.searchParams.get('period') || '7d';
  const days = period === '90d' ? 90 : period === '30d' ? 30 : 7;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  // Fetch all analytics for this space in the period
  const { data: events } = await supabase
    .from('bb_analytics')
    .select('*')
    .eq('space_id', id)
    .gte('created_at', since)
    .order('created_at', { ascending: true });

  const allEvents = events ?? [];

  // Pageviews per day
  const pvByDay = new Map<string, number>();
  const pageViews = new Map<string, number>();
  const searches = new Map<string, number>();

  for (const ev of allEvents) {
    const date = ev.created_at.split('T')[0];

    if (ev.event === 'pageview') {
      pvByDay.set(date, (pvByDay.get(date) ?? 0) + 1);
      if (ev.page_id) {
        pageViews.set(ev.page_id, (pageViews.get(ev.page_id) ?? 0) + 1);
      }
    }

    if (ev.event === 'search' && ev.metadata?.query) {
      const q = String(ev.metadata.query);
      searches.set(q, (searches.get(q) ?? 0) + 1);
    }
  }

  // Build pageviews array
  const pageviewsArr = Array.from(pvByDay.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Top pages — need to resolve titles
  const topPageIds = Array.from(pageViews.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  let topPages: { title: string; views: number }[] = [];
  if (topPageIds.length > 0) {
    const { data: pageTitles } = await supabase
      .from('bb_pages')
      .select('id, title')
      .in('id', topPageIds.map(([pid]) => pid));

    const titleMap = new Map((pageTitles ?? []).map((p: { id: string; title: string }) => [p.id, p.title]));
    topPages = topPageIds.map(([pid, views]) => ({
      title: titleMap.get(pid) ?? 'Unknown',
      views,
    }));
  }

  // Top searches
  const topSearches = Array.from(searches.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([query, count]) => ({ query, count }));

  // Feedback by page
  const { data: feedbackData } = await supabase
    .from('bb_feedback')
    .select('page_id, helpful')
    .eq('space_id', id);

  const fbMap = new Map<string, { helpful: number; notHelpful: number }>();
  for (const fb of feedbackData ?? []) {
    const entry = fbMap.get(fb.page_id) ?? { helpful: 0, notHelpful: 0 };
    if (fb.helpful) entry.helpful++;
    else entry.notHelpful++;
    fbMap.set(fb.page_id, entry);
  }

  let feedback: { page: string; helpful: number; notHelpful: number }[] = [];
  if (fbMap.size > 0) {
    const { data: fbPages } = await supabase
      .from('bb_pages')
      .select('id, title')
      .in('id', Array.from(fbMap.keys()));

    const fbTitleMap = new Map((fbPages ?? []).map((p: { id: string; title: string }) => [p.id, p.title]));
    feedback = Array.from(fbMap.entries()).map(([pid, data]) => ({
      page: fbTitleMap.get(pid) ?? 'Unknown',
      helpful: data.helpful,
      notHelpful: data.notHelpful,
    }));
  }

  return NextResponse.json({
    pageviews: pageviewsArr,
    topPages,
    searches: topSearches,
    feedback,
  });
}
