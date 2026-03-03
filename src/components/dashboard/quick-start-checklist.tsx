'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, X, Copy, Check } from 'lucide-react';

interface QuickStartChecklistProps {
  spaceId: string;
  spaceSlug: string;
  hasPages: boolean;
  hasCustomTheme: boolean;
  hasFavicon: boolean;
  isPublished: boolean;
}

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  href?: string;
  action?: 'copy-link';
}

export function QuickStartChecklist({
  spaceId,
  spaceSlug,
  hasPages,
  hasCustomTheme,
  hasFavicon,
  isPublished,
}: QuickStartChecklistProps) {
  const storageKey = `bb_checklist_dismissed_${spaceId}`;
  const linkSharedKey = `bb_checklist_link_shared_${spaceId}`;

  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash
  const [linkShared, setLinkShared] = useState(false);
  const [copied, setCopied] = useState(false);
  const [justChecked, setJustChecked] = useState<string | null>(null);

  useEffect(() => {
    setDismissed(localStorage.getItem(storageKey) === 'true');
    setLinkShared(localStorage.getItem(linkSharedKey) === 'true');
  }, [storageKey, linkSharedKey]);

  const items: ChecklistItem[] = [
    {
      id: 'write-page',
      label: 'Write your first page',
      checked: hasPages,
      href: `/dashboard/${spaceId}/editor/new`,
    },
    {
      id: 'choose-theme',
      label: 'Choose a theme',
      checked: hasCustomTheme,
      href: `/dashboard/${spaceId}/settings`,
    },
    {
      id: 'add-favicon',
      label: 'Add a favicon',
      checked: hasFavicon,
      href: `/dashboard/${spaceId}/settings`,
    },
    {
      id: 'publish',
      label: 'Publish your site',
      checked: isPublished,
    },
    {
      id: 'share-link',
      label: 'Share your link',
      checked: linkShared,
      action: 'copy-link',
    },
  ];

  const completedCount = items.filter((i) => i.checked).length;
  const allComplete = completedCount === items.length;

  if (dismissed || allComplete) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(storageKey, 'true');
  };

  const handleCopyLink = async () => {
    const url = `https://${spaceSlug}.blinkbook.goblink.io`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setLinkShared(true);
    setJustChecked('share-link');
    localStorage.setItem(linkSharedKey, 'true');
    setTimeout(() => {
      setCopied(false);
      setJustChecked(null);
    }, 2000);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Getting Started</h3>
        <button
          onClick={handleDismiss}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition"
        >
          Dismiss
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-zinc-800 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${(completedCount / items.length) * 100}%` }}
        />
      </div>
      <p className="text-xs text-zinc-500 mb-4">{completedCount}/{items.length} complete</p>

      <div className="space-y-2.5">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 transition-all duration-300 ${
              justChecked === item.id ? 'scale-[1.02]' : ''
            }`}
          >
            {item.checked ? (
              <CheckCircle2
                className={`w-5 h-5 shrink-0 transition-colors duration-300 ${
                  justChecked === item.id ? 'text-green-400' : 'text-green-500/70'
                }`}
              />
            ) : (
              <Circle className="w-5 h-5 text-zinc-600 shrink-0" />
            )}

            <span
              className={`text-sm flex-1 ${
                item.checked ? 'text-zinc-500 line-through' : 'text-zinc-300'
              }`}
            >
              {item.label}
            </span>

            {!item.checked && item.href && (
              <Link
                href={item.href}
                className="text-xs text-blue-400 hover:text-blue-300 transition shrink-0"
              >
                Go
              </Link>
            )}

            {!item.checked && item.action === 'copy-link' && (
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition shrink-0"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            )}

            {item.checked && item.action === 'copy-link' && (
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-400 transition shrink-0"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
