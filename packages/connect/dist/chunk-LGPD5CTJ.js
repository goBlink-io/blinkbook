import { getChainMeta, formatAddress } from './chunk-DMWT7ABC.js';
import { useStarknetAdapter } from './chunk-RL7K7ZPA.js';
import { useTonAdapter } from './chunk-WOSATPPH.js';
import { useTronAdapter } from './chunk-ZC73WCCE.js';
import { useEvmAdapter } from './chunk-4NNB3BCA.js';
import { useSuiAdapter } from './chunk-26K62SHN.js';
import { useNearAdapter } from './chunk-DCDKWG25.js';
import { useAptosAdapter } from './chunk-6KSLEOJ7.js';
import { __require } from './chunk-YJJ5VYUW.js';
import { createContext, lazy, useContext, useState, useRef, useEffect, useMemo, useCallback, Suspense } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import { mainnet, polygon, optimism, arbitrum, base, bsc, avalanche, gnosis, sepolia } from 'wagmi/chains';
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks';
import { SuiClientProvider, WalletProvider, useWallets, useConnectWallet } from '@mysten/dapp-kit';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { InjectedConnector, StarknetConfig, publicProvider } from '@starknet-react/core';
import { mainnet as mainnet$1 } from '@starknet-react/chains';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { WalletProvider as WalletProvider$1 } from '@tronweb3/tronwallet-adapter-react-hooks';
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapters';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

