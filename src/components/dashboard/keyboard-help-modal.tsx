'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { shortcuts, type KeyboardShortcut } from '@/lib/keyboard-shortcuts';

interface KeyboardHelpModalProps {
  open: boolean;
  onClose: () => void;
}

const groups = ['Navigation', 'Editor', 'Publishing'] as const;

function ShortcutRow({ shortcut }: { shortcut: KeyboardShortcut }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-zinc-300">{shortcut.description}</span>
      <kbd className="bg-zinc-800 px-2 py-0.5 rounded text-xs text-zinc-400 font-mono">
        {shortcut.label}
      </kbd>
    </div>
  );
}

export function KeyboardHelpModal({ open, onClose }: KeyboardHelpModalProps) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full mx-4 p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold text-zinc-100 mb-6">
          Keyboard Shortcuts
        </h2>

        <div className="space-y-6">
          {groups.map((group) => {
            const groupShortcuts = shortcuts.filter((s) => s.group === group);
            if (groupShortcuts.length === 0) return null;

            return (
              <div key={group}>
                <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                  {group}
                </h3>
                <div className="space-y-0.5">
                  {groupShortcuts.map((shortcut) => (
                    <ShortcutRow key={shortcut.key} shortcut={shortcut} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
