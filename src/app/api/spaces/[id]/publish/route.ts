import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { renderTiptapDoc, extractHeadings } from '@/components/published/tiptap-renderer';
import type { BBPage, TiptapNode, TiptapDoc } from '@/types/database';

function extractText(node: TiptapNode): string {
  if (node.text) return node.text;
  return node.content?.map(extractText).join('') ?? '';
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify ownership
  const { data: space, error: spaceError } = await supabase
    .from('bb_spaces')
    .select('*')
    .eq('id', id)
    .single();

  if (spaceError || !space) {
    return NextResponse.json({ error: 'Space not found' }, { status: 404 });
  }

  // Set is_published = true
  const { error: updateError } = await supabase
    .from('bb_spaces')
    .update({ is_published: true })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Fetch all published pages
  const { data: pages } = await supabase
    .from('bb_pages')
    .select('*')
    .eq('space_id', id)
    .eq('is_published', true)
    .order('position', { ascending: true });

  const allPages = (pages ?? []) as BBPage[];

  // Build search index
  const searchIndex = allPages.map((page) => {
    const content = page.content?.content
      ?.map((node: TiptapNode) => extractText(node))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim() ?? '';

    return {
      id: page.id,
      title: page.title,
      slug: page.slug,
      content,
      section: page.parent_id ? 'child' : 'root',
    };
  });

  // Store search index in Supabase Storage
  const indexJson = JSON.stringify(searchIndex);
  const indexBlob = new Blob([indexJson], { type: 'application/json' });

  // Ensure bucket exists (ignore error if already exists)
  await supabase.storage.createBucket('published-sites', { public: true });

  // Upload (upsert) search index
  await supabase.storage
    .from('published-sites')
    .upload(`${id}/search-index.json`, indexBlob, {
      contentType: 'application/json',
      upsert: true,
    });

  // Pre-render static HTML bundle
  const staticPages = allPages.map((page) => {
    const renderedHtml = renderTiptapDoc(page.content as TiptapDoc);
    const headings = extractHeadings(page.content as TiptapDoc);
    return { ...page, renderedHtml, headings };
  });

  const bundleJson = JSON.stringify({ space, pages: staticPages });
  const bundleBlob = new Blob([bundleJson], { type: 'application/json' });

  await supabase.storage
    .from('published-sites')
    .upload(`${id}/static-bundle.json`, bundleBlob, {
      contentType: 'application/json',
      upsert: true,
    });

  return NextResponse.json({
    url: `${space.slug}.blinkbook.goblink.io`,
    published: true,
  });
}