var BlinkWalletContext = createContext(void 0);
var appKitInitialized = false;
function initAppKit(config) {
  if (appKitInitialized) return;
  appKitInitialized = true;
  const evmChains = [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    bsc,
    avalanche,
    gnosis,
    sepolia,
    ...config.evmChains || []
  ];
  const wagmiAdapter = new WagmiAdapter({ networks: evmChains, projectId: config.projectId });
  const solanaAdapter = new SolanaAdapter({ wallets: [] });
  const metadata = {
    name: config.appName || "BlinkConnect App",
    description: "Multi-chain wallet connection",
    url: config.appUrl || (typeof window !== "undefined" ? window.location.origin : "https://goblink.io"),
    icons: config.appIcon ? [config.appIcon] : ["https://goblink.io/icon.png"]
  };
  createAppKit({
    adapters: [wagmiAdapter, solanaAdapter],
    networks: [
      mainnet,
      polygon,
      optimism,
      arbitrum,
      base,
      bsc,
      sepolia,
      solana,
      solanaTestnet,
      solanaDevnet
    ],
    projectId: config.projectId,
    metadata,
    features: {
      analytics: config.features?.analytics ?? false,
      email: config.features?.socialLogin ?? true,
      socials: ["google", "apple", "discord", "x", "github", "farcaster"]
    },
    themeMode: config.theme === "auto" ? void 0 : config.theme || "light",
    enableWalletConnect: true,
    enableInjected: true,
    enableCoinbase: true
  });
  return wagmiAdapter;
}
var queryClient = new QueryClient();
var suiNetworks = {
  mainnet: { url: "https://fullnode.mainnet.sui.io:443", network: "mainnet" },
  testnet: { url: "https://fullnode.testnet.sui.io:443", network: "testnet" },
  devnet: { url: "https://fullnode.devnet.sui.io:443", network: "devnet" }
};
var starknetConnectors = [
  new InjectedConnector({ options: { id: "argentX" } }),
  new InjectedConnector({ options: { id: "braavos" } })
];
var tronAdapters = [new TronLinkAdapter()];
function ProviderStack({ config, wagmiAdapter, children }) {
  const suiNetwork = config.suiNetwork || "mainnet";
  const tonManifestUrl = config.tonManifestUrl || (typeof window !== "undefined" ? `${window.location.origin}/tonconnect-manifest.json` : "https://goblink.io/tonconnect-manifest.json");
  const enabledChains = config.chains;
  const isEnabled = (chain) => !enabledChains || enabledChains.includes(chain);
  let tree = /* @__PURE__ */ jsx(Fragment, { children });
  if (isEnabled("tron")) {
    tree = /* @__PURE__ */ jsx(WalletProvider$1, { adapters: tronAdapters, autoConnect: false, children: tree });
  }
  if (isEnabled("ton")) {
    tree = /* @__PURE__ */ jsx(TonConnectUIProvider, { manifestUrl: tonManifestUrl, children: tree });
  }
  if (isEnabled("starknet")) {
    tree = /* @__PURE__ */ jsx(
      StarknetConfig,
      {
        chains: [mainnet$1],
        provider: publicProvider(),
        connectors: starknetConnectors,
        children: tree
      }
    );
  }
  if (isEnabled("aptos")) {
    tree = /* @__PURE__ */ jsx(AptosWalletAdapterProvider, { autoConnect: false, children: tree });
  }
  if (isEnabled("sui")) {
    tree = /* @__PURE__ */ jsx(SuiClientProvider, { networks: suiNetworks, defaultNetwork: suiNetwork, children: /* @__PURE__ */ jsx(WalletProvider, { children: tree }) });
  }
  return /* @__PURE__ */ jsx(WagmiProvider, { config: wagmiAdapter.wagmiConfig, children: /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: tree }) });
}
function UnifiedWalletLayer({ config, children }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const enabledChains = config.chains;
  const isEnabled = (chain) => !enabledChains || enabledChains.includes(chain);
  const evmResult = useEvmAdapter();
  const suiResult = useSuiAdapter();
  const nearResult = useNearAdapter({ networkId: config.nearNetwork });
  const aptosResult = useAptosAdapter();
  const starknetResult = useStarknetAdapter();
  const tonResult = useTonAdapter();
  const tronResult = useTronAdapter();
  const adapters = useMemo(
    () => ({
      evm: evmResult.evm,
      solana: evmResult.solana,
      bitcoin: evmResult.bitcoin,
      sui: suiResult,
      near: nearResult,
      aptos: aptosResult,
      starknet: starknetResult,
      ton: tonResult,
      tron: tronResult
    }),
    [evmResult, suiResult, nearResult, aptosResult, starknetResult, tonResult, tronResult]
  );
  const connectedWallets = useMemo(() => {
    const wallets = [];
    for (const [chain, adapter] of Object.entries(adapters)) {
      if (adapter.connected && adapter.address && isEnabled(chain)) {
        wallets.push({ chain, address: adapter.address });
      }
    }
    return wallets;
  }, [adapters]);
  const getAddressForChain = useCallback(
    (chain) => adapters[chain]?.address ?? null,
    [adapters]
  );
  const isChainConnected = useCallback(
    (chain) => !!adapters[chain]?.connected,
    [adapters]
  );
  const connect = useCallback(
    async (chain) => {
      if (chain && adapters[chain]) {
        await adapters[chain].connect();
      } else {
        setIsModalOpen(true);
      }
    },
    [adapters]
  );
  const disconnect = useCallback(
    async (chain) => {
      if (chain && adapters[chain]) {
        await adapters[chain].disconnect();
      } else {
        for (const adapter of Object.values(adapters)) {
          if (adapter.connected) {
            try {
              await adapter.disconnect();
            } catch {
            }
          }
        }
      }
    },
    [adapters]
  );
  const disconnectAll = useCallback(async () => {
    for (const adapter of Object.values(adapters)) {
      if (adapter.connected) {
        try {
          await adapter.disconnect();
        } catch {
        }
      }
    }
  }, [adapters]);
  const primaryWallet = connectedWallets[0] ?? null;
  const value = useMemo(
    () => ({
      connectedWallets,
      getAddressForChain,
      isChainConnected,
      isConnected: connectedWallets.length > 0,
      address: primaryWallet?.address ?? null,
      chain: primaryWallet?.chain ?? null,
      isModalOpen,
      openModal: () => setIsModalOpen(true),
      closeModal: () => setIsModalOpen(false),
      connect,
      disconnect,
      disconnectAll,
      adapters,
      config
    }),
    [connectedWallets, isModalOpen, adapters, config]
  );
  return /* @__PURE__ */ jsxs(BlinkWalletContext.Provider, { value, children: [
    children,
    isModalOpen && /* @__PURE__ */ jsx(ConnectModalPortal, {})
  ] });
}
var LazyConnectModal = lazy(
  () => import('./ConnectModal-DSZXMQE6.js').then((m) => ({ default: m.ConnectModal }))
);
function ConnectModalPortal() {
  return /* @__PURE__ */ jsx(Suspense, { fallback: null, children: /* @__PURE__ */ jsx(LazyConnectModal, {}) });
}
var cachedWagmiAdapter = null;
function BlinkConnectProvider({ config, children }) {
  if (!cachedWagmiAdapter) {
    const adapter = initAppKit(config);
    if (adapter) cachedWagmiAdapter = adapter;
  }
  if (!cachedWagmiAdapter) {
    const evmChains = [mainnet, polygon, optimism, arbitrum, base, bsc, avalanche, gnosis, sepolia];
    cachedWagmiAdapter = new WagmiAdapter({ networks: evmChains, projectId: config.projectId });
  }
  return /* @__PURE__ */ jsx(ProviderStack, { config, wagmiAdapter: cachedWagmiAdapter, children: /* @__PURE__ */ jsx(UnifiedWalletLayer, { config, children }) });
}
function useBlinkWalletContext() {
  const ctx = useContext(BlinkWalletContext);
  if (!ctx) {
    throw new Error("useBlinkWalletContext must be used within <BlinkConnectProvider>");
  }
  return ctx;
}
var useStarknetConnectHook = null;
try {
  const starknet = __require("@starknet-react/core");
  useStarknetConnectHook = starknet.useConnect;
} catch {
}
var ALL_CHAINS = [
  { id: "evm", name: "EVM Chains", description: "Ethereum, Base, Arbitrum, BNB +10 more", gradient: "linear-gradient(135deg, #3b82f6, #8b5cf6)" },
  { id: "solana", name: "Solana", description: "Fast & low-cost transactions", gradient: "linear-gradient(135deg, #8b5cf6, #ec4899)" },
  { id: "bitcoin", name: "Bitcoin", description: "Digital gold standard", gradient: "linear-gradient(135deg, #f97316, #eab308)" },
  { id: "sui", name: "Sui", description: "Next-gen Move blockchain", gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)" },
  { id: "near", name: "NEAR", description: "Simple, secure & scalable", gradient: "linear-gradient(135deg, #22c55e, #14b8a6)" },
  { id: "aptos", name: "Aptos", description: "Safe & scalable Layer 1", gradient: "linear-gradient(135deg, #14b8a6, #22c55e)" },
  { id: "starknet", name: "Starknet", description: "ZK-rollup on Ethereum", gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)" },
  { id: "ton", name: "TON", description: "The Open Network", gradient: "linear-gradient(135deg, #0ea5e9, #3b82f6)" },
  { id: "tron", name: "Tron", description: "Decentralized internet", gradient: "linear-gradient(135deg, #ef4444, #f43f5e)" }
];
function ConnectModal({ chains, theme, accentColor, logo, className }) {
  const ctx = useBlinkWalletContext();
  const resolvedTheme = theme || ctx.config.theme || "dark";
  const isDark = resolvedTheme === "dark";
  const [selectedChain, setSelectedChain] = useState(null);
  const previousSuiRef = useRef(ctx.isChainConnected("sui"));
  const visibleChains = ALL_CHAINS.filter((c) => {
    if (chains && !chains.includes(c.id)) return false;
    if (ctx.config.chains && !ctx.config.chains.includes(c.id)) return false;
    return true;
  });
  useEffect(() => {
    const nowConnected = ctx.isChainConnected("sui");
    if (!previousSuiRef.current && nowConnected && selectedChain === "sui") {
      setTimeout(() => {
        ctx.closeModal();
        setSelectedChain(null);
      }, 400);
    }
    previousSuiRef.current = nowConnected;
  }, [ctx.isChainConnected("sui"), selectedChain]);
  useEffect(() => {
    if (!ctx.isModalOpen) setSelectedChain(null);
  }, [ctx.isModalOpen]);
  if (!ctx.isModalOpen) return null;
  const handleConnect = async (chain) => {
    try {
      if (chain === "evm" || chain === "solana" || chain === "bitcoin") {
        ctx.closeModal();
        await ctx.connect(chain);
        return;
      }
      await ctx.connect(chain);
    } catch (e) {
      console.error(`[BlinkConnect] Failed to connect ${chain}:`, e);
    }
  };
  const handleBack = () => setSelectedChain(null);
  const colors = {
    bg: isDark ? "#09090b" : "#ffffff",
    bgSecondary: isDark ? "#18181b" : "#f4f4f5",
    border: isDark ? "#27272a" : "#e4e4e7",
    text: isDark ? "#fafafa" : "#09090b",
    textSecondary: isDark ? "#a1a1aa" : "#71717a",
    textMuted: isDark ? "#71717a" : "#a1a1aa",
    accent: accentColor || "#3b82f6",
    connectedBg: isDark ? "rgba(34, 197, 94, 0.1)" : "rgba(34, 197, 94, 0.05)",
    connectedBorder: isDark ? "#166534" : "#bbf7d0",
    connectedText: isDark ? "#4ade80" : "#16a34a",
    dangerBg: isDark ? "rgba(239, 68, 68, 0.15)" : "#fee2e2",
    dangerText: isDark ? "#f87171" : "#dc2626",
    hoverBg: isDark ? "#27272a" : "#f4f4f5"
  };
  const overlayStyle = {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px"
  };
  const backdropStyle = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(4px)"
  };
  const modalStyle = {
    position: "relative",
    backgroundColor: colors.bg,
    borderRadius: "16px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
    maxWidth: "420px",
    width: "100%",
    padding: "24px",
    maxHeight: "90vh",
    overflowY: "auto",
    border: `1px solid ${colors.border}`
  };
  const renderChainList = () => /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: "8px" }, children: visibleChains.map((chain) => {
    const connected = ctx.isChainConnected(chain.id);
    const addr = ctx.getAddressForChain(chain.id);
    const meta = getChainMeta(chain.id);
    return /* @__PURE__ */ jsxs(
      "div",
      {
        onClick: connected ? void 0 : () => setSelectedChain(chain.id),
        role: connected ? void 0 : "button",
        style: {
          padding: "14px",
          borderRadius: "12px",
          border: `2px solid ${connected ? colors.connectedBorder : colors.border}`,
          backgroundColor: connected ? colors.connectedBg : "transparent",
          cursor: connected ? "default" : "pointer",
          transition: "all 0.15s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        },
        onMouseEnter: (e) => {
          if (!connected) {
            e.currentTarget.style.backgroundColor = colors.hoverBg;
            e.currentTarget.style.borderColor = isDark ? "#3f3f46" : "#d4d4d8";
          }
        },
        onMouseLeave: (e) => {
          if (!connected) {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.borderColor = colors.border;
          }
        },
        children: [
          /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "12px" }, children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                style: {
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background: chain.gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "14px",
                  flexShrink: 0
                },
                children: meta?.symbol?.[0] || chain.name[0]
              }
            ),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { style: { fontWeight: 600, fontSize: "14px", color: colors.text }, children: chain.name }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: "12px", color: connected ? colors.connectedText : colors.textSecondary }, children: connected && addr ? formatAddress(addr) : chain.description })
            ] })
          ] }),
          connected ? /* @__PURE__ */ jsx(
            "button",
            {
              onClick: (e) => {
                e.stopPropagation();
                ctx.disconnect(chain.id);
              },
              style: {
                padding: "4px 10px",
                fontSize: "12px",
                borderRadius: "8px",
                backgroundColor: colors.dangerBg,
                color: colors.dangerText,
                border: "none",
                cursor: "pointer",
                fontWeight: 500
              },
              children: "Disconnect"
            }
          ) : /* @__PURE__ */ jsx("span", { style: { color: colors.textMuted, fontSize: "14px" }, children: "\u2192" })
        ]
      },
      chain.id
    );
  }) });
  const renderChainConnect = () => {
    if (!selectedChain) return null;
    const chain = ALL_CHAINS.find((c) => c.id === selectedChain);
    if (selectedChain === "sui") {
      return /* @__PURE__ */ jsx(SuiConnectView, { colors, onClose: ctx.closeModal });
    }
    if (selectedChain === "starknet" && useStarknetConnectHook) {
      return /* @__PURE__ */ jsx(StarknetConnectView, { colors, onClose: ctx.closeModal });
    }
    return /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { style: { fontSize: "14px", color: colors.textSecondary, marginBottom: "16px" }, children: chain.description }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => handleConnect(selectedChain),
          style: {
            width: "100%",
            padding: "12px",
            borderRadius: "12px",
            border: "none",
            backgroundColor: colors.accent,
            color: "white",
            fontWeight: 600,
            fontSize: "14px",
            cursor: "pointer"
          },
          children: "Connect Wallet"
        }
      ),
      (selectedChain === "evm" || selectedChain === "solana" || selectedChain === "bitcoin") && /* @__PURE__ */ jsx("p", { style: { fontSize: "12px", color: colors.textMuted, textAlign: "center", marginTop: "12px" }, children: "Powered by ReOwn AppKit \u2014 350+ wallets" })
    ] });
  };
  return /* @__PURE__ */ jsxs("div", { style: overlayStyle, className, children: [
    /* @__PURE__ */ jsx("div", { style: backdropStyle, onClick: ctx.closeModal }),
    /* @__PURE__ */ jsxs("div", { style: modalStyle, children: [
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }, children: [
        /* @__PURE__ */ jsxs("div", { children: [
          logo && /* @__PURE__ */ jsx(
            "img",
            {
              src: logo,
              alt: "",
              style: { width: "24px", height: "24px", borderRadius: "6px", marginBottom: "4px" }
            }
          ),
          /* @__PURE__ */ jsx("h2", { style: { fontSize: "20px", fontWeight: 700, color: colors.text, margin: 0 }, children: selectedChain ? "Connect Wallet" : "Select Chain" }),
          /* @__PURE__ */ jsx("p", { style: { fontSize: "14px", color: colors.textSecondary, margin: "2px 0 0 0" }, children: selectedChain ? ALL_CHAINS.find((c) => c.id === selectedChain)?.description : "Choose a blockchain to connect" })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: selectedChain ? handleBack : ctx.closeModal,
            style: {
              padding: "8px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              color: colors.textSecondary,
              fontSize: "18px"
            },
            children: selectedChain ? "\u2190" : "\u2715"
          }
        )
      ] }),
      !selectedChain ? renderChainList() : renderChainConnect(),
      /* @__PURE__ */ jsx(
        "div",
        {
          style: {
            marginTop: "20px",
            paddingTop: "12px",
            borderTop: `1px solid ${colors.border}`,
            textAlign: "center"
          },
          children: /* @__PURE__ */ jsx("p", { style: { fontSize: "12px", color: colors.textMuted, margin: 0 }, children: "Connect multiple chains \u2014 they all stay connected simultaneously" })
        }
      )
    ] })
  ] });
}
function SuiConnectView({ colors, onClose }) {
  const wallets = useWallets();
  const { mutate: connectWallet, isPending } = useConnectWallet();
  const [error, setError] = useState(null);
  const [connecting, setConnecting] = useState(null);
  const handleConnect = (wallet) => {
    setError(null);
    setConnecting(wallet.name);
    console.log("[BlinkConnect] Connecting Sui wallet:", wallet.name, wallet);
    connectWallet(
      { wallet },
      {
        onSuccess: () => {
          console.log("[BlinkConnect] Sui wallet connected:", wallet.name);
          setTimeout(onClose, 400);
        },
        onError: (err) => {
          console.error("[BlinkConnect] Sui wallet connect error:", err);
          setError(err?.message || "Connection failed");
          setConnecting(null);
        }
      }
    );
  };
  return /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "8px" }, children: [
    /* @__PURE__ */ jsx("p", { style: { fontSize: "14px", color: colors.textSecondary, marginBottom: "8px" }, children: "Select a Sui wallet" }),
    error && /* @__PURE__ */ jsx("p", { style: { fontSize: "13px", color: "#ef4444", padding: "8px 12px", backgroundColor: "rgba(239,68,68,0.1)", borderRadius: "8px" }, children: error }),
    wallets.length === 0 && /* @__PURE__ */ jsx("p", { style: { fontSize: "13px", color: colors.textMuted, textAlign: "center", padding: "20px 0" }, children: "No Sui wallets detected. Install a Sui wallet extension." }),
    wallets.map((wallet) => /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => handleConnect(wallet),
        disabled: isPending,
        style: {
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "12px 16px",
          borderRadius: "10px",
          border: `1px solid ${colors.border}`,
          backgroundColor: connecting === wallet.name ? (colors.accent || "#3b82f6") + "22" : colors.cardBg,
          color: colors.text,
          cursor: isPending ? "wait" : "pointer",
          fontSize: "14px",
          fontWeight: 500,
          fontFamily: "inherit",
          transition: "background-color 0.15s",
          width: "100%",
          opacity: isPending && connecting !== wallet.name ? 0.5 : 1
        },
        children: [
          wallet.icon && /* @__PURE__ */ jsx(
            "img",
            {
              src: wallet.icon,
              alt: wallet.name,
              style: { width: "28px", height: "28px", borderRadius: "6px" }
            }
          ),
          /* @__PURE__ */ jsx("span", { children: connecting === wallet.name && isPending ? `Connecting ${wallet.name}...` : wallet.name })
        ]
      },
      wallet.name
    ))
  ] });
}
function StarknetConnectView({ colors, onClose }) {
  if (!useStarknetConnectHook) return null;
  const { connect, connectors } = useStarknetConnectHook();
  const walletNames = ["Argent X", "Braavos"];
  const walletEmojis = ["\u{1F98A}", "\u{1F6E1}\uFE0F"];
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("p", { style: { fontSize: "14px", color: colors.textSecondary, marginBottom: "12px" }, children: "Connect your Starknet wallet" }),
    connectors.map((connector, i) => /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => {
          connect({ connector });
          onClose();
        },
        style: {
          width: "100%",
          padding: "12px 16px",
          borderRadius: "12px",
          border: `2px solid ${colors.border}`,
          backgroundColor: "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "8px",
          transition: "all 0.15s ease"
        },
        onMouseEnter: (e) => {
          e.currentTarget.style.backgroundColor = colors.hoverBg;
          e.currentTarget.style.borderColor = colors.accent;
        },
        onMouseLeave: (e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.borderColor = colors.border;
        },
        children: [
          /* @__PURE__ */ jsx("span", { style: { fontSize: "20px" }, children: walletEmojis[i] || "\u{1F4B3}" }),
          /* @__PURE__ */ jsx("span", { style: { fontWeight: 600, color: colors.text }, children: walletNames[i] || `Wallet ${i + 1}` })
        ]
      },
      i
    ))
  ] });
}

export { BlinkConnectProvider, ConnectModal, useBlinkWalletContext };
