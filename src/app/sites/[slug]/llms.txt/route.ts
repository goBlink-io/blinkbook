import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { BBSpace, BBPage } from '@/types/database';

export const revalidate = 300;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: space } = await supabase
    .from('bb_spaces')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!space) {
    return new NextResponse('Not found', { status: 404 });
  }

  const typedSpace = space as BBSpace;

  if (!typedSpace.llms_txt_enabled) {
    return new NextResponse('Not found', { status: 404 });
  }

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

  const lines: string[] = [];

  // Title
  lines.push(`# ${typedSpace.name}`);
  lines.push('');

  // Description
  if (typedSpace.description) {
    lines.push(`> ${typedSpace.description}`);
    lines.push('');
  }

  // Full content link
  lines.push(`## Full Documentation`);
  lines.push('');
  lines.push(`- [${typedSpace.name} (complete)](${baseUrl}/llms-full.txt)`);
  lines.push('');

  // Pages list
  if (allPages.length > 0) {
    lines.push('## Pages');
    lines.push('');

    const topLevel = allPages.filter((p) => !p.parent_id);
    const children = allPages.filter((p) => p.parent_id);

    for (const page of topLevel) {
      lines.push(`- [${page.title}](${baseUrl}/${page.slug})`);

      const pageChildren = children.filter((c) => c.parent_id === page.id);
      for (const child of pageChildren) {
        lines.push(`  - [${child.title}](${baseUrl}/${child.slug})`);
      }
    }
  }

  lines.push('');

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}
