import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import type { BBPageFeedbackSummary } from '@/types/database';

const feedbackSchema = z.object({
  space_id: z.string().uuid(),
  page_id: z.string().uuid(),
  helpful: z.boolean(),
  comment: z.string().max(2000).nullable().optional(),
  user_fingerprint: z.string().max(100).nullable().optional(),
});

// GET /api/feedback?space_id=xxx — returns per-page feedback summary for the space owner
export async function GET(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const spaceId = searchParams.get('space_id');

  if (!spaceId) {
    return NextResponse.json({ error: 'space_id is required' }, { status: 400 });
  }

  // Verify ownership
  const { data: space } = await supabase
    .from('bb_spaces')
    .select('id')
    .eq('id', spaceId)
    .eq('user_id', user.id)
    .single();

  if (!space) {
    return NextResponse.json({ error: 'Space not found' }, { status: 404 });
  }

  // Aggregate feedback per page
  const { data: feedback, error } = await supabase
    .from('bb_feedback')
    .select('page_id, helpful')
    .eq('space_id', spaceId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Build summary map
  const summaryMap = new Map<string, { helpful: number; not_helpful: number }>();
  for (const row of feedback ?? []) {
    const entry = summaryMap.get(row.page_id) ?? { helpful: 0, not_helpful: 0 };
    if (row.helpful) {
      entry.helpful++;
    } else {
      entry.not_helpful++;
    }
    summaryMap.set(row.page_id, entry);
  }

  const summaries: BBPageFeedbackSummary[] = Array.from(summaryMap.entries()).map(
    ([page_id, counts]) => {
      const total = counts.helpful + counts.not_helpful;
      return {
        page_id,
        helpful_count: counts.helpful,
        not_helpful_count: counts.not_helpful,
        total,
        helpful_pct: total > 0 ? Math.round((counts.helpful / total) * 100) : 0,
      };
    }
  );

  return NextResponse.json(summaries);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const body = await request.json();
  const parsed = feedbackSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid data', details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { space_id, page_id, helpful, comment, user_fingerprint } = parsed.data;

  // Verify the space exists and is published (public widget)
  const { data: space } = await supabase
    .from('bb_spaces')
    .select('id')
    .eq('id', space_id)
    .eq('is_published', true)
    .single();

  if (!space) {
    return NextResponse.json({ error: 'Space not found' }, { status: 404 });
  }

  // Dedup: if fingerprint provided, check for existing vote on this page
  if (user_fingerprint) {
    const { data: existing } = await supabase
      .from('bb_feedback')
      .select('id')
      .eq('page_id', page_id)
      .eq('user_fingerprint', user_fingerprint)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Already submitted feedback for this page' },
        { status: 409 }
      );
    }
  }

  const { error } = await supabase.from('bb_feedback').insert({
    space_id,
    page_id,
    helpful,
    comment: comment ?? null,
    user_fingerprint: user_fingerprint ?? null,
  });

  if (error) {
    // Handle unique constraint violation (race condition)
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Already submitted feedback for this page' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
