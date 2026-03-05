'use strict';

var chunkG67W7GOI_cjs = require('../chunk-G67W7GOI.cjs');
var chunkEXZBP2C6_cjs = require('../chunk-EXZBP2C6.cjs');
require('../chunk-YOFXR6K6.cjs');
require('../chunk-JTAEOBYC.cjs');
require('../chunk-O3CQTKTL.cjs');
require('../chunk-DLTJ74N5.cjs');
require('../chunk-WODRPRHJ.cjs');
require('../chunk-JFU7VAGT.cjs');
require('../chunk-POYEVZNA.cjs');
require('../chunk-OOTTOONG.cjs');
var react = require('react');
var jsxRuntime = require('react/jsx-runtime');

function useWallet() {
  const ctx = chunkG67W7GOI_cjs.useBlinkWalletContext();
  const switchChain = react.useCallback(
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
  const ctx = chunkG67W7GOI_cjs.useBlinkWalletContext();
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
  const ctx = chunkG67W7GOI_cjs.useBlinkWalletContext();
  const targetChain = chain || ctx.chain;
  const [balance, setBalance] = react.useState(null);
  const [symbol, setSymbol] = react.useState(null);
  const [isLoading, setIsLoading] = react.useState(false);
  const [error, setError] = react.useState(null);
  const fetchBalance = react.useCallback(async () => {
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
  react.useEffect(() => {
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
  const ctx = chunkG67W7GOI_cjs.useBlinkWalletContext();
  const signMessage = react.useCallback(
    async (message, chain) => {
      const targetChain = chain || ctx.chain;
      if (!targetChain) throw new Error("No wallet connected");
      throw new Error(
        `signMessage not yet implemented for ${targetChain}. Use the chain-specific SDK directly.`
      );
    },
    [ctx.chain]
  );
  const signTransaction = react.useCallback(
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
  const ctx = chunkG67W7GOI_cjs.useBlinkWalletContext();
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
    const meta = chunkEXZBP2C6_cjs.getChainMeta(ctx.chain);
    return /* @__PURE__ */ jsxRuntime.jsxs("button", { onClick: handleClick, style: buttonStyle, className, children: [
      showChainIcon && meta && /* @__PURE__ */ jsxRuntime.jsx(
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
      /* @__PURE__ */ jsxRuntime.jsx("span", { children: chunkEXZBP2C6_cjs.formatAddress(ctx.address) }),
      ctx.connectedWallets.length > 1 && /* @__PURE__ */ jsxRuntime.jsxs(
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
  return /* @__PURE__ */ jsxRuntime.jsx("button", { onClick: handleClick, style: buttonStyle, className, children: label });
}

Object.defineProperty(exports, "BlinkConnectProvider", {
  enumerable: true,
  get: function () { return chunkG67W7GOI_cjs.BlinkConnectProvider; }
});
Object.defineProperty(exports, "ConnectModal", {
  enumerable: true,
  get: function () { return chunkG67W7GOI_cjs.ConnectModal; }
});
Object.defineProperty(exports, "useBlinkWalletContext", {
  enumerable: true,
  get: function () { return chunkG67W7GOI_cjs.useBlinkWalletContext; }
});
exports.ConnectButton = ConnectButton;
exports.useBalance = useBalance;
exports.useConnect = useConnect;
exports.useSign = useSign;
exports.useWallet = useWallet;
