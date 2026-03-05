'use client';

import { useState, useCallback } from 'react';
import { DollarSign, Lock, CheckCircle, Loader2 } from 'lucide-react';
import { useWallet, useSign, ConnectButton, ConnectModal } from '@goblink/connect/react';

interface PaywallProps {
  teaser: string;
  priceUsd: number;
  acceptedTokens: string[];
  contentId?: string;
  payoutWallet?: string;
}

type PaymentStatus = 'idle' | 'signing' | 'confirming' | 'success' | 'error';

export function Paywall({ teaser, priceUsd, acceptedTokens, contentId, payoutWallet }: PaywallProps) {
  const { address, isConnected, chain } = useWallet();
  const { signTransaction } = useSign();
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const handlePayment = useCallback(async () => {
    if (!address || !chain || !contentId) return;

    setStatus('signing');
    setError(null);

    try {
      // Build a token transfer transaction
      // For now, use signTransaction which handles the chain-specific transaction
      const txHash = await signTransaction(
        {
          to: payoutWallet,
          value: priceUsd.toString(),
          // The wallet adapter handles token selection and conversion
        },
        chain
      );

      setStatus('confirming');

      // Record the purchase
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paid_content_id: contentId,
          buyer_wallet: address,
          buyer_chain: chain,
          tx_hash: txHash,
          amount_usd: priceUsd,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Failed to record purchase');
        setStatus('error');
        return;
      }

      setStatus('success');
      // Reload to show unlocked content
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
      setStatus('error');
    }
  }, [address, chain, contentId, payoutWallet, priceUsd, signTransaction]);

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
          {status === 'success' ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : (
            <Lock className="w-6 h-6 text-zinc-400" />
          )}
        </div>

        {status === 'success' ? (
          <>
            <h3 className="text-lg font-semibold text-white mb-1">Payment Successful</h3>
            <p className="text-sm text-zinc-400">Unlocking content...</p>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-white mb-1">Premium Content</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Unlock this page for{' '}
              <span className="text-white font-medium">${priceUsd.toFixed(2)}</span>
            </p>

            {acceptedTokens.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                {acceptedTokens.map((token) => (
                  <span
                    key={token}
                    className="text-xs bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-full text-zinc-400"
                  >
                    {token}
                  </span>
                ))}
              </div>
            )}

            {error && (
              <p className="text-sm text-red-400 mb-4">{error}</p>
            )}

            {status === 'signing' ? (
              <div className="flex items-center justify-center gap-2 text-zinc-400 text-sm py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Confirm in your wallet...
              </div>
            ) : status === 'confirming' ? (
              <div className="flex items-center justify-center gap-2 text-zinc-400 text-sm py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Recording purchase...
              </div>
            ) : isConnected ? (
              <div className="space-y-3">
                <p className="text-xs text-zinc-500 font-mono truncate">
                  Paying from: {address}
                </p>
                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={!contentId || !payoutWallet}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
                >
                  <DollarSign className="w-4 h-4" />
                  Pay ${priceUsd.toFixed(2)}
                </button>
              </div>
            ) : (
              <ConnectButton
                label="Connect Wallet to Pay"
                theme="dark"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition"
              />
            )}
          </>
        )}
      </div>

      <ConnectModal theme="dark" accentColor="#3b82f6" />
    </div>
  );
}
