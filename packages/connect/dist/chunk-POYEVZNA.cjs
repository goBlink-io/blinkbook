'use strict';

var react = require('react');
var walletAdapterReact = require('@aptos-labs/wallet-adapter-react');

function useAptosAdapter() {
  const {
    account,
    connected,
    disconnect: aptosDisconnect,
    connect: aptosConnect,
    wallets
  } = walletAdapterReact.useWallet();
  const connect = react.useCallback(async () => {
    if (wallets?.length) {
      await aptosConnect(wallets[0].name || wallets[0]);
    }
  }, [aptosConnect, wallets]);
  const disconnect = react.useCallback(async () => {
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

exports.useAptosAdapter = useAptosAdapter;
