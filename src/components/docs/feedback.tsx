"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

export function Feedback({ slug }: { slug: string }) {
  const storageKey = `bb-feedback-${slug}`;
  const [submitted, setSubmitted] = useState(false);
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [comment, setComment] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) setSubmitted(true);
    } catch {}
  }, [storageKey]);

  const handleVote = (v: "up" | "down") => {
    setVote(v);
    setShowInput(true);
  };

  const handleSubmit = () => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ vote, comment, timestamp: Date.now() })
      );
    } catch {}
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="mt-12 py-4 text-center text-sm text-muted">
        Thanks for your feedback!
      </div>
    );
  }

  return (
    <div className="mt-12 rounded-lg bg-zinc-800/50 border border-border p-4">
      <p className="text-sm text-muted mb-3">Was this page helpful?</p>

      {!showInput ? (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleVote("up")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-sm text-muted hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-colors min-h-[44px]"
          >
            <ThumbsUp size={14} />
            Yes
          </button>
          <button
            onClick={() => handleVote("down")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-sm text-muted hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-colors min-h-[44px]"
          >
            <ThumbsDown size={14} />
            No
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            {vote === "up" ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <ThumbsUp size={14} /> Helpful
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-400">
                <ThumbsDown size={14} /> Not helpful
              </span>
            )}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Any additional feedback? (optional)"
            rows={2}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted/50 outline-none focus:border-accent-blue resize-none"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleSubmit}
              className="px-3 py-1.5 rounded-md text-sm font-medium text-white min-h-[44px]"
              style={{ background: `var(--bb-primary)` }}
            >
              Submit
            </button>
            <button
              onClick={() => { setShowInput(false); setVote(null); }}
              className="px-3 py-1.5 rounded-md text-sm text-muted hover:text-foreground transition-colors min-h-[44px]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
