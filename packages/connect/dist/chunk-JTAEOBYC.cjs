'use strict';

var react = require('react');
var uiReact = require('@tonconnect/ui-react');

function useTonAdapter() {
  const [tonConnectUI] = uiReact.useTonConnectUI();
  const tonAddr = uiReact.useTonAddress();
  const connect = react.useCallback(async () => {
    await tonConnectUI.openModal();
  }, [tonConnectUI]);
  const disconnect = react.useCallback(async () => {
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

exports.useTonAdapter = useTonAdapter;
