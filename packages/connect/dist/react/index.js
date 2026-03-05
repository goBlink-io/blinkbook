import { useBlinkWalletContext } from '../chunk-LGPD5CTJ.js';
export { BlinkConnectProvider, ConnectModal, useBlinkWalletContext } from '../chunk-LGPD5CTJ.js';
import { getChainMeta, formatAddress } from '../chunk-DMWT7ABC.js';
import '../chunk-RL7K7ZPA.js';
import '../chunk-WOSATPPH.js';
import '../chunk-ZC73WCCE.js';
import '../chunk-4NNB3BCA.js';
import '../chunk-26K62SHN.js';
import '../chunk-DCDKWG25.js';
import '../chunk-6KSLEOJ7.js';
import '../chunk-YJJ5VYUW.js';
import { useCallback, useState, useEffect } from 'react';
import { jsxs, jsx } from 'react/jsx-runtime';

function useWallet() {
  const ctx = useBlinkWalletContext();
  const switchChain = useCallback(
    async (chain) => {
      if (!ctx.isChainConnected(chain)) {
        await ctx.connect(chain);
      }
    },
    [ctx]
  );
  return {
    wallets: ctx.connectedWallets,
    address: ctx.address,
    chain: ctx.chain,
    isConnected: ctx.isConnected,
    connectedCount: ctx.connectedWallets.length,
    connect: ctx.connect,
    disconnect: ctx.disconnect,
    getAddress: ctx.getAddressForChain,
    isChainConnected: ctx.isChainConnected,
    switchChain
  };
}

// src/react/useConnect.ts
function useConnect() {
  const ctx = useBlinkWalletContext();
  return {
    openModal: ctx.openModal,
    closeModal: ctx.closeModal,
    isModalOpen: ctx.isModalOpen,
    connectChain: async (chain) => ctx.connect(chain),
    disconnectChain: async (chain) => ctx.disconnect(chain),
    disconnectAll: ctx.disconnectAll
  };
}
function useBalance(chain, refreshInterval = 3e4) {
  const ctx = useBlinkWalletContext();
  const targetChain = chain || ctx.chain;
  const [balance, setBalance] = useState(null);
  const [symbol, setSymbol] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fetchBalance = useCallback(async () => {
    if (!targetChain) return;
    const adapter = ctx.adapters[targetChain];
    if (!adapter?.connected || !adapter.address) {
      setBalance(null);
      setSymbol(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      setBalance(null);
      setSymbol(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch balance"));
    } finally {
      setIsLoading(false);
    }
  }, [targetChain, ctx.adapters]);
  useEffect(() => {
    fetchBalance();
    if (refreshInterval > 0) {
      const timer = setInterval(fetchBalance, refreshInterval);
      return () => clearInterval(timer);
    }
  }, [fetchBalance, refreshInterval]);
  return {
    balance,
    symbol,
    isLoading,
    error,
    refetch: fetchBalance
  };
}
function useSign() {
  const ctx = useBlinkWalletContext();
  const signMessage = useCallback(
    async (message, chain) => {
      const targetChain = chain || ctx.chain;
      if (!targetChain) throw new Error("No wallet connected");
      throw new Error(
        `signMessage not yet implemented for ${targetChain}. Use the chain-specific SDK directly.`
      );
    },
    [ctx.chain]
  );
  const signTransaction = useCallback(
    async (tx, chain) => {
      const targetChain = chain || ctx.chain;
      if (!targetChain) throw new Error("No wallet connected");
      throw new Error(
        `signTransaction not yet implemented for ${targetChain}. Use the chain-specific SDK directly.`
      );
    },
    [ctx.chain]
  );
  return { signMessage, signTransaction };
}
function ConnectButton({
  label = "Connect Wallet",
  showChainIcon = true,
  theme,
  className,
  style
}) {
  const ctx = useBlinkWalletContext();
  const resolvedTheme = theme || ctx.config.theme || "dark";
  const isDark = resolvedTheme === "dark";
  const handleClick = () => {
    if (ctx.isConnected) {
      ctx.openModal();
    } else {
      ctx.openModal();
    }
  };
  const buttonStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: ctx.isConnected ? "8px 16px" : "10px 20px",
    borderRadius: "12px",
    border: `1px solid ${isDark ? "#27272a" : "#e4e4e7"}`,
    backgroundColor: ctx.isConnected ? isDark ? "#18181b" : "#f4f4f5" : isDark ? "#3b82f6" : "#2563eb",
    color: ctx.isConnected ? isDark ? "#fafafa" : "#09090b" : "#ffffff",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.15s ease",
    fontFamily: "inherit",
    ...style
  };
  if (ctx.isConnected && ctx.address && ctx.chain) {
    const meta = getChainMeta(ctx.chain);
    return /* @__PURE__ */ jsxs("button", { onClick: handleClick, style: buttonStyle, className, children: [
      showChainIcon && meta && /* @__PURE__ */ jsx(
        "span",
        {
          style: {
            width: "20px",
            height: "20px",
            borderRadius: "6px",
            backgroundColor: meta.color || "#3b82f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
            color: "white",
            fontWeight: 700,
            flexShrink: 0
          },
          children: meta.symbol?.[0] || ctx.chain[0].toUpperCase()
        }
      ),
      /* @__PURE__ */ jsx("span", { children: formatAddress(ctx.address) }),
      ctx.connectedWallets.length > 1 && /* @__PURE__ */ jsxs(
        "span",
        {
          style: {
            backgroundColor: isDark ? "#27272a" : "#e4e4e7",
            borderRadius: "6px",
            padding: "1px 6px",
            fontSize: "11px",
            color: isDark ? "#a1a1aa" : "#71717a"
          },
          children: [
            "+",
            ctx.connectedWallets.length - 1
          ]
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsx("button", { onClick: handleClick, style: buttonStyle, className, children: label });
}

export { ConnectButton, useBalance, useConnect, useSign, useWallet };
