'use strict';

var react = require('react');
var tronwalletAdapterReactHooks = require('@tronweb3/tronwallet-adapter-react-hooks');

function useTronAdapter() {
  const {
    address,
    connected,
    disconnect: tronDisconnect,
    select,
    wallets,
    connect: tronConnect
  } = tronwalletAdapterReactHooks.useWallet();
  const connect = react.useCallback(async () => {
    if (wallets?.length) {
      select(wallets[0].adapter.name);
      await tronConnect();
    }
  }, [select, wallets, tronConnect]);
  const disconnect = react.useCallback(async () => {
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

exports.useTronAdapter = useTronAdapter;
