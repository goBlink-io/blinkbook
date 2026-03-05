'use strict';

var react = require('react');
var core = require('@starknet-react/core');

function useStarknetAdapter() {
  const { address, isConnected } = core.useAccount();
  const { disconnect: starknetDisconnect } = core.useDisconnect();
  const { connect: starknetConnect, connectors } = core.useConnect();
  const connect = react.useCallback(async () => {
    if (connectors[0]) {
      starknetConnect({ connector: connectors[0] });
    }
  }, [starknetConnect, connectors]);
  const disconnect = react.useCallback(async () => {
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
  const { connect, connectors } = core.useConnect();
  return { connect, connectors };
}

exports.useStarknetAdapter = useStarknetAdapter;
exports.useStarknetConnectors = useStarknetConnectors;
