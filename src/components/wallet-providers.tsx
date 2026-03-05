'use client';

import { BlinkConnectProvider } from '@goblink/connect/react';
import type { ChainType } from '@goblink/connect';
import type { ReactNode } from 'react';

const blinkConnectConfig = {
  projectId: process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ?? '',
  chains: ['evm', 'solana', 'sui'] as ChainType[],
  theme: 'dark' as const,
  appName: 'goBlink Book',
};

export function WalletProviders({ children }: { children: ReactNode }) {
  // BlinkConnect ships React 18 types; cast to bridge React 19
  const Provider = BlinkConnectProvider as React.ComponentType<{
    config: typeof blinkConnectConfig;
    children: ReactNode;
  }>;

  return (
    <Provider config={blinkConnectConfig}>
      {children}
    </Provider>
  );
}
