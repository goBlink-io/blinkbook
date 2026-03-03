import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; contentId: string }> }
) {
  const { id, contentId } = await params;
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
  const { price_usd, accepted_tokens, is_active } = body as {
    price_usd?: number;
    accepted_tokens?: string[];
    is_active?: boolean;
  };

  const updates: Record<string, unknown> = {};
  if (price_usd !== undefined) updates.price_usd = price_usd;
  if (accepted_tokens !== undefined) updates.accepted_tokens = accepted_tokens;
  if (is_active !== undefined) updates.is_active = is_active;

  const { data, error } = await supabase
    .from('bb_paid_content')
    .update(updates)
    .eq('id', contentId)
    .eq('space_id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; contentId: string }> }
) {
  const { id, contentId } = await params;
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

  // Get the paid content to find associated page
  const { data: content } = await supabase
    .from('bb_paid_content')
    .select('page_id')
    .eq('id', contentId)
    .eq('space_id', id)
    .single();

  const { error } = await supabase
    .from('bb_paid_content')
    .delete()
    .eq('id', contentId)
    .eq('space_id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Unmark page as premium if no other paid content references it
  if (content?.page_id) {
    const { data: remaining } = await supabase
      .from('bb_paid_content')
      .select('id')
      .eq('page_id', content.page_id)
      .eq('is_active', true);

    if (!remaining || remaining.length === 0) {
      await supabase
        .from('bb_pages')
        .update({ is_premium: false })
        .eq('id', content.page_id);
    }
  }

  return NextResponse.json({ success: true });
}
