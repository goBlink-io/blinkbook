'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, PanelLeftClose, PanelLeft, Menu, X } from 'lucide-react';
import { PageTree } from './page-tree';
import type { BBPage } from '@/types/database';

interface EditorSidebarProps {
  activePageId?: string;
}

export function EditorSidebar({ activePageId }: EditorSidebarProps) {
  const params = useParams<{ siteId: string }>();
  const [pages, setPages] = useState<BBPage[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const fetchPages = useCallback(async () => {
    const res = await fetch(`/api/spaces/${params.siteId}/pages`);
    if (res.ok) {
      setPages(await res.json());
    }
  }, [params.siteId]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  // Close mobile drawer when active page changes
  useEffect(() => {
    setMobileOpen(false);
  }, [activePageId]);

  const sidebarInner = (
    <>
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
            <BookOpen className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-bold text-white">BlinkBook</span>
        </Link>
        {/* Desktop collapse button */}
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          className="hidden lg:block p-1 text-zinc-500 hover:text-white transition rounded hover:bg-zinc-800"
          title="Collapse sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
        {/* Mobile close button */}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1 text-zinc-500 hover:text-white transition rounded hover:bg-zinc-800"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <PageTree pages={pages} activePageId={activePageId} onPagesChange={fetchPages} />
    </>
  );

  return (
    <>
      {/* Mobile toggle button — visible below lg */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden absolute top-2 left-2 z-30 p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition"
        aria-label="Open page tree"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden ${
          mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-[260px] bg-zinc-950 border-r border-zinc-800 flex flex-col transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarInner}
      </aside>

      {/* Desktop sidebar — collapsed state */}
      {collapsed ? (
        <div className="hidden lg:flex w-10 border-r border-zinc-800 bg-zinc-950 flex-col items-center py-3 shrink-0">
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="p-1.5 text-zinc-500 hover:text-white transition rounded hover:bg-zinc-800"
            title="Expand sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Desktop sidebar — expanded state */
        <aside className="hidden lg:flex w-[260px] border-r border-zinc-800 bg-zinc-950 flex-col shrink-0">
          {sidebarInner}
        </aside>
      )}
    </>
  );
}
