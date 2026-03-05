'use strict';

var react = require('react');
var dappKit = require('@mysten/dapp-kit');

function useSuiAdapter() {
  const suiAccount = dappKit.useCurrentAccount();
  const { mutate: suiDisconnect } = dappKit.useDisconnectWallet();
  const connect = react.useCallback(async () => {
  }, []);
  const disconnect = react.useCallback(async () => {
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

exports.useSuiAdapter = useSuiAdapter;
