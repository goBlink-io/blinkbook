'use client';

import { useEffect } from 'react';

function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('bb_visitor_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('bb_visitor_id', id);
  }
  return id;
}

export function PageviewTracker({ spaceSlug, pageId }: { spaceSlug: string; pageId: string }) {
  useEffect(() => {
    const visitorId = getVisitorId();
    fetch(`/api/sites/${spaceSlug}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'pageview',
        pageId,
        visitorId,
      }),
    }).catch(() => {});
  }, [spaceSlug, pageId]);

  return null;
}
