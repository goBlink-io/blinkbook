import { useCallback } from 'react';
import { useWallet } from '@tronweb3/tronwallet-adapter-react-hooks';

function useTronAdapter() {
  const {
    address,
    connected,
    disconnect: tronDisconnect,
    select,
    wallets,
    connect: tronConnect
  } = useWallet();
  const connect = useCallback(async () => {
    if (wallets?.length) {
      select(wallets[0].adapter.name);
      await tronConnect();
    }
  }, [select, wallets, tronConnect]);
  const disconnect = useCallback(async () => {
    await tronDisconnect();
  }, [tronDisconnect]);
  return {
    chain: "tron",
    address: connected ? address ?? null : null,
    connected,
    connect,
    disconnect
  };
}

export { useTronAdapter };
