import { W as WalletEvent, a as WalletEventMap, b as WalletState, C as ConnectedWallet, c as ChainType } from './types-Dgo4Mqar.js';
export { A as AdapterHookResult, B as BlinkConnectConfig, d as ChainAdapter, e as ConnectOptions } from './types-Dgo4Mqar.js';

type Listener<T> = (data: T) => void;
declare class WalletEventEmitter {
    private listeners;
    on<E extends WalletEvent>(event: E, listener: Listener<WalletEventMap[E]>): void;
    off<E extends WalletEvent>(event: E, listener: Listener<WalletEventMap[E]>): void;
    emit<E extends WalletEvent>(event: E, data: WalletEventMap[E]): void;
    removeAllListeners(event?: WalletEvent): void;
}
declare const globalEvents: WalletEventEmitter;

type Subscriber = () => void;
declare function createWalletStore(initialState?: Partial<WalletState>): {
    getState: () => WalletState;
    setState: (partial: Partial<WalletState>) => void;
    subscribe: (listener: Subscriber) => () => void;
    setWallets: (wallets: ConnectedWallet[]) => void;
    getAddress: (chain: ChainType) => string | null;
    isChainConnected: (chain: ChainType) => boolean;
    openModal: () => void;
    closeModal: () => void;
};
type WalletStore = ReturnType<typeof createWalletStore>;

/**
 * Format an address for display — truncates to first/last N characters.
 */
declare function formatAddress(address: string, chars?: number): string;
/**
 * Truncate address to a shorter form (6...4).
 */
declare function truncateAddress(address: string): string;
/**
 * Basic address validation by chain type.
 */
declare function validateAddress(chain: string, address: string): boolean;

interface ChainMeta {
    id: ChainType;
    name: string;
    symbol: string;
    decimals: number;
    explorer: string;
    color: string;
}
/**
 * Get metadata for a chain type.
 */
declare function getChainMeta(chain: ChainType): ChainMeta | null;
/**
 * Get all chain metadata.
 */
declare function getAllChainMeta(): ChainMeta[];
/**
 * Get explorer URL for a transaction on a given chain.
 */
declare function getExplorerTxUrl(chain: ChainType, txHash: string): string;
/**
 * Get explorer URL for an address on a given chain.
 */
declare function getExplorerAddressUrl(chain: ChainType, address: string): string;

/**
 * Persist wallet session to localStorage.
 */
declare function persistSession(wallets: ConnectedWallet[]): void;
/**
 * Load persisted wallet session from localStorage.
 */
declare function loadSession(): ConnectedWallet[];
/**
 * Clear persisted session.
 */
declare function clearSession(): void;

export { type ChainMeta, ChainType, ConnectedWallet, WalletEvent, WalletEventEmitter, WalletEventMap, WalletState, type WalletStore, clearSession, createWalletStore, formatAddress, getAllChainMeta, getChainMeta, getExplorerAddressUrl, getExplorerTxUrl, globalEvents, loadSession, persistSession, truncateAddress, validateAddress };
