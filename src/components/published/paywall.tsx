'use client';

import { DollarSign, Lock } from 'lucide-react';

interface PaywallProps {
  teaser: string;
  priceUsd: number;
  acceptedTokens: string[];
}

export function Paywall({ teaser, priceUsd, acceptedTokens }: PaywallProps) {
  return (
    <div className="relative">
      {/* Teaser content */}
      <div className="relative overflow-hidden">
        <div
          className="bb-content text-zinc-300 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: teaser }}
        />
        {/* CSS gradient blur overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, var(--bb-background, #09090b) 80%)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            maskImage: 'linear-gradient(to bottom, transparent 20%, black 60%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 20%, black 60%)',
          }}
        />
      </div>

      {/* Paywall card */}
      <div className="mt-4 border border-zinc-700 rounded-xl p-6 text-center bg-zinc-900/80 backdrop-blur-sm">
        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6 text-zinc-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">Premium Content</h3>
        <p className="text-sm text-zinc-400 mb-4">
          Unlock this page for{' '}
          <span className="text-white font-medium">${priceUsd.toFixed(2)}</span>
        </p>

        {acceptedTokens.length > 0 && (
          <p className="text-xs text-zinc-500 mb-4">
            Accepted: {acceptedTokens.join(', ')}
          </p>
        )}

        <button
          type="button"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition"
          onClick={() => {
            // Placeholder: crypto payment flow
          }}
        >
          <DollarSign className="w-4 h-4" />
          Pay with Crypto
        </button>
      </div>
    </div>
  );
}
