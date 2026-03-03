'use client';

import { useState, useCallback } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('bb_visitor_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('bb_visitor_id', id);
  }
  return id;
}

function getFeedbackKey(pageId: string): string {
  return `bb_feedback_${pageId}`;
}

function hasAlreadyVoted(pageId: string): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(getFeedbackKey(pageId)) !== null;
}

function markAsVoted(pageId: string) {
  localStorage.setItem(getFeedbackKey(pageId), '1');
}

type WidgetState = 'idle' | 'comment' | 'submitting' | 'done' | 'already_voted';

export function FeedbackWidget({
  spaceId,
  pageId,
}: {
  spaceId: string;
  pageId: string;
}) {
  const [state, setState] = useState<WidgetState>(() =>
    hasAlreadyVoted(pageId) ? 'already_voted' : 'idle'
  );
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');

  const submit = useCallback(
    async (isHelpful: boolean, feedbackComment?: string) => {
      setState('submitting');
      try {
        const res = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            space_id: spaceId,
            page_id: pageId,
            helpful: isHelpful,
            comment: feedbackComment || null,
            user_fingerprint: getVisitorId(),
          }),
        });

        if (res.ok || res.status === 409) {
          markAsVoted(pageId);
          setState('done');
        } else {
          // Allow retry on server error
          setState('comment');
        }
      } catch {
        setState('comment');
      }
    },
    [spaceId, pageId]
  );

  const handleVote = (isHelpful: boolean) => {
    setHelpful(isHelpful);
    setState('comment');
  };

  const handleSubmitComment = () => {
    if (helpful !== null) {
      submit(helpful, comment);
    }
  };

  const handleSkipComment = () => {
    if (helpful !== null) {
      submit(helpful);
    }
  };

  if (state === 'already_voted' || state === 'done') {
    return (
      <div className="mt-12 pt-6 border-t border-white/10">
        <p className="text-sm text-zinc-400">
          Thanks for your feedback!
        </p>
      </div>
    );
  }

  return (
    <div className="mt-12 pt-6 border-t border-white/10">
      {state === 'idle' && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-400">Was this page helpful?</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleVote(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-300 bg-white/5 hover:bg-green-500/10 hover:text-green-400 border border-white/10 hover:border-green-500/30 rounded-lg transition"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              Yes
            </button>
            <button
              type="button"
              onClick={() => handleVote(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-300 bg-white/5 hover:bg-red-500/10 hover:text-red-400 border border-white/10 hover:border-red-500/30 rounded-lg transition"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              No
            </button>
          </div>
        </div>
      )}

      {(state === 'comment' || state === 'submitting') && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {helpful ? (
              <ThumbsUp className="w-4 h-4 text-green-400" />
            ) : (
              <ThumbsDown className="w-4 h-4 text-red-400" />
            )}
            <span className="text-sm text-zinc-400">
              {helpful ? 'Glad it helped!' : 'Sorry to hear that.'} Any additional feedback?
            </span>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us more (optional)..."
            rows={3}
            maxLength={2000}
            disabled={state === 'submitting'}
            className="w-full px-3 py-2 text-sm text-zinc-200 bg-white/5 border border-white/10 rounded-lg placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none disabled:opacity-50"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSubmitComment}
              disabled={state === 'submitting'}
              className="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition disabled:opacity-50"
            >
              {state === 'submitting' ? 'Sending...' : 'Submit'}
            </button>
            <button
              type="button"
              onClick={handleSkipComment}
              disabled={state === 'submitting'}
              className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-300 transition disabled:opacity-50"
            >
              Skip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
