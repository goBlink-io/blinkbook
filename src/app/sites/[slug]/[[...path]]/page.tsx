import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PublishedLayout } from '@/components/published/published-layout';
import { renderTiptapDoc, extractHeadings, TiptapContent } from '@/components/published/tiptap-renderer';
import type { BBPage, BBSpace, TiptapDoc } from '@/types/database';

export const revalidate = 60;

export default async function PublishedSitePage({
  params,
}: {
  params: Promise<{ slug: string; path?: string[] }>;
}) {
  const { slug, path } = await params;
  const supabase = await createClient();

  // Look up space by slug
  const { data: space } = await supabase
    .from('bb_spaces')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!space) {
    notFound();
  }

  // Fetch all published pages
  const { data: pages } = await supabase
    .from('bb_pages')
    .select('*')
    .eq('space_id', (space as BBSpace).id)
    .eq('is_published', true)
    .order('position', { ascending: true });

  const allPages = (pages ?? []) as BBPage[];

  if (allPages.length === 0) {
    notFound();
  }

  // Resolve current page from path
  const pageSlug = path?.[0] ?? allPages[0].slug;
  const currentPage = allPages.find((p) => p.slug === pageSlug);

  if (!currentPage) {
    notFound();
  }

  // Render content
  const html = renderTiptapDoc(currentPage.content as TiptapDoc);
  const headings = extractHeadings(currentPage.content as TiptapDoc);

  return (
    <PublishedLayout
      space={space as BBSpace}
      pages={allPages}
      currentSlug={currentPage.slug}
      headings={headings}
    >
      <h1 className="text-3xl font-bold text-white mb-8 tracking-tight">{currentPage.title}</h1>
      <TiptapContent html={html} />
    </PublishedLayout>
  );
}
