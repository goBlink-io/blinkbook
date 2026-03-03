'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

interface NavItem {
  id: string;
  title: string;
  slug: string;
  parent_id: string | null;
  children: NavItem[];
}

function MobileNavLink({
  item,
  spaceSlug,
  currentSlug,
  primaryColor,
  depth = 0,
  onNavigate,
}: {
  item: NavItem;
  spaceSlug: string;
  currentSlug: string;
  primaryColor: string;
  depth?: number;
  onNavigate: () => void;
}) {
  const isActive = item.slug === currentSlug;

  return (
    <div>
      <Link
        href={`/sites/${spaceSlug}/${item.slug}`}
        onClick={onNavigate}
        className={`block py-2 text-sm transition border-l-2 ${
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
        <MobileNavLink
          key={child.id}
          item={child}
          spaceSlug={spaceSlug}
          currentSlug={currentSlug}
          primaryColor={primaryColor}
          depth={depth + 1}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}

interface MobileNavDrawerProps {
  navTree: NavItem[];
  spaceSlug: string;
  currentSlug: string;
  primaryColor: string;
  spaceName: string;
}

export function MobileNavDrawer({
  navTree,
  spaceSlug,
  currentSlug,
  primaryColor,
  spaceName,
}: MobileNavDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button — visible below lg */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 -ml-2 text-zinc-400 hover:text-white transition"
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-zinc-950 border-r border-zinc-800 transform transition-transform duration-300 ease-in-out lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-zinc-800">
          <span className="text-sm font-bold text-white truncate">{spaceName}</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-2 text-zinc-400 hover:text-white transition"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="overflow-y-auto h-[calc(100%-3.5rem)] py-4 px-2">
          {navTree.map((item) => (
            <MobileNavLink
              key={item.id}
              item={item}
              spaceSlug={spaceSlug}
              currentSlug={currentSlug}
              primaryColor={primaryColor}
              onNavigate={() => setOpen(false)}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}
