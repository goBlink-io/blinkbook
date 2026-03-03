'use client';

import { Shield } from 'lucide-react';
import type { BBAccessRule } from '@/types/database';

interface TokenGateProps {
  rules: BBAccessRule[];
  spaceName: string;
}

export function TokenGate({ rules, spaceName }: TokenGateProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-5">
          <Shield className="w-7 h-7 text-blue-500" />
        </div>

        <h2 className="text-xl font-bold text-white mb-2">Token-Gated Content</h2>
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

        <button className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition">
          Connect Wallet
        </button>

        <p className="text-xs text-zinc-600 mt-4">
          Connect your wallet to verify token ownership and unlock this content.
        </p>
      </div>
    </div>
  );
}
