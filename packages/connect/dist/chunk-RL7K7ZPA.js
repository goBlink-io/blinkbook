import { useCallback } from 'react';
import { useAccount, useDisconnect, useConnect } from '@starknet-react/core';

function useStarknetAdapter() {
  const { address, isConnected } = useAccount();
  const { disconnect: starknetDisconnect } = useDisconnect();
  const { connect: starknetConnect, connectors } = useConnect();
  const connect = useCallback(async () => {
    if (connectors[0]) {
      starknetConnect({ connector: connectors[0] });
    }
  }, [starknetConnect, connectors]);
  const disconnect = useCallback(async () => {
    starknetDisconnect();
  }, [starknetDisconnect]);
  return {
    chain: "starknet",
    address: isConnected ? address ?? null : null,
    connected: !!isConnected,
    connect,
    disconnect
  };
}
function useStarknetConnectors() {
  const { connect, connectors } = useConnect();
  return { connect, connectors };
}

export { useStarknetAdapter, useStarknetConnectors };
