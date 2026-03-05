import { useCallback } from 'react';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';

function useTonAdapter() {
  const [tonConnectUI] = useTonConnectUI();
  const tonAddr = useTonAddress();
  const connect = useCallback(async () => {
    await tonConnectUI.openModal();
  }, [tonConnectUI]);
  const disconnect = useCallback(async () => {
    await tonConnectUI.disconnect();
  }, [tonConnectUI]);
  return {
    chain: "ton",
    address: tonAddr || null,
    connected: !!tonAddr,
    connect,
    disconnect
  };
}

export { useTonAdapter };
