"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, X } from "lucide-react";

interface SearchEntry {
  title: string;
  description: string;
  href: string;
  content: string;
}

interface SearchResult {
  title: string;
  description: string;
  href: string;
}

export function SearchDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [data, setData] = useState<SearchEntry[]>([]);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open && data.length === 0) {
      fetch("/api/search")
        .then((r) => r.json())
        .then((d: SearchEntry[]) => setData(d))
        .catch(() => {});
    }
    if (open) {
      setQuery("");
      setResults([]);
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, data.length]);

  const search = useCallback(
    (q: string) => {
      setQuery(q);
      setSelected(0);
      if (!q.trim()) {
        setResults([]);
        return;
      }
      const lower = q.toLowerCase();
      const matched = data
        .filter(
          (entry) =>
            entry.title.toLowerCase().includes(lower) ||
            entry.description.toLowerCase().includes(lower) ||
            entry.content.toLowerCase().includes(lower)
        )
        .slice(0, 8)
        .map(({ title, description, href }) => ({ title, description, href }));
      setResults(matched);
    },
    [data]
  );

  const navigate = useCallback(
    (href: string) => {
      onClose();
      router.push(href);
    },
    [onClose, router]
  );

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      } else if (e.key === "Enter" && results[selected]) {
        navigate(results[selected].href);
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, results, selected, navigate, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[5vh] sm:pt-[15vh]">
      <div className="fixed inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full h-full sm:h-auto max-w-lg sm:mx-4 bg-surface sm:border border-border sm:rounded-xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <Search size={16} className="text-muted shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => search(e.target.value)}
            placeholder="Search documentation…"
            className="flex-1 py-3.5 bg-transparent text-base sm:text-sm text-foreground placeholder:text-muted outline-none"
          />
          <button onClick={onClose} className="text-muted hover:text-foreground p-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        {results.length > 0 && (
          <div className="flex-1 overflow-y-auto p-2 sm:max-h-80">
            {results.map((result, i) => (
              <button
                key={result.href}
                onClick={() => navigate(result.href)}
                className={`w-full flex items-start gap-3 px-3 py-3 sm:py-2.5 rounded-lg text-left transition-colors min-h-[44px] ${
                  i === selected ? "bg-accent-blue/10" : "hover:bg-surface-hover"
                }`}
              >
                <FileText size={16} className="text-muted mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-medium">{result.title}</div>
                  <div className="text-xs text-muted line-clamp-1">
                    {result.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {query && results.length === 0 && (
          <div className="p-8 text-center text-sm text-muted">
            No results found for &ldquo;{query}&rdquo;
          </div>
        )}

        {!query && (
          <div className="p-8 text-center text-sm text-muted">
            Start typing to search…
          </div>
        )}
      </div>
    </div>
  );
}
