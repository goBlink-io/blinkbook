import { createWalletStore, WalletEventEmitter } from '../chunk-AMQFG4ZU.js';
import '../chunk-YJJ5VYUW.js';

// src/vanilla/client.ts
var BlinkConnect = class {
  constructor(config) {
    this.config = config;
    this.store = createWalletStore();
    this.events = new WalletEventEmitter();
  }
  /** Get all connected wallets */
  getWallets() {
    return this.store.getState().wallets;
  }
  /** Get address for a specific chain */
  getAddress(chain) {
    return this.store.getAddress(chain);
  }
  /** Check if any wallet is connected */
  get isConnected() {
    return this.store.getState().wallets.length > 0;
  }
  /** Check if a specific chain is connected */
  isChainConnected(chain) {
    return this.store.isChainConnected(chain);
  }
  /** Subscribe to state changes */
  subscribe(listener) {
    return this.store.subscribe(listener);
  }
  /** Listen to wallet events */
  on(event, listener) {
    this.events.on(event, listener);
  }
  /** Remove event listener */
  off(event, listener) {
    this.events.off(event, listener);
  }
  /** Update wallets (used internally or for manual state management) */
  setWallets(wallets) {
    const prev = this.store.getState().wallets;
    this.store.setWallets(wallets);
    for (const wallet of wallets) {
      if (!prev.find((w) => w.chain === wallet.chain)) {
        this.events.emit("connect", wallet);
        this.config.onConnect?.(wallet);
      }
    }
    for (const wallet of prev) {
      if (!wallets.find((w) => w.chain === wallet.chain)) {
        this.events.emit("disconnect", wallet.chain);
        this.config.onDisconnect?.(wallet.chain);
      }
    }
  }
  /** Get the config */
  getConfig() {
    return this.config;
  }
  /** Destroy the client and clean up */
  destroy() {
    this.events.removeAllListeners();
  }
};

export { BlinkConnect };
