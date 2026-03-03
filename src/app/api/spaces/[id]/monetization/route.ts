import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { BBPaidContent } from '@/types/database';

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

  const { data: space } = await supabase
    .from('bb_spaces')
    .select('id, monetization_enabled, payout_wallet')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!space) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { data: paidContent } = await supabase
    .from('bb_paid_content')
    .select('*')
    .eq('space_id', id)
    .order('created_at', { ascending: false });

  return NextResponse.json({
    monetization_enabled: space.monetization_enabled,
    payout_wallet: space.payout_wallet,
    paid_content: (paidContent ?? []) as BBPaidContent[],
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: space } = await supabase
    .from('bb_spaces')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!space) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await request.json();
  const { page_id, price_usd, accepted_tokens, monetization_enabled, payout_wallet } = body as {
    page_id?: string;
    price_usd?: number;
    accepted_tokens?: string[];
    monetization_enabled?: boolean;
    payout_wallet?: string;
  };

  // Update space-level settings if provided
  if (monetization_enabled !== undefined || payout_wallet !== undefined) {
    const updates: Record<string, unknown> = {};
    if (monetization_enabled !== undefined) updates.monetization_enabled = monetization_enabled;
    if (payout_wallet !== undefined) updates.payout_wallet = payout_wallet;

    const { error: updateError } = await supabase
      .from('bb_spaces')
      .update(updates)
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  // Create paid content entry if price provided
  if (price_usd !== undefined) {
    const { data: content, error: insertError } = await supabase
      .from('bb_paid_content')
      .insert({
        space_id: id,
        page_id: page_id ?? null,
        price_usd,
        accepted_tokens: accepted_tokens ?? [],
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Mark the page as premium if a page_id was provided
    if (page_id) {
      await supabase
        .from('bb_pages')
        .update({ is_premium: true })
        .eq('id', page_id);
    }

    return NextResponse.json(content);
  }

  return NextResponse.json({ success: true });
}
