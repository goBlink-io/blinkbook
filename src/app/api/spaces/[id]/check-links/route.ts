import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { TiptapNode } from '@/types/database';

function extractLinks(nodes: TiptapNode[]): { url: string; text: string }[] {
  const links: { url: string; text: string }[] = [];

  for (const node of nodes) {
    // Check marks on text nodes for link marks
    if (node.marks) {
      for (const mark of node.marks) {
        if (mark.type === 'link' && mark.attrs?.href) {
          links.push({
            url: String(mark.attrs.href),
            text: node.text ?? '',
          });
        }
      }
    }

    // Recurse into child nodes
    if (node.content) {
      links.push(...extractLinks(node.content));
    }
  }

  return links;
}

function isExternalUrl(url: string): boolean {
  if (url.startsWith('#') || url.startsWith('/') || url.startsWith('mailto:')) {
    return false;
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

async function checkUrl(url: string): Promise<{ status_code: number | null; error: string | null; is_broken: boolean }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'BlinkBook-LinkChecker/1.0',
      },
    });

    clearTimeout(timeout);

    // Some servers reject HEAD; retry with GET if 405
    if (res.status === 405) {
      const controller2 = new AbortController();
      const timeout2 = setTimeout(() => controller2.abort(), 5000);

      const getRes = await fetch(url, {
        method: 'GET',
        signal: controller2.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'BlinkBook-LinkChecker/1.0',
        },
      });

      clearTimeout(timeout2);

      return {
        status_code: getRes.status,
        error: null,
        is_broken: getRes.status >= 400,
      };
    }

    return {
      status_code: res.status,
      error: null,
      is_broken: res.status >= 400,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return {
      status_code: null,
      error: message.includes('abort') ? 'Timeout (5s)' : message,
      is_broken: true,
    };
  }
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

  // Verify space ownership
  const { data: space } = await supabase
    .from('bb_spaces')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!space) {
    return NextResponse.json({ error: 'Space not found' }, { status: 404 });
  }

  // Fetch all published pages
  const { data: pages } = await supabase
    .from('bb_pages')
    .select('id, title, content')
    .eq('space_id', id)
    .eq('is_published', true);

  if (!pages || pages.length === 0) {
    return NextResponse.json({ message: 'No published pages to scan', results: [] });
  }

  // Extract all links from all pages
  const allLinks: { page_id: string; url: string; link_text: string }[] = [];

  for (const page of pages) {
    if (!page.content?.content) continue;
    const links = extractLinks(page.content.content);

    for (const link of links) {
      if (isExternalUrl(link.url)) {
        allLinks.push({
          page_id: page.id,
          url: link.url,
          link_text: link.text,
        });
      }
    }
  }

  // Deduplicate URLs for checking (but keep all page associations)
  const uniqueUrls = [...new Set(allLinks.map((l) => l.url))];

  // Check all unique URLs
  const urlResults = new Map<string, { status_code: number | null; error: string | null; is_broken: boolean }>();

  // Check in batches of 5 to avoid overwhelming servers
  for (let i = 0; i < uniqueUrls.length; i += 5) {
    const batch = uniqueUrls.slice(i, i + 5);
    const results = await Promise.all(batch.map((url) => checkUrl(url)));
    batch.forEach((url, idx) => urlResults.set(url, results[idx]));
  }

  // Clear previous results for this space
  await supabase
    .from('bb_broken_links')
    .delete()
    .eq('space_id', id);

  // Insert new results (all links, not just broken ones - for complete reporting)
  const rows = allLinks.map((link) => {
    const result = urlResults.get(link.url)!;
    return {
      space_id: id,
      page_id: link.page_id,
      url: link.url,
      link_text: link.link_text || null,
      status_code: result.status_code,
      error: result.error,
      is_broken: result.is_broken,
      last_checked_at: new Date().toISOString(),
    };
  });

  if (rows.length > 0) {
    await supabase.from('bb_broken_links').insert(rows);
  }

  // Update last_link_check_at on the space
  await supabase
    .from('bb_spaces')
    .update({ last_link_check_at: new Date().toISOString() })
    .eq('id', id);

  const brokenCount = rows.filter((r) => r.is_broken).length;

  return NextResponse.json({
    total_links: rows.length,
    broken_count: brokenCount,
    healthy_count: rows.length - brokenCount,
    results: rows,
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify space ownership
  const { data: space } = await supabase
    .from('bb_spaces')
    .select('id, last_link_check_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!space) {
    return NextResponse.json({ error: 'Space not found' }, { status: 404 });
  }

  // Fetch broken links for this space
  const { data: links } = await supabase
    .from('bb_broken_links')
    .select('*')
    .eq('space_id', id)
    .order('is_broken', { ascending: false })
    .order('last_checked_at', { ascending: false });

  return NextResponse.json({
    links: links ?? [],
    last_checked_at: space?.last_link_check_at ?? null,
  });
}
