export { formatAddress, getAllChainMeta, getChainMeta, getExplorerAddressUrl, getExplorerTxUrl, truncateAddress, validateAddress } from './chunk-DMWT7ABC.js';
export { WalletEventEmitter, createWalletStore, globalEvents } from './chunk-AMQFG4ZU.js';
import './chunk-YJJ5VYUW.js';

// src/utils/storage.ts
var STORAGE_KEY = "@goblink/connect:session";
function persistSession(wallets) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wallets));
  } catch {
  }
}
function loadSession() {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function clearSession() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
  }
}

export { clearSession, loadSession, persistSession };
