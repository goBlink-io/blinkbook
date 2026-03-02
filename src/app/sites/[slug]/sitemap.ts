import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';
import type { BBPage, BBSpace } from '@/types/database';

export default async function sitemap({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<MetadataRoute.Sitemap> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: space } = await supabase
    .from('bb_spaces')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!space) return [];

  const typedSpace = space as BBSpace;

  const { data: pages } = await supabase
    .from('bb_pages')
    .select('*')
    .eq('space_id', typedSpace.id)
    .eq('is_published', true)
    .order('position', { ascending: true });

  const allPages = (pages ?? []) as BBPage[];

  const baseUrl = typedSpace.custom_domain
    ? `https://${typedSpace.custom_domain}`
    : `https://${typedSpace.slug}.blinkbook.goblink.io`;

  return allPages.map((page) => ({
    url: `${baseUrl}/${page.slug}`,
    lastModified: new Date(page.updated_at),
    changeFrequency: 'weekly' as const,
    priority: page.parent_id ? 0.7 : 0.9,
  }));
}
