import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: subscription } = await supabase
    .from('bb_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Get usage
  const { count: spaces } = await supabase
    .from('bb_spaces')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { data: userSpaces } = await supabase
    .from('bb_spaces')
    .select('id')
    .eq('user_id', user.id);

  let pages = 0;
  if (userSpaces?.length) {
    const { count } = await supabase
      .from('bb_pages')
      .select('*', { count: 'exact', head: true })
      .in('space_id', userSpaces.map((s) => s.id));
    pages = count ?? 0;
  }

  return NextResponse.json({
    subscription: subscription ?? { plan: 'free', status: 'active', payment_method: null },
    usage: { spaces: spaces ?? 0, pages },
  });
}
