import { useCallback } from 'react';
import { useAccount, useDisconnect as useDisconnect$1 } from 'wagmi';
import { useAppKitAccount, useDisconnect, useAppKit } from '@reown/appkit/react';

function useEvmAdapter() {
  const { address: appKitAddress, isConnected: appKitConnected, caipAddress } = useAppKitAccount();
  const { disconnect: appKitDisconnect } = useDisconnect();
  const { address: wagmiAddress, isConnected: wagmiConnected } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect$1();
  const { open: openAppKit } = useAppKit();
  const appKitChain = (() => {
    if (!caipAddress) return null;
    if (caipAddress.startsWith("eip155:")) return "evm";
    if (caipAddress.startsWith("solana:")) return "solana";
    if (caipAddress.startsWith("bip122:")) return "bitcoin";
    return null;
  })();
  const evmAddress = appKitChain === "evm" && appKitAddress || wagmiConnected && wagmiAddress || null;
  const solanaAddress = appKitChain === "solana" && appKitAddress || null;
  const bitcoinAddress = appKitChain === "bitcoin" && appKitAddress || null;
  const connect = useCallback(async () => {
    openAppKit();
  }, [openAppKit]);
  const disconnect = useCallback(async () => {
    if (appKitConnected) await appKitDisconnect();
    if (wagmiConnected) wagmiDisconnect();
  }, [appKitConnected, appKitDisconnect, wagmiConnected, wagmiDisconnect]);
  return {
    evm: {
      chain: "evm",
      address: evmAddress,
      connected: !!evmAddress,
      connect,
      disconnect
    },
    solana: {
      chain: "solana",
      address: solanaAddress,
      connected: !!solanaAddress,
      connect,
      disconnect
    },
    bitcoin: {
      chain: "bitcoin",
      address: bitcoinAddress,
      connected: !!bitcoinAddress,
      connect,
      disconnect
    }
  };
}

export { useEvmAdapter };
