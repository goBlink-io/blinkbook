import { useCallback } from 'react';
import { useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';

function useSuiAdapter() {
  const suiAccount = useCurrentAccount();
  const { mutate: suiDisconnect } = useDisconnectWallet();
  const connect = useCallback(async () => {
  }, []);
  const disconnect = useCallback(async () => {
    suiDisconnect();
  }, [suiDisconnect]);
  return {
    chain: "sui",
    address: suiAccount?.address ?? null,
    connected: !!suiAccount?.address,
    connect,
    disconnect
  };
}

export { useSuiAdapter };
