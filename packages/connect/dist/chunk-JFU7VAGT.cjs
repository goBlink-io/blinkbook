'use strict';

var react = require('react');
var nearConnect = require('@hot-labs/near-connect');

function useNearAdapter(options) {
  const [address, setAddress] = react.useState(null);
  const [connector, setConnector] = react.useState(null);
  react.useEffect(() => {
    if (typeof window === "undefined") return;
    const nc = new nearConnect.NearConnector({
      networkId: options?.networkId || "mainnet",
      network: options?.networkId || "mainnet",
      logger: { log: console.log, error: console.error }
    });
    setConnector(nc);
    const checkConnection = async () => {
      try {
        const wallet = await nc.wallet().catch(() => null);
        if (!wallet) return;
        const accounts = await wallet.getAccounts?.();
        if (accounts?.length > 0) {
          const accountId = accounts[0].accountId || accounts[0];
          if (typeof accountId === "string") setAddress(accountId);
        }
      } catch {
      }
    };
    const timer = setTimeout(checkConnection, 500);
    const onSignIn = async () => {
      try {
        const wallet = await nc.wallet().catch(() => null);
        if (!wallet) return;
        const accounts = await wallet.getAccounts?.();
        if (accounts?.length > 0) {
          const accountId = accounts[0].accountId || accounts[0];
          if (typeof accountId === "string") setAddress(accountId);
        }
      } catch {
      }
    };
    const onSignOut = () => setAddress(null);
    nc.on("wallet:signIn", onSignIn);
    nc.on("wallet:signOut", onSignOut);
    return () => {
      clearTimeout(timer);
      nc.off("wallet:signIn", onSignIn);
      nc.off("wallet:signOut", onSignOut);
    };
  }, [options?.networkId]);
  const connect = react.useCallback(async () => {
    if (!connector) {
      console.error("[BlinkConnect] NEAR connector not ready");
      return;
    }
    console.log("[BlinkConnect] Connecting NEAR wallet...");
    const wallet = await connector.connect();
    const accounts = await wallet.getAccounts?.();
    if (accounts?.length > 0) {
      const accountId = accounts[0].accountId || accounts[0];
      if (typeof accountId === "string") setAddress(accountId);
    }
  }, [connector]);
  const disconnect = react.useCallback(async () => {
    if (!connector) return;
    await connector.disconnect();
    setAddress(null);
  }, [connector]);
  return {
    chain: "near",
    address,
    connected: !!address,
    connect,
    disconnect
  };
}

exports.useNearAdapter = useNearAdapter;
