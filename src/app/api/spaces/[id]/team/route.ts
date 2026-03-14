import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifySpaceAccess } from '@/lib/supabase/verify-space-access';
import { enforceLimit, getRequiredPlan } from '@/lib/billing/check-plan';
import { z } from 'zod';
import crypto from 'crypto';

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'editor', 'viewer']).default('editor'),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = await verifySpaceAccess(supabase, id, user.id);
  if (!role) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('bb_team_members')
    .select('*, user:bb_users(id, email, name, avatar_url)')
    .eq('space_id', id)
    .order('invited_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
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

  // Verify space ownership
  const { data: space } = await supabase
    .from('bb_spaces')
    .select('id, name')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!space) {
    return NextResponse.json({ error: 'Space not found' }, { status: 404 });
  }

  // Check team plan limit
  const canInvite = await enforceLimit(user.id, 'team', id);
  if (!canInvite) {
    return NextResponse.json(
      { error: 'upgrade_required', plan: getRequiredPlan('team') },
      { status: 402 }
    );
  }

  const body = await request.json();
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data', details: parsed.error.issues }, { status: 400 });
  }

  const { email, role } = parsed.data;

  // Check if already invited
  const { data: existing } = await supabase
    .from('bb_team_members')
    .select('id')
    .eq('space_id', id)
    .eq('email', email)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'Already invited' }, { status: 409 });
  }

  const inviteToken = crypto.randomBytes(32).toString('hex');

  const { data, error } = await supabase
    .from('bb_team_members')
    .insert({
      space_id: id,
      email,
      role,
      status: 'pending',
      invite_token: inviteToken,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send invite email (best-effort)
  try {
    const { data: inviter } = await supabase
      .from('bb_users')
      .select('name, email')
      .eq('id', user.id)
      .single();

    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: `You've been invited to collaborate on ${space.name}`,
        template: 'team-invite',
        data: {
          spaceName: space.name,
          inviterName: inviter?.name ?? inviter?.email ?? 'Someone',
          role,
          acceptUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invitations/${inviteToken}`,
        },
      }),
    });
  } catch {
    // Email sending is best-effort
  }

  return NextResponse.json(data, { status: 201 });
}
