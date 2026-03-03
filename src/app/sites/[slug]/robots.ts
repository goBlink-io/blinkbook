import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';
import type { BBSpace } from '@/types/database';

export default async function robots({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<MetadataRoute.Robots> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: space } = await supabase
    .from('bb_spaces')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  const typedSpace = space as BBSpace | null;

  const baseUrl = typedSpace?.custom_domain
    ? `https://${typedSpace.custom_domain}`
    : `https://${slug}.blinkbook.goblink.io`;

  const result: MetadataRoute.Robots = {
    rules: {
      userAgent: '*',
      allow: '/',
    },
  };

  if (typedSpace?.llms_txt_enabled) {
    result.host = baseUrl;
    result.sitemap = `${baseUrl}/sitemap.xml`;
    // Additional metadata to help AI agents discover llms.txt
    result.rules = [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: '*',
        allow: '/llms.txt',
      },
    ];
  }

  return result;
}
