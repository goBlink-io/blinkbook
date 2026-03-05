'use strict';

// src/utils/address.ts
function formatAddress(address, chars = 4) {
  if (!address) return "";
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars + 2)}\u2026${address.slice(-chars)}`;
}
function truncateAddress(address) {
  return formatAddress(address, 4);
}
function validateAddress(chain, address) {
  if (!address || typeof address !== "string") return false;
  switch (chain) {
    case "evm":
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    case "solana":
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    case "bitcoin":
      return /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address);
    case "sui":
      return /^0x[a-fA-F0-9]{64}$/.test(address);
    case "near":
      return /^[a-z0-9_-]+(\.[a-z0-9_-]+)*\.(near|testnet)$/.test(address) || /^[a-fA-F0-9]{64}$/.test(address);
    case "aptos":
      return /^0x[a-fA-F0-9]{1,64}$/.test(address);
    case "starknet":
      return /^0x[a-fA-F0-9]{1,64}$/.test(address);
    case "ton":
      return address.length >= 32;
    case "tron":
      return /^T[a-zA-Z0-9]{33}$/.test(address);
    default:
      return address.length > 0;
  }
}

// src/utils/chains.ts
var CHAIN_METADATA = {
  evm: {
    id: "evm",
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
    explorer: "https://etherscan.io",
    color: "#627eea"
  },
  solana: {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    decimals: 9,
    explorer: "https://solscan.io",
    color: "#9945ff"
  },
  bitcoin: {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    decimals: 8,
    explorer: "https://mempool.space",
    color: "#f7931a"
  },
  sui: {
    id: "sui",
    name: "Sui",
    symbol: "SUI",
    decimals: 9,
    explorer: "https://suiscan.xyz",
    color: "#4da2ff"
  },
  near: {
    id: "near",
    name: "NEAR",
    symbol: "NEAR",
    decimals: 24,
    explorer: "https://nearblocks.io",
    color: "#00ec97"
  },
  aptos: {
    id: "aptos",
    name: "Aptos",
    symbol: "APT",
    decimals: 8,
    explorer: "https://aptoscan.com",
    color: "#2dd8a7"
  },
  starknet: {
    id: "starknet",
    name: "Starknet",
    symbol: "STRK",
    decimals: 18,
    explorer: "https://starkscan.co",
    color: "#29296e"
  },
  ton: {
    id: "ton",
    name: "TON",
    symbol: "TON",
    decimals: 9,
    explorer: "https://tonscan.org",
    color: "#0098ea"
  },
  tron: {
    id: "tron",
    name: "Tron",
    symbol: "TRX",
    decimals: 6,
    explorer: "https://tronscan.org",
    color: "#eb0029"
  }
};
function getChainMeta(chain) {
  return CHAIN_METADATA[chain] ?? null;
}
function getAllChainMeta() {
  return Object.values(CHAIN_METADATA);
}
function getExplorerTxUrl(chain, txHash) {
  const meta = CHAIN_METADATA[chain];
  if (!meta) return "";
  switch (chain) {
    case "evm":
      return `${meta.explorer}/tx/${txHash}`;
    case "solana":
      return `${meta.explorer}/tx/${txHash}`;
    case "bitcoin":
      return `${meta.explorer}/tx/${txHash}`;
    case "sui":
      return `${meta.explorer}/txblock/${txHash}`;
    case "near":
      return `${meta.explorer}/txns/${txHash}`;
    case "aptos":
      return `${meta.explorer}/transaction/${txHash}`;
    case "starknet":
      return `${meta.explorer}/tx/${txHash}`;
    case "ton":
      return `${meta.explorer}/transaction/${txHash}`;
    case "tron":
      return `${meta.explorer}/#/transaction/${txHash}`;
    default:
      return "";
  }
}
function getExplorerAddressUrl(chain, address) {
  const meta = CHAIN_METADATA[chain];
  if (!meta) return "";
  switch (chain) {
    case "evm":
      return `${meta.explorer}/address/${address}`;
    case "solana":
      return `${meta.explorer}/account/${address}`;
    case "bitcoin":
      return `${meta.explorer}/address/${address}`;
    case "sui":
      return `${meta.explorer}/account/${address}`;
    case "near":
      return `${meta.explorer}/address/${address}`;
    case "aptos":
      return `${meta.explorer}/account/${address}`;
    case "starknet":
      return `${meta.explorer}/contract/${address}`;
    case "ton":
      return `${meta.explorer}/address/${address}`;
    case "tron":
      return `${meta.explorer}/#/address/${address}`;
    default:
      return "";
  }
}

exports.formatAddress = formatAddress;
exports.getAllChainMeta = getAllChainMeta;
exports.getChainMeta = getChainMeta;
exports.getExplorerAddressUrl = getExplorerAddressUrl;
exports.getExplorerTxUrl = getExplorerTxUrl;
exports.truncateAddress = truncateAddress;
exports.validateAddress = validateAddress;
