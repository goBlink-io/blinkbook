import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'];

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

  // Verify ownership
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
    return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large. Maximum size is 2MB.' }, { status: 400 });
  }

  const ext = file.name.split('.').pop() ?? 'png';
  const path = `${user.id}/${id}.${ext}`;
  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from('brand-logos')
    .upload(path, bytes, { contentType: file.type, upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage
    .from('brand-logos')
    .getPublicUrl(path);

  // Save URL to the space
  const { data: updated, error: updateError } = await supabase
    .from('bb_spaces')
    .update({ brand_logo_url: publicUrl })
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

  // Verify ownership and get current logo
  const { data: space } = await supabase
    .from('bb_spaces')
    .select('id, brand_logo_url')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!space) {
    return NextResponse.json({ error: 'Space not found' }, { status: 404 });
  }

  // Try to delete from storage (best effort — file may have different extension)
  if (space.brand_logo_url) {
    for (const ext of ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']) {
      await supabase.storage.from('brand-logos').remove([`${user.id}/${id}.${ext}`]);
    }
  }

  const { data: updated, error } = await supabase
    .from('bb_spaces')
    .update({ brand_logo_url: null })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ space: updated });
}
