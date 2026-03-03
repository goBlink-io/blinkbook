import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];

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
    return NextResponse.json({ error: 'Invalid file type. Only PNG, JPG, GIF, WebP allowed.' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large. Maximum size is 2MB.' }, { status: 400 });
  }

  const ext = file.name.split('.').pop() ?? 'png';
  const path = `${user.id}/${id}.${ext}`;
  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from('og-images')
    .upload(path, bytes, { contentType: file.type, upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage
    .from('og-images')
    .getPublicUrl(path);

  const { data: updated, error: updateError } = await supabase
    .from('bb_spaces')
    .update({ og_image_url: publicUrl })
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
    .select('id, og_image_url')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!space) {
    return NextResponse.json({ error: 'Space not found' }, { status: 404 });
  }

  if (space.og_image_url) {
    for (const ext of ['png', 'jpg', 'jpeg', 'gif', 'webp']) {
      await supabase.storage.from('og-images').remove([`${user.id}/${id}.${ext}`]);
    }
  }

  const { data: updated, error } = await supabase
    .from('bb_spaces')
    .update({ og_image_url: null })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ space: updated });
}
