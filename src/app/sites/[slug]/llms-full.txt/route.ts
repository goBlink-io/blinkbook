import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { tiptapToMarkdown } from '@/lib/tiptap-to-markdown';
import type { BBSpace, BBPage, TiptapDoc } from '@/types/database';

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

  const sections: string[] = [];

  // Title
  sections.push(`# ${typedSpace.name}`);

  if (typedSpace.description) {
    sections.push(`> ${typedSpace.description}`);
  }

  // Render pages with hierarchy
  const topLevel = allPages.filter((p) => !p.parent_id);
  const children = allPages.filter((p) => p.parent_id);

  for (const page of topLevel) {
    sections.push(`## ${page.title}`);
    const markdown = tiptapToMarkdown(page.content as TiptapDoc);
    if (markdown) {
      sections.push(markdown);
    }

    const pageChildren = children.filter((c) => c.parent_id === page.id);
    for (const child of pageChildren) {
      sections.push(`### ${child.title}`);
      const childMarkdown = tiptapToMarkdown(child.content as TiptapDoc);
      if (childMarkdown) {
        sections.push(childMarkdown);
      }
    }
  }

  return new NextResponse(sections.join('\n\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}
