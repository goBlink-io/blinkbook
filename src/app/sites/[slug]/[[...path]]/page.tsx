import { cache } from 'react';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { PublishedLayout } from '@/components/published/published-layout';
import { renderTiptapDoc, extractHeadings, TiptapContent } from '@/components/published/tiptap-renderer';
import { PageviewTracker } from '@/components/published/pageview-tracker';
import { FeedbackWidget } from '@/components/published/feedback-widget';
import { TokenGate } from '@/components/published/token-gate';
import { Paywall } from '@/components/published/paywall';
import type { BBAccessRule, BBPage, BBSpace, BBPaidContent, BBVersion, BBVersionPage, TiptapDoc } from '@/types/database';

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

  const { space } = result;
  const pageSlug = path?.[0] ?? result.pages[0].slug;
  const currentPage = result.pages.find((p) => p.slug === pageSlug);
  if (!currentPage) return {};

  const title = currentPage.meta_title ?? `${currentPage.title} — ${space.name}`;
  const description = currentPage.meta_description
    ?? space.meta_description
    ?? space.description
    ?? `Documentation for ${space.name}`;
  const baseUrl = space.custom_domain
    ? `https://${space.custom_domain}`
    : `https://${space.slug}.blinkbook.goblink.io`;
  const url = `${baseUrl}/${currentPage.slug}`;

  // OG image: page override → space override → auto-generated
  const ogImageUrl = currentPage.og_image_url
    ?? space.og_image_url
    ?? `${baseUrl}/api/og?${new URLSearchParams({
        title: currentPage.title,
        spaceName: space.name,
        ...(description ? { description } : {}),
        theme: space.brand_primary_color ?? '#3B82F6',
      }).toString()}`;

  const metadata: Metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: space.name,
      type: 'article',
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
      ...(space.social_twitter ? { site: space.social_twitter } : {}),
    },
    alternates: {
      canonical: url,
    },
  };

  if (currentPage.noindex) {
    metadata.robots = { index: false, follow: true };
  }

  return metadata;
}

function buildJsonLd(space: BBSpace, page: BBPage, url: string, ogImageUrl: string, description: string) {
  const baseUrl = space.custom_domain
    ? `https://${space.custom_domain}`
    : `https://${space.slug}.blinkbook.goblink.io`;

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: page.meta_title ?? page.title,
      description,
      dateModified: page.updated_at,
      image: ogImageUrl,
      author: {
        '@type': 'Organization',
        name: space.name,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: space.name, item: baseUrl },
        { '@type': 'ListItem', position: 2, name: page.title, item: url },
      ],
    },
  ];
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
        is_gated: false,
        is_premium: false,
        created_at: vp.created_at,
        updated_at: vp.created_at,
        last_reviewed_at: null,
        review_exempt: false,
        meta_title: null,
        meta_description: null,
        og_image_url: null,
        noindex: false,
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

  // Check if space or page is gated
  if (space.is_gated || currentPage.is_gated) {
    // Check for existing access proof cookie
    const cookieStore = await cookies();
    const accessProof = cookieStore.get('bb_access_proof');
    const hasValidProof = !!accessProof?.value;

    if (!hasValidProof) {
      const supabase = await createClient();
      const { data: accessRules } = await supabase
        .from('bb_access_rules')
        .select('*')
        .eq('space_id', space.id)
        .eq('is_active', true);

      const rules = (accessRules ?? []) as BBAccessRule[];

      if (rules.length > 0) {
        return (
          <PublishedLayout
            space={space}
            pages={allPages}
            currentSlug={currentPage.slug}
            headings={[]}
            versions={versions}
            currentVersionId={activeVersionId}
          >
            <TokenGate rules={rules} spaceName={space.name} />
          </PublishedLayout>
        );
      }
    }
  }

  // Use pre-rendered HTML from static bundle, or render on the fly
  const bundlePage = currentPage as BBPage & { renderedHtml?: string; headings?: { id: string; text: string; level: number }[] };
  const html = bundlePage.renderedHtml ?? renderTiptapDoc(currentPage.content as TiptapDoc);
  const headings = bundlePage.headings ?? extractHeadings(currentPage.content as TiptapDoc);

  // Check if this page is premium and monetization is enabled
  let paidContent: BBPaidContent | null = null;
  if (currentPage.is_premium && space.monetization_enabled) {
    const supabase = await createClient();
    const { data: pc } = await supabase
      .from('bb_paid_content')
      .select('*')
      .eq('space_id', space.id)
      .eq('page_id', currentPage.id)
      .eq('is_active', true)
      .limit(1)
      .single();
    paidContent = pc as BBPaidContent | null;
  }

  // Check for existing purchase cookie to bypass paywall
  let hasPurchaseProof = false;
  if (paidContent) {
    const cookieStore = await cookies();
    const purchaseCookie = cookieStore.get(`bb_purchase_${paidContent.id}`);
    hasPurchaseProof = !!purchaseCookie?.value;
  }

  // Build teaser: first 200 characters of plain text, rendered as HTML
  const showPaywall = paidContent !== null && !hasPurchaseProof;
  let teaserHtml = '';
  if (showPaywall) {
    const plainText = extractPlainText(currentPage.content as TiptapDoc);
    const teaserText = plainText.slice(0, 200);
    teaserHtml = `<p>${teaserText}${plainText.length > 200 ? '...' : ''}</p>`;
  }

  // JSON-LD structured data
  const pageBaseUrl = space.custom_domain
    ? `https://${space.custom_domain}`
    : `https://${space.slug}.blinkbook.goblink.io`;
  const pageUrl = `${pageBaseUrl}/${currentPage.slug}`;
  const pageDescription = currentPage.meta_description
    ?? space.meta_description
    ?? space.description
    ?? `Documentation for ${space.name}`;
  const pageOgImage = currentPage.og_image_url
    ?? space.og_image_url
    ?? `${pageBaseUrl}/api/og?${new URLSearchParams({
        title: currentPage.title,
        spaceName: space.name,
        ...(pageDescription ? { description: pageDescription } : {}),
        theme: space.brand_primary_color ?? '#3B82F6',
      }).toString()}`;
  const jsonLd = buildJsonLd(space, currentPage, pageUrl, pageOgImage, pageDescription);

  return (
    <PublishedLayout
      space={space}
      pages={allPages}
      currentSlug={currentPage.slug}
      headings={showPaywall ? [] : headings}
      versions={versions}
      currentVersionId={activeVersionId}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="text-3xl font-bold text-white mb-8 tracking-tight">{currentPage.title}</h1>
      {showPaywall && paidContent ? (
        <Paywall
          teaser={teaserHtml}
          priceUsd={Number(paidContent.price_usd)}
          acceptedTokens={paidContent.accepted_tokens}
          contentId={paidContent.id}
          payoutWallet={space.payout_wallet ?? undefined}
        />
      ) : (
        <>
          <TiptapContent html={html} />
          <FeedbackWidget spaceId={space.id} pageId={currentPage.id} />
        </>
      )}
      <PageviewTracker spaceSlug={space.slug} pageId={currentPage.id} />
    </PublishedLayout>
  );
}

function extractPlainText(doc: TiptapDoc): string {
  const parts: string[] = [];
  function walk(nodes: TiptapDoc['content']) {
    for (const node of nodes) {
      if (node.text) parts.push(node.text);
      if (node.content) walk(node.content);
    }
  }
  walk(doc.content);
  return parts.join(' ');
}
