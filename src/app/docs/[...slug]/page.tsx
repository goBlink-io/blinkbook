import { notFound } from "next/navigation";
import { getDocBySlug, getAllSlugs } from "@/lib/mdx";
import { mdxComponents } from "@/components/docs/mdx-components";
import { Breadcrumbs } from "@/components/docs/breadcrumbs";
import { Pagination } from "@/components/docs/pagination";
import { Feedback } from "@/components/docs/feedback";
import { config } from "@/../blinkbook.config";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const doc = await getDocBySlug(slug);
  if (!doc) return {};
  return {
    title: `${doc.frontmatter.title} — ${config.title}`,
    description: doc.frontmatter.description,
  };
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const doc = await getDocBySlug(slug);
  if (!doc) notFound();

  const { frontmatter, Content } = doc;

  return (
    <article>
      <Breadcrumbs slug={slug} />
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {frontmatter.title}
        </h1>
        {frontmatter.description && (
          <p className="text-lg text-muted">{frontmatter.description}</p>
        )}
      </header>
      <div className="docs-content">
        <Content components={mdxComponents} />
      </div>
      <Feedback slug={slug.join("/")} />
      <Pagination slug={slug} />
    </article>
  );
}
