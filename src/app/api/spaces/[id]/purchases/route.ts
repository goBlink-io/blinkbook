import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { BBPurchase } from '@/types/database';

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
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!space) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('bb_purchases')
    .select('*, bb_paid_content!inner(space_id)')
    .eq('bb_paid_content.space_id', id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Strip the join data and return clean purchases
  const purchases: BBPurchase[] = (data ?? []).map(({ bb_paid_content: _, ...purchase }) => purchase);

  return NextResponse.json({ purchases });
}
