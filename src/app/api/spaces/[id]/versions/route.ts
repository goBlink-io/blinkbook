import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createVersionSchema = z.object({
  label: z.string().min(1).max(50),
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
    .from('bb_versions')
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
  const parsed = createVersionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data', details: parsed.error.issues }, { status: 400 });
  }

  const { label } = parsed.data;

  // Unset any existing current version
  await supabase
    .from('bb_versions')
    .update({ is_current: false })
    .eq('space_id', id)
    .eq('is_current', true);

  // Create the new version as current
  const { data: version, error } = await supabase
    .from('bb_versions')
    .insert({
      space_id: id,
      label,
      is_current: true,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A version with this label already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Snapshot current published pages into the version
  const { error: snapError } = await supabase.rpc('snapshot_version_pages', {
    p_version_id: version.id,
    p_space_id: id,
  });

  if (snapError) {
    return NextResponse.json({ error: snapError.message }, { status: 500 });
  }

  return NextResponse.json(version, { status: 201 });
}
