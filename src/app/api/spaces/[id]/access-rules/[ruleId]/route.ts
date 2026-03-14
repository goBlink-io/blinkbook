import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifySpaceAccess } from '@/lib/supabase/verify-space-access';
import { z } from 'zod';

const updateRuleSchema = z.object({
  chain: z.string().min(1).max(50).optional(),
  contract_address: z.string().min(1).max(200).optional(),
  token_type: z.enum(['ERC-20', 'ERC-721', 'ERC-1155', 'SPL']).optional(),
  min_amount: z.number().positive().optional(),
  token_id: z.string().max(200).nullable().optional(),
  is_active: z.boolean().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; ruleId: string }> }
) {
  const { id, ruleId } = await params;
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
    .from('bb_access_rules')
    .select('*')
    .eq('id', ruleId)
    .eq('space_id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; ruleId: string }> }
) {
  const { id, ruleId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const patchRole = await verifySpaceAccess(supabase, id, user.id);
  if (!patchRole || patchRole === 'viewer') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateRuleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data', details: parsed.error.issues }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('bb_access_rules')
    .update(parsed.data)
    .eq('id', ruleId)
    .eq('space_id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; ruleId: string }> }
) {
  const { id, ruleId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const deleteRole = await verifySpaceAccess(supabase, id, user.id);
  if (!deleteRole || deleteRole === 'viewer') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { error } = await supabase
    .from('bb_access_rules')
    .delete()
    .eq('id', ruleId)
    .eq('space_id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
