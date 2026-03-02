import { createClient } from '@/lib/supabase/server';

const LIMITS = {
  free: { spaces: 1, pages: 20, team: 0 },
  pro: { spaces: Infinity, pages: Infinity, team: 0 },
  team: { spaces: Infinity, pages: Infinity, team: 5 },
} as const;

export async function getUserPlan(userId: string): Promise<'free' | 'pro' | 'team'> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('bb_subscriptions')
    .select('plan, status')
    .eq('user_id', userId)
    .single();

  if (!data || data.status === 'canceled') return 'free';
  return data.plan as 'free' | 'pro' | 'team';
}

export async function enforceLimit(
  userId: string,
  limit: 'spaces' | 'pages' | 'team',
  spaceId?: string
): Promise<boolean> {
  const plan = await getUserPlan(userId);
  const max = LIMITS[plan][limit];
  if (max === Infinity) return true;

  const supabase = await createClient();

  if (limit === 'spaces') {
    const { count } = await supabase
      .from('bb_spaces')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    return (count ?? 0) < max;
  }

  if (limit === 'pages') {
    // Count pages across all user spaces
    const { data: spaces } = await supabase
      .from('bb_spaces')
      .select('id')
      .eq('user_id', userId);
    if (!spaces?.length) return true;
    const { count } = await supabase
      .from('bb_pages')
      .select('*', { count: 'exact', head: true })
      .in('space_id', spaces.map((s) => s.id));
    return (count ?? 0) < max;
  }

  if (limit === 'team' && spaceId) {
    const { count } = await supabase
      .from('bb_team_members')
      .select('*', { count: 'exact', head: true })
      .eq('space_id', spaceId)
      .eq('status', 'accepted');
    return (count ?? 0) < max;
  }

  return false;
}

export function getRequiredPlan(limit: 'spaces' | 'pages' | 'team'): 'pro' | 'team' {
  return limit === 'team' ? 'team' : 'pro';
}
