'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { BBVersion } from '@/types/database';

interface PublishedVersionSwitcherProps {
  versions: BBVersion[];
  currentVersionId?: string;
  spaceSlug: string;
}

export function PublishedVersionSwitcher({
  versions,
  currentVersionId,
  spaceSlug,
}: PublishedVersionSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const activeVersion = versions.find((v) => v.id === currentVersionId) ?? versions.find((v) => v.is_current);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 rounded-md border border-zinc-700 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
      >
        {activeVersion?.label ?? 'Latest'}
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl overflow-hidden z-50">
          {versions.map((v) => {
            const isActive = v.id === (activeVersion?.id ?? currentVersionId);
            return (
              <button
                key={v.id}
                onClick={() => {
                  setOpen(false);
                  if (!isActive) {
                    router.push(`/sites/${spaceSlug}?version=${v.id}`);
                  }
                }}
                className="flex items-center justify-between w-full px-3 py-2 text-sm text-left hover:bg-zinc-800 transition-colors"
              >
                <span className={isActive ? 'text-white font-medium' : 'text-zinc-400'}>
                  {v.label}
                  {v.is_current && ' (Latest)'}
                </span>
                {isActive && <Check size={14} className="text-blue-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
