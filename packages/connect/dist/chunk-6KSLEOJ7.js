import { useCallback } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

function useAptosAdapter() {
  const {
    account,
    connected,
    disconnect: aptosDisconnect,
    connect: aptosConnect,
    wallets
  } = useWallet();
  const connect = useCallback(async () => {
    if (wallets?.length) {
      await aptosConnect(wallets[0].name || wallets[0]);
    }
  }, [aptosConnect, wallets]);
  const disconnect = useCallback(async () => {
    await aptosDisconnect();
  }, [aptosDisconnect]);
  return {
    chain: "aptos",
    address: connected ? account?.address?.toString() ?? null : null,
    connected,
    connect,
    disconnect
  };
}

export { useAptosAdapter };
