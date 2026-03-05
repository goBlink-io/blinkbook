'use strict';

// src/core/events.ts
var WalletEventEmitter = class {
  constructor() {
    this.listeners = /* @__PURE__ */ new Map();
  }
  on(event, listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, /* @__PURE__ */ new Set());
    }
    this.listeners.get(event).add(listener);
  }
  off(event, listener) {
    this.listeners.get(event)?.delete(listener);
  }
  emit(event, data) {
    this.listeners.get(event)?.forEach((listener) => {
      try {
        listener(data);
      } catch (err) {
        console.error(`[BlinkConnect] Event listener error (${event}):`, err);
      }
    });
  }
  removeAllListeners(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
};
var globalEvents = new WalletEventEmitter();

// src/core/store.ts
function createWalletStore(initialState) {
  let state = {
    wallets: [],
    isModalOpen: false,
    ...initialState
  };
  const subscribers = /* @__PURE__ */ new Set();
  function getState() {
    return state;
  }
  function setState(partial) {
    state = { ...state, ...partial };
    subscribers.forEach((sub) => sub());
  }
  function subscribe(listener) {
    subscribers.add(listener);
    return () => subscribers.delete(listener);
  }
  function setWallets(wallets) {
    setState({ wallets });
  }
  function getAddress(chain) {
    return state.wallets.find((w) => w.chain === chain)?.address ?? null;
  }
  function isChainConnected(chain) {
    return state.wallets.some((w) => w.chain === chain);
  }
  function openModal() {
    setState({ isModalOpen: true });
  }
  function closeModal() {
    setState({ isModalOpen: false });
  }
  return {
    getState,
    setState,
    subscribe,
    setWallets,
    getAddress,
    isChainConnected,
    openModal,
    closeModal
  };
}

exports.WalletEventEmitter = WalletEventEmitter;
exports.createWalletStore = createWalletStore;
exports.globalEvents = globalEvents;
