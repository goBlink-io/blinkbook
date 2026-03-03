import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { PublishedLayout } from '@/components/published/published-layout';
import { renderTiptapDoc, extractHeadings, TiptapContent } from '@/components/published/tiptap-renderer';
import { PageviewTracker } from '@/components/published/pageview-tracker';
import type { BBPage, BBSpace, BBVersion, BBVersionPage, TiptapDoc } from '@/types/database';

export const revalidate = 300;

const getSpaceAndPages = cache(async function getSpaceAndPages(slug: string) {
  const supabase = await createClient();

  // Look up space by slug or custom_domain
  let { data: space } = await supabase
    .from('bb_spaces')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!space) {
    // Try matching by custom_domain
    const { data: domainSpace } = await supabase
      .from('bb_spaces')
      .select('*')
      .eq('custom_domain', slug)
      .eq('is_published', true)
      .single();
    space = domainSpace;
  }

  if (!space) return null;

  const typedSpace = space as BBSpace;

  // Try loading pre-rendered static bundle from storage first
  const { data: bundleData } = await supabase.storage
    .from('published-sites')
    .download(`${typedSpace.id}/static-bundle.json`);

  if (bundleData) {
    try {
      const bundle = JSON.parse(await bundleData.text());
      return {
        space: typedSpace,
        pages: bundle.pages as (BBPage & { renderedHtml: string; headings: { id: string; text: string; level: number }[] })[],
      };
    } catch {
      // Fall through to Postgres query
    }
  }

  // Fall back to Postgres query for pages
  const { data: pages } = await supabase
    .from('bb_pages')
    .select('*')
    .eq('space_id', typedSpace.id)
    .eq('is_published', true)
    .order('position', { ascending: true });

  return { space: typedSpace, pages: (pages ?? []) as BBPage[] };
});

const getVersions = cache(async function getVersions(spaceId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('bb_versions')
    .select('*')
    .eq('space_id', spaceId)
    .order('created_at', { ascending: false });
  return (data ?? []) as BBVersion[];
});

async function getVersionPages(versionId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('bb_version_pages')
    .select('*')
    .eq('version_id', versionId)
    .order('position', { ascending: true });
  return (data ?? []) as BBVersionPage[];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; path?: string[] }>;
}): Promise<Metadata> {
  const { slug, path } = await params;
  const result = await getSpaceAndPages(slug);
  if (!result || result.pages.length === 0) return {};

  const pageSlug = path?.[0] ?? result.pages[0].slug;
  const currentPage = result.pages.find((p) => p.slug === pageSlug);
  if (!currentPage) return {};

  const title = `${currentPage.title} — ${result.space.name}`;
  const description = result.space.description || `Documentation for ${result.space.name}`;
  const baseUrl = result.space.custom_domain
    ? `https://${result.space.custom_domain}`
    : `https://${result.space.slug}.blinkbook.goblink.io`;
  const url = `${baseUrl}/${currentPage.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: result.space.name,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function PublishedSitePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; path?: string[] }>;
  searchParams: Promise<{ version?: string }>;
}) {
  const { slug, path } = await params;
  const { version: versionId } = await searchParams;
  const result = await getSpaceAndPages(slug);

  if (!result) {
    notFound();
  }

  const { space } = result;

  // Fetch versions for the switcher
  const versions = await getVersions(space.id);

  // If a specific version is requested, load its snapshot pages
  let allPages: BBPage[];
  let activeVersionId: string | undefined;

  if (versionId) {
    const targetVersion = versions.find((v) => v.id === versionId);
    if (targetVersion) {
      const versionPages = await getVersionPages(versionId);
      // Map version pages to BBPage shape for the layout
      allPages = versionPages.map((vp) => ({
        id: vp.page_id ?? vp.id,
        space_id: space.id,
        title: vp.title,
        slug: vp.slug,
        content: vp.content,
        parent_id: vp.parent_id,
        position: vp.position,
        is_published: true,
        created_at: vp.created_at,
        updated_at: vp.created_at,
      }));
      activeVersionId = versionId;
    } else {
      allPages = result.pages;
    }
  } else {
    allPages = result.pages;
  }

  if (allPages.length === 0) {
    notFound();
  }

  // Resolve current page from path
  const pageSlug = path?.[0] ?? allPages[0].slug;
  const currentPage = allPages.find((p) => p.slug === pageSlug);

  if (!currentPage) {
    notFound();
  }

  // Use pre-rendered HTML from static bundle, or render on the fly
  const bundlePage = currentPage as BBPage & { renderedHtml?: string; headings?: { id: string; text: string; level: number }[] };
  const html = bundlePage.renderedHtml ?? renderTiptapDoc(currentPage.content as TiptapDoc);
  const headings = bundlePage.headings ?? extractHeadings(currentPage.content as TiptapDoc);

  return (
    <PublishedLayout
      space={space}
      pages={allPages}
      currentSlug={currentPage.slug}
      headings={headings}
      versions={versions}
      currentVersionId={activeVersionId}
    >
      <h1 className="text-3xl font-bold text-white mb-8 tracking-tight">{currentPage.title}</h1>
      <TiptapContent html={html} />
      <PageviewTracker spaceSlug={space.slug} pageId={currentPage.id} />
    </PublishedLayout>
  );
}
