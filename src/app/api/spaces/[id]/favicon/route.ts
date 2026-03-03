import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MAX_SIZE = 512 * 1024; // 512 KB
const ALLOWED_TYPES = ['image/png', 'image/x-icon', 'image/svg+xml', 'image/vnd.microsoft.icon'];

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
    return NextResponse.json({ error: 'Space not found' }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type. Only PNG, ICO, SVG allowed.' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large. Maximum size is 512KB.' }, { status: 400 });
  }

  const ext = file.name.split('.').pop() ?? 'png';
  const path = `${user.id}/${id}.${ext}`;
  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from('favicons')
    .upload(path, bytes, { contentType: file.type, upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage
    .from('favicons')
    .getPublicUrl(path);

  const { data: updated, error: updateError } = await supabase
    .from('bb_spaces')
    .update({ favicon_url: publicUrl })
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ url: publicUrl, space: updated });
}

export async function DELETE(
  _request: Request,
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
    .select('id, favicon_url')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!space) {
    return NextResponse.json({ error: 'Space not found' }, { status: 404 });
  }

  if (space.favicon_url) {
    for (const ext of ['png', 'ico', 'svg']) {
      await supabase.storage.from('favicons').remove([`${user.id}/${id}.${ext}`]);
    }
  }

  const { data: updated, error } = await supabase
    .from('bb_spaces')
    .update({ favicon_url: null })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ space: updated });
}
