'use client';

import { useState } from 'react';
import { Globe, Loader2, Check } from 'lucide-react';

interface PublishButtonProps {
  spaceId: string;
  isPublished: boolean;
  onPublished?: (url: string) => void;
}

export function PublishButton({ spaceId, isPublished: initialPublished, onPublished }: PublishButtonProps) {
  const [status, setStatus] = useState<'idle' | 'publishing' | 'published' | 'error'>(
    initialPublished ? 'published' : 'idle'
  );
  const [liveUrl, setLiveUrl] = useState('');

  const handlePublish = async () => {
    setStatus('publishing');

    try {
      const res = await fetch(`/api/spaces/${spaceId}/publish`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to publish');

      const data = await res.json();
      setLiveUrl(data.url);
      setStatus('published');
      onPublished?.(data.url);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleUnpublish = async () => {
    try {
      const res = await fetch(`/api/spaces/${spaceId}/unpublish`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to unpublish');
      setStatus('idle');
      setLiveUrl('');
    } catch {
      // Keep current state on error
    }
  };

  if (status === 'published') {
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleUnpublish}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition w-full justify-center"
        >
          <Check className="w-4 h-4" />
          Published
        </button>
        {liveUrl && (
          <a
            href={`https://${liveUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-xs text-blue-400 hover:underline text-center truncate"
          >
            {liveUrl}
          </a>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handlePublish}
      disabled={status === 'publishing'}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-50 w-full justify-center"
    >
      {status === 'publishing' ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Publishing...
        </>
      ) : status === 'error' ? (
        'Failed — retry'
      ) : (
        <>
          <Globe className="w-4 h-4" />
          Publish
        </>
      )}
    </button>
  );
}
