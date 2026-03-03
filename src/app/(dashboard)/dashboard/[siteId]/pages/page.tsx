'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, FileText, ThumbsUp } from 'lucide-react';
import type { BBPage, BBPageFeedbackSummary } from '@/types/database';

export default function PagesListPage() {
  const params = useParams<{ siteId: string }>();
  const router = useRouter();
  const [pages, setPages] = useState<BBPage[]>([]);
  const [feedback, setFeedback] = useState<Map<string, BBPageFeedbackSummary>>(new Map());
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchPages = useCallback(async () => {
    const res = await fetch(`/api/spaces/${params.siteId}/pages`);
    if (res.ok) setPages(await res.json());
    setLoading(false);
  }, [params.siteId]);

  const fetchFeedback = useCallback(async () => {
    const res = await fetch(`/api/feedback?space_id=${params.siteId}`);
    if (res.ok) {
      const summaries: BBPageFeedbackSummary[] = await res.json();
      setFeedback(new Map(summaries.map((s) => [s.page_id, s])));
    }
  }, [params.siteId]);

  useEffect(() => {
    fetchPages();
    fetchFeedback();
  }, [fetchPages, fetchFeedback]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch(`/api/spaces/${params.siteId}/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled' }),
      });
      if (res.ok) {
        const page = await res.json();
        router.push(`/dashboard/${params.siteId}/editor/${page.id}`);
      }
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto py-8 px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-white">Pages</h1>
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition font-medium disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            New Page
          </button>
        </div>

        {pages.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
            <FileText className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 mb-4">No pages yet. Create your first page to get started.</p>
            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              New Page
            </button>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
            {pages.map((page) => (
              <button
                key={page.id}
                type="button"
                onClick={() => router.push(`/dashboard/${params.siteId}/editor/${page.id}`)}
                className="flex items-center justify-between w-full px-5 py-3.5 hover:bg-zinc-800/50 transition text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-4 h-4 text-zinc-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium truncate">{page.title}</p>
                    <p className="text-xs text-zinc-500">/{page.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {feedback.get(page.id) && (
                    <span className="inline-flex items-center gap-1 text-xs text-zinc-400" title={`${feedback.get(page.id)!.total} votes`}>
                      <ThumbsUp className="w-3 h-3" />
                      {feedback.get(page.id)!.helpful_pct}%
                      <span className="text-zinc-600">({feedback.get(page.id)!.total})</span>
                    </span>
                  )}
                  <span className="text-xs text-zinc-500">
                    {new Date(page.updated_at).toLocaleDateString()}
                  </span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      page.is_published
                        ? 'text-green-400 bg-green-500/10'
                        : 'text-zinc-500 bg-zinc-800'
                    }`}
                  >
                    {page.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
