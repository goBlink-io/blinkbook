'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, PanelLeftClose, PanelLeft } from 'lucide-react';
import { PageTree } from './page-tree';
import type { BBPage } from '@/types/database';

interface EditorSidebarProps {
  activePageId?: string;
}

export function EditorSidebar({ activePageId }: EditorSidebarProps) {
  const params = useParams<{ siteId: string }>();
  const [pages, setPages] = useState<BBPage[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  const fetchPages = useCallback(async () => {
    const res = await fetch(`/api/spaces/${params.siteId}/pages`);
    if (res.ok) {
      setPages(await res.json());
    }
  }, [params.siteId]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  if (collapsed) {
    return (
      <div className="w-10 border-r border-zinc-800 bg-zinc-950 flex flex-col items-center py-3 shrink-0">
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="p-1.5 text-zinc-500 hover:text-white transition rounded hover:bg-zinc-800"
          title="Expand sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-[260px] border-r border-zinc-800 bg-zinc-950 flex flex-col shrink-0">
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
            <BookOpen className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-bold text-white">BlinkBook</span>
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed(true)}
          className="p-1 text-zinc-500 hover:text-white transition rounded hover:bg-zinc-800"
          title="Collapse sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      <PageTree pages={pages} activePageId={activePageId} onPagesChange={fetchPages} />
    </aside>
  );
}
