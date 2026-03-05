'use strict';

var chunkEXZBP2C6_cjs = require('./chunk-EXZBP2C6.cjs');
var chunkMLRBZKI6_cjs = require('./chunk-MLRBZKI6.cjs');
require('./chunk-OOTTOONG.cjs');

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

Object.defineProperty(exports, "formatAddress", {
  enumerable: true,
  get: function () { return chunkEXZBP2C6_cjs.formatAddress; }
});
Object.defineProperty(exports, "getAllChainMeta", {
  enumerable: true,
  get: function () { return chunkEXZBP2C6_cjs.getAllChainMeta; }
});
Object.defineProperty(exports, "getChainMeta", {
  enumerable: true,
  get: function () { return chunkEXZBP2C6_cjs.getChainMeta; }
});
Object.defineProperty(exports, "getExplorerAddressUrl", {
  enumerable: true,
  get: function () { return chunkEXZBP2C6_cjs.getExplorerAddressUrl; }
});
Object.defineProperty(exports, "getExplorerTxUrl", {
  enumerable: true,
  get: function () { return chunkEXZBP2C6_cjs.getExplorerTxUrl; }
});
Object.defineProperty(exports, "truncateAddress", {
  enumerable: true,
  get: function () { return chunkEXZBP2C6_cjs.truncateAddress; }
});
Object.defineProperty(exports, "validateAddress", {
  enumerable: true,
  get: function () { return chunkEXZBP2C6_cjs.validateAddress; }
});
Object.defineProperty(exports, "WalletEventEmitter", {
  enumerable: true,
  get: function () { return chunkMLRBZKI6_cjs.WalletEventEmitter; }
});
Object.defineProperty(exports, "createWalletStore", {
  enumerable: true,
  get: function () { return chunkMLRBZKI6_cjs.createWalletStore; }
});
Object.defineProperty(exports, "globalEvents", {
  enumerable: true,
  get: function () { return chunkMLRBZKI6_cjs.globalEvents; }
});
exports.clearSession = clearSession;
exports.loadSession = loadSession;
exports.persistSession = persistSession;
