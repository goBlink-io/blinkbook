'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { KeyboardHelpModal } from './keyboard-help-modal';

export function KeyboardShortcutsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [helpOpen, setHelpOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const getSiteId = useCallback(() => {
    // Extract siteId from pathname like /sites/[siteId]/...
    const match = pathname.match(/\/sites\/([^/]+)/);
    return match ? match[1] : null;
  }, [pathname]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Cmd+K — Open search
      if (meta && e.key === 'k') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('open-search'));
        return;
      }

      // Cmd+N — New page
      if (meta && e.key === 'n') {
        e.preventDefault();
        const siteId = getSiteId();
        if (siteId) {
          router.push(`/sites/${siteId}/pages/new`);
        }
        return;
      }

      // Cmd+S — Save
      if (meta && e.key === 's') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('save-editor'));
        return;
      }

      // Cmd+P — Publish/unpublish toggle
      if (meta && e.key === 'p') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('toggle-publish'));
        return;
      }

      // Cmd+, — Open settings
      if (meta && e.key === ',') {
        e.preventDefault();
        const siteId = getSiteId();
        if (siteId) {
          router.push(`/sites/${siteId}/settings`);
        }
        return;
      }

      // Escape — Close modal
      if (e.key === 'Escape') {
        window.dispatchEvent(new CustomEvent('close-modal'));
        setHelpOpen(false);
        return;
      }

      // ? — Show keyboard shortcuts (only when not typing in an input)
      if (e.key === '?' && !isInput) {
        setHelpOpen((prev) => !prev);
        return;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [getSiteId, router]);

  return (
    <>
      {children}
      <KeyboardHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
}
