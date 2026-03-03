import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { PublishedSearch } from './published-search';
import type { BBSpace, BBPage } from '@/types/database';

/** Google Fonts URL for the brand font (if not a system font). */
function googleFontUrl(font: string): string | null {
  const supported: Record<string, string> = {
    Inter: 'Inter:wght@400;500;600;700',
    Roboto: 'Roboto:wght@400;500;700',
    'Source Sans Pro': 'Source+Sans+Pro:wght@400;600;700',
    Merriweather: 'Merriweather:wght@400;700',
    'JetBrains Mono': 'JetBrains+Mono:wght@400;500;700',
  };
  const family = supported[font];
  return family ? `https://fonts.googleapis.com/css2?family=${family}&display=swap` : null;
}

/** Build a font-family CSS value. */
function fontStack(font: string): string {
  if (font === 'JetBrains Mono') return "'JetBrains Mono', ui-monospace, monospace";
  return `'${font}', ui-sans-serif, system-ui, sans-serif`;
}

interface NavItem {
  id: string;
  title: string;
  slug: string;
  parent_id: string | null;
  children: NavItem[];
}

function buildNavTree(pages: BBPage[], parentId: string | null = null): NavItem[] {
  return pages
    .filter((p) => p.parent_id === parentId)
    .sort((a, b) => a.position - b.position)
    .map((page) => ({
      id: page.id,
      title: page.title,
      slug: page.slug,
      parent_id: page.parent_id,
      children: buildNavTree(pages, page.id),
    }));
}

function NavLink({
  item,
  spaceSlug,
  currentSlug,
  primaryColor,
  depth = 0,
}: {
  item: NavItem;
  spaceSlug: string;
  currentSlug: string;
  primaryColor: string;
  depth?: number;
}) {
  const isActive = item.slug === currentSlug;

  return (
    <div>
      <Link
        href={`/sites/${spaceSlug}/${item.slug}`}
        className={`block py-1.5 text-sm transition border-l-2 ${
          isActive
            ? 'text-white font-medium'
            : 'text-zinc-400 border-transparent hover:text-zinc-200 hover:border-zinc-600'
        }`}
        style={{
          paddingLeft: `${depth * 12 + 16}px`,
          ...(isActive ? { borderColor: primaryColor } : {}),
        }}
      >
        {item.title}
      </Link>
      {item.children.map((child) => (
        <NavLink
          key={child.id}
          item={child}
          spaceSlug={spaceSlug}
          currentSlug={currentSlug}
          primaryColor={primaryColor}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

function TableOfContents({ headings }: { headings: TOCItem[] }) {
  if (headings.length === 0) return null;

  return (
    <nav className="space-y-1">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">On this page</p>
      {headings.map((h) => (
        <a
          key={h.id}
          href={`#${h.id}`}
          className="block text-sm text-zinc-400 hover:text-zinc-200 transition"
          style={{ paddingLeft: `${(h.level - 2) * 12}px` }}
        >
          {h.text}
        </a>
      ))}
    </nav>
  );
}

interface PublishedLayoutProps {
  space: BBSpace;
  pages: BBPage[];
  currentSlug: string;
  headings: TOCItem[];
  children: React.ReactNode;
}

export function PublishedLayout({
  space,
  pages,
  currentSlug,
  headings,
  children,
}: PublishedLayoutProps) {
  const navTree = buildNavTree(pages);

  const primaryColor = space.brand_primary_color ?? '#3B82F6';
  const accentColor = space.brand_accent_color ?? '#10B981';
  const brandFont = space.brand_font ?? 'Inter';
  const hidePoweredBy = space.brand_hide_powered_by ?? false;
  const logoUrl = space.brand_logo_url ?? space.logo_url;
  const fontHref = googleFontUrl(brandFont);

  return (
    <div
      className="min-h-screen bg-zinc-950 text-zinc-50"
      style={{
        '--brand-primary': primaryColor,
        '--brand-accent': accentColor,
        fontFamily: fontStack(brandFont),
      } as React.CSSProperties}
    >
      {/* Load Google Font */}
      {fontHref && (
        // eslint-disable-next-line @next/next/no-page-custom-font
        <link rel="stylesheet" href={fontHref} />
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between h-14 px-4 lg:px-8">
          <Link href={`/sites/${space.slug}`} className="flex items-center gap-2.5">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="w-7 h-7 rounded object-contain" />
            ) : (
              <div
                className="w-7 h-7 rounded flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
              >
                <BookOpen className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <span className="text-sm font-bold text-white">{space.name}</span>
          </Link>
          <PublishedSearch spaceSlug={space.slug} />
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto flex">
        {/* Left Sidebar: Navigation */}
        <aside className="hidden lg:block w-64 shrink-0 border-r border-zinc-800">
          <nav className="sticky top-14 overflow-y-auto h-[calc(100vh-3.5rem)] py-6 px-2">
            {navTree.map((item) => (
              <NavLink
                key={item.id}
                item={item}
                spaceSlug={space.slug}
                currentSlug={currentSlug}
                primaryColor={primaryColor}
              />
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 px-6 lg:px-12 py-8 lg:py-12">
          <div className="max-w-3xl">{children}</div>
        </main>

        {/* Right Sidebar: Table of Contents */}
        <aside className="hidden xl:block w-56 shrink-0">
          <div className="sticky top-14 overflow-y-auto h-[calc(100vh-3.5rem)] py-6 px-4">
            <TableOfContents headings={headings} />
          </div>
        </aside>
      </div>

      {/* Footer */}
      {!hidePoweredBy && (
        <footer className="border-t border-zinc-800 py-6 text-center">
          <p className="text-xs text-zinc-600">
            Built with{' '}
            <a href="/" className="text-zinc-400 hover:text-white transition">
              BlinkBook
            </a>
          </p>
        </footer>
      )}
    </div>
  );
}
