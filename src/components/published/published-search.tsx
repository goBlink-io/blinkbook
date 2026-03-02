'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';

interface SearchEntry {
  id: string;
  title: string;
  slug: string;
  content: string;
  section: string;
}

interface SearchResult {
  entry: SearchEntry;
  snippet: string;
}

function getSnippet(content: string, query: string, maxLen = 120): string {
  const lower = content.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return content.slice(0, maxLen) + (content.length > maxLen ? '...' : '');
  const start = Math.max(0, idx - 40);
  const end = Math.min(content.length, idx + query.length + 80);
  let snippet = '';
  if (start > 0) snippet += '...';
  snippet += content.slice(start, end);
  if (end < content.length) snippet += '...';
  return snippet;
}

function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-blue-500/30 text-blue-300 rounded px-0.5">{part}</mark>
    ) : (
      part
    )
  );
}

export function PublishedSearch({ spaceSlug }: { spaceSlug: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load search index
  useEffect(() => {
    if (!open || entries.length > 0) return;
    fetch(`/api/sites/${spaceSlug}/search`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEntries(data);
      })
      .catch(() => {});
  }, [open, spaceSlug, entries.length]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
      setActiveIdx(0);
    }
  }, [open]);

  // Search
  const search = useCallback(
    (q: string) => {
      setQuery(q);
      setActiveIdx(0);
      if (!q.trim()) {
        setResults([]);
        return;
      }
      const lower = q.toLowerCase();
      const matched = entries
        .filter(
          (e) =>
            e.title.toLowerCase().includes(lower) ||
            e.content.toLowerCase().includes(lower)
        )
        .slice(0, 10)
        .map((entry) => ({
          entry,
          snippet: getSnippet(entry.content, q),
        }));
      setResults(matched);
    },
    [entries]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[activeIdx]) {
      window.location.href = `/sites/${spaceSlug}/${results[activeIdx].entry.slug}`;
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline text-xs text-zinc-600 ml-2">
          <span className="text-[10px]">&#8984;</span>K
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg mx-4 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 border-b border-zinc-800">
              <Search className="w-4 h-4 text-zinc-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => search(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search documentation..."
                className="flex-1 py-3 bg-transparent text-white text-sm outline-none placeholder-zinc-500"
              />
              <button type="button" onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {results.length > 0 && (
              <div className="max-h-80 overflow-y-auto py-2">
                {results.map((r, i) => (
                  <a
                    key={r.entry.id}
                    href={`/sites/${spaceSlug}/${r.entry.slug}`}
                    className={`block px-4 py-3 transition ${
                      i === activeIdx ? 'bg-zinc-800' : 'hover:bg-zinc-800/50'
                    }`}
                    onMouseEnter={() => setActiveIdx(i)}
                  >
                    <p className="text-sm font-medium text-white mb-0.5">
                      {highlightMatch(r.entry.title, query)}
                    </p>
                    <p className="text-xs text-zinc-400 line-clamp-2">
                      {highlightMatch(r.snippet, query)}
                    </p>
                  </a>
                ))}
              </div>
            )}

            {query && results.length === 0 && (
              <div className="py-8 text-center text-sm text-zinc-500">No results found</div>
            )}

            {!query && (
              <div className="py-6 text-center text-sm text-zinc-600">
                Type to search documentation
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
