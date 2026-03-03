'use client';

import { useState, useEffect } from 'react';
import { Copy, ExternalLink, X, Check, Sparkles } from 'lucide-react';

interface PublishCelebrationProps {
  spaceSlug: string;
  onClose: () => void;
}

export function PublishCelebration({ spaceSlug, onClose }: PublishCelebrationProps) {
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const url = `https://${spaceSlug}.blinkbook.goblink.io`;

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <style>{`
            @keyframes confetti-fall {
              0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
              100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }
          `}</style>
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'][i % 6],
                animation: `confetti-fall ${2 + Math.random() * 2}s ease-out ${Math.random() * 1}s forwards`,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full mx-4 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-blue-400" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mb-2">Your docs are live!</h2>
        <p className="text-sm text-zinc-400 mb-6">
          Your documentation is now published and accessible to the world.
        </p>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm text-blue-400 hover:text-blue-300 transition mb-6 truncate"
        >
          {url}
        </a>

        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition border border-zinc-700"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition"
          >
            <ExternalLink className="w-4 h-4" />
            View Your Site
          </a>
        </div>

        <button
          onClick={onClose}
          className="mt-4 text-xs text-zinc-500 hover:text-zinc-400 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}
