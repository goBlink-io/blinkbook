import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: invite, error } = await supabase
    .from('bb_team_members')
    .select('*, space:bb_spaces(id, name, slug)')
    .eq('invite_token', token)
    .eq('status', 'pending')
    .single();

  if (error || !invite) {
    return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 });
  }

  return NextResponse.json({
    spaceName: invite.space?.name,
    role: invite.role,
    email: invite.email,
  });
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: invite } = await supabase
    .from('bb_team_members')
    .select('*, space:bb_spaces(id)')
    .eq('invite_token', token)
    .eq('status', 'pending')
    .single();

  if (!invite) {
    return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 });
  }

  const { error } = await supabase
    .from('bb_team_members')
    .update({
      user_id: user.id,
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    })
    .eq('id', invite.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    spaceId: invite.space?.id,
  });
}
