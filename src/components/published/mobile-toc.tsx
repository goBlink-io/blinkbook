'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface MobileTocProps {
  headings: TOCItem[];
}

export function MobileToc({ headings }: MobileTocProps) {
  const [expanded, setExpanded] = useState(false);

  if (headings.length === 0) return null;

  return (
    <div className="xl:hidden border border-zinc-800 rounded-lg mb-6">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-zinc-300 hover:text-white transition"
      >
        On this page
        <ChevronDown
          className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
          expanded ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <nav className="px-4 pb-3 space-y-1 border-t border-zinc-800">
          {headings.map((h) => (
            <a
              key={h.id}
              href={`#${h.id}`}
              onClick={() => setExpanded(false)}
              className="block text-sm text-zinc-400 hover:text-zinc-200 transition py-1"
              style={{ paddingLeft: `${(h.level - 2) * 12}px` }}
            >
              {h.text}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
