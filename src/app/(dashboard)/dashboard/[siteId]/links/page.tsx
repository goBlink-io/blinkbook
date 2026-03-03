'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { LinkIcon, ExternalLink, AlertTriangle, CheckCircle, RefreshCw, Search } from 'lucide-react';
import type { BBBrokenLink } from '@/types/database';

interface PageGroup {
  page_id: string;
  page_title: string;
  links: BBBrokenLink[];
}

export default function LinksPage() {
  const params = useParams<{ siteId: string }>();
  const [links, setLinks] = useState<BBBrokenLink[]>([]);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [pageTitles, setPageTitles] = useState<Record<string, string>>({});

  const fetchLinks = useCallback(async () => {
    const res = await fetch(`/api/spaces/${params.siteId}/check-links`);
    if (res.ok) {
      const data = await res.json();
      setLinks(data.links);
      setLastChecked(data.last_checked_at);

      // Fetch page titles for grouping
      const pageIds = [...new Set(data.links.map((l: BBBrokenLink) => l.page_id))];
      if (pageIds.length > 0) {
        const pagesRes = await fetch(`/api/spaces/${params.siteId}/pages`);
        if (pagesRes.ok) {
          const pages = await pagesRes.json();
          const titles: Record<string, string> = {};
          for (const page of pages) {
            titles[page.id] = page.title;
          }
          setPageTitles(titles);
        }
      }
    }
    setLoading(false);
  }, [params.siteId]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleScan = async () => {
    setScanning(true);
    try {
      const res = await fetch(`/api/spaces/${params.siteId}/check-links`, {
        method: 'POST',
      });
      if (res.ok) {
        await fetchLinks();
      }
    } finally {
      setScanning(false);
    }
  };

  const brokenLinks = links.filter((l) => l.is_broken);
  const healthyLinks = links.filter((l) => !l.is_broken);

  // Group broken links by page
  const groupedByPage: PageGroup[] = [];
  const pageMap = new Map<string, BBBrokenLink[]>();

  for (const link of brokenLinks) {
    const existing = pageMap.get(link.page_id);
    if (existing) {
      existing.push(link);
    } else {
      pageMap.set(link.page_id, [link]);
    }
  }

  for (const [page_id, pageLinks] of pageMap) {
    groupedByPage.push({
      page_id,
      page_title: pageTitles[page_id] ?? 'Unknown Page',
      links: pageLinks,
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Link Health</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {lastChecked
              ? `Last scanned ${new Date(lastChecked).toLocaleDateString()} at ${new Date(lastChecked).toLocaleTimeString()}`
              : 'No scan yet'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleScan}
          disabled={scanning}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition font-medium disabled:opacity-50"
        >
          {scanning ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          {scanning ? 'Scanning...' : 'Scan Now'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm text-zinc-500 mb-1">Total Links</p>
          <p className="text-2xl font-bold text-white">{links.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm text-zinc-500 mb-1">Healthy</p>
          <p className="text-2xl font-bold text-green-400">{healthyLinks.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-sm text-zinc-500 mb-1">Broken</p>
          <p className="text-2xl font-bold text-red-400">{brokenLinks.length}</p>
        </div>
      </div>

      {/* Broken Links grouped by page */}
      {brokenLinks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Broken Links
          </h2>

          <div className="space-y-4">
            {groupedByPage.map((group) => (
              <div key={group.page_id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-zinc-900/80">
                  <span className="text-sm font-medium text-white">{group.page_title}</span>
                  <Link
                    href={`/dashboard/${params.siteId}/editor/${group.page_id}`}
                    className="text-xs text-blue-400 hover:text-blue-300 transition"
                  >
                    Edit Page
                  </Link>
                </div>

                <div className="divide-y divide-zinc-800">
                  {group.links.map((link) => (
                    <div key={link.id} className="px-5 py-3 flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <LinkIcon className="w-3.5 h-3.5 text-red-400 shrink-0" />
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-zinc-300 hover:text-white truncate transition"
                          >
                            {link.url}
                          </a>
                          <ExternalLink className="w-3 h-3 text-zinc-600 shrink-0" />
                        </div>
                        {link.link_text && (
                          <p className="text-xs text-zinc-500 ml-5.5">
                            Text: &ldquo;{link.link_text}&rdquo;
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        {link.status_code ? (
                          <span className="text-xs font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                            {link.status_code}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-500">{link.error ?? 'Failed'}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Healthy Links */}
      {healthyLinks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Healthy Links
            <span className="text-sm font-normal text-zinc-500">({healthyLinks.length})</span>
          </h2>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
            {healthyLinks.map((link) => (
              <div key={link.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1 flex items-center gap-2">
                  <LinkIcon className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-zinc-300 hover:text-white truncate transition"
                  >
                    {link.url}
                  </a>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-zinc-500">{pageTitles[link.page_id] ?? ''}</span>
                  {link.status_code && (
                    <span className="text-xs font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded">
                      {link.status_code}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {links.length === 0 && lastChecked && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <LinkIcon className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400">No external links found in published pages.</p>
        </div>
      )}

      {links.length === 0 && !lastChecked && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <Search className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 mb-4">Run your first scan to check for broken links across all published pages.</p>
          <button
            type="button"
            onClick={handleScan}
            disabled={scanning}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition disabled:opacity-50"
          >
            {scanning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {scanning ? 'Scanning...' : 'Scan Now'}
          </button>
        </div>
      )}
    </div>
  );
}
