'use client';

import { useState, useCallback } from 'react';
import { Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useWallet, ConnectButton, ConnectModal } from '@goblink/connect/react';
import type { BBAccessRule } from '@/types/database';

interface TokenGateProps {
  rules: BBAccessRule[];
  spaceName: string;
}

type GateStatus = 'idle' | 'connecting' | 'verifying' | 'granted' | 'denied';

export function TokenGate({ rules, spaceName }: TokenGateProps) {
  const { address, isConnected, chain } = useWallet();
  const [status, setStatus] = useState<GateStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const verifyAccess = useCallback(async () => {
    if (!address || !chain) return;

    setStatus('verifying');
    setError(null);

    try {
      const res = await fetch('/api/verify-token-gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: address,
          wallet_chain: chain,
          rules: rules.map((r) => ({
            id: r.id,
            chain: r.chain,
            contract_address: r.contract_address,
            token_type: r.token_type,
            min_amount: r.min_amount,
            token_id: r.token_id,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Verification failed');
        setStatus('denied');
        return;
      }

      const data = await res.json();
      if (data.granted) {
        setStatus('granted');
        // Reload to render full content (server will check the cookie)
        window.location.reload();
      } else {
        setError(data.reason ?? 'You do not hold the required tokens.');
        setStatus('denied');
      }
    } catch {
      setError('Network error. Please try again.');
      setStatus('denied');
    }
  }, [address, chain, rules]);

  // Auto-verify when wallet connects
  const handleConnected = useCallback(() => {
    if (isConnected && address) {
      verifyAccess();
    }
  }, [isConnected, address, verifyAccess]);

  // Trigger verification when wallet state changes to connected
  useState(() => {
    if (isConnected && address && status === 'idle') {
      handleConnected();
    }
  });

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-5">
          {status === 'granted' ? (
            <CheckCircle className="w-7 h-7 text-green-500" />
          ) : status === 'denied' ? (
            <XCircle className="w-7 h-7 text-red-500" />
          ) : (
            <Shield className="w-7 h-7 text-blue-500" />
          )}
        </div>

        <h2 className="text-xl font-bold text-white mb-2">
          {status === 'granted'
            ? 'Access Granted'
            : status === 'denied'
              ? 'Access Denied'
              : 'Token-Gated Content'}
        </h2>

        {status === 'verifying' ? (
          <div className="flex items-center justify-center gap-2 text-zinc-400 text-sm my-6">
            <Loader2 className="w-4 h-4 animate-spin" />
            Verifying token ownership...
          </div>
        ) : status === 'granted' ? (
          <p className="text-zinc-400 text-sm mb-6">
            Token ownership verified. Unlocking content...
          </p>
        ) : (
          <>
            <p className="text-zinc-400 text-sm mb-6">
              This documentation on <span className="text-white font-medium">{spaceName}</span> requires
              token ownership to access.
            </p>

            <div className="space-y-3 mb-6">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{rule.token_type}</span>
                    <span className="text-xs text-zinc-500">
                      {rule.chain.charAt(0).toUpperCase() + rule.chain.slice(1)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 font-mono mt-1 truncate">
                    {rule.contract_address}
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">
                    Required: {rule.min_amount}
                    {rule.token_id ? ` · Token #${rule.token_id}` : ''}
                  </p>
                </div>
              ))}
            </div>

            {error && (
              <p className="text-sm text-red-400 mb-4">{error}</p>
            )}

            {isConnected ? (
              <div className="space-y-3">
                <p className="text-xs text-zinc-500 font-mono truncate">
                  Connected: {address}
                </p>
                <button
                  type="button"
                  onClick={verifyAccess}
                  disabled={status !== 'idle' && status !== 'denied'}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
                >
                  Verify Token Ownership
                </button>
              </div>
            ) : (
              <ConnectButton
                label="Connect Wallet"
                theme="dark"
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
              />
            )}
          </>
        )}

        {!isConnected && status === 'idle' && (
          <p className="text-xs text-zinc-600 mt-4">
            Connect your wallet to verify token ownership and unlock this content.
          </p>
        )}
      </div>

      <ConnectModal theme="dark" accentColor="#3b82f6" />
    </div>
  );
}
