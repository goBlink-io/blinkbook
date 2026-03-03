import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createRuleSchema = z.object({
  page_id: z.string().uuid().nullable().optional().default(null),
  chain: z.string().min(1).max(50),
  contract_address: z.string().min(1).max(200),
  token_type: z.enum(['ERC-20', 'ERC-721', 'ERC-1155', 'SPL']),
  min_amount: z.number().positive().optional().default(1),
  token_id: z.string().max(200).nullable().optional().default(null),
  is_active: z.boolean().optional().default(true),
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

  const { data, error } = await supabase
    .from('bb_access_rules')
    .select('*')
    .eq('space_id', id)
    .order('created_at', { ascending: false });

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

  // Verify space exists and user owns it
  const { data: space } = await supabase
    .from('bb_spaces')
    .select('id')
    .eq('id', id)
    .single();

  if (!space) {
    return NextResponse.json({ error: 'Space not found' }, { status: 404 });
  }

  const body = await request.json();
  const parsed = createRuleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data', details: parsed.error.issues }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('bb_access_rules')
    .insert({
      space_id: id,
      ...parsed.data,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Auto-enable gating on the space
  await supabase
    .from('bb_spaces')
    .update({ is_gated: true })
    .eq('id', id);

  return NextResponse.json(data, { status: 201 });
}
