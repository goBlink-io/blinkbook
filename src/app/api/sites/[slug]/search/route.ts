import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  // Look up space by slug
  const { data: space } = await supabase
    .from('bb_spaces')
    .select('id')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!space) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Fetch search index from Supabase Storage
  const { data, error } = await supabase.storage
    .from('published-sites')
    .download(`${space.id}/search-index.json`);

  if (error || !data) {
    return NextResponse.json([], {
      headers: { 'Cache-Control': 'public, max-age=60' },
    });
  }

  const text = await data.text();

  // Generate ETag from content hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const etag = `"${hashHex}"`;

  // Return 304 if content unchanged
  const ifNoneMatch = request.headers.get('If-None-Match');
  if (ifNoneMatch === etag) {
    return new Response(null, {
      status: 304,
      headers: { ETag: etag, 'Cache-Control': 'public, max-age=60' },
    });
  }

  return new Response(text, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60',
      ETag: etag,
    },
  });
}
