import { B as BlinkConnectConfig, C as ConnectedWallet, c as ChainType, W as WalletEvent, a as WalletEventMap } from '../types-Dgo4Mqar.js';

/**
 * Framework-agnostic BlinkConnect client.
 *
 * For non-React applications (vanilla JS, Vue, Svelte, etc.).
 * Provides the same wallet state management without React hooks.
 *
 * @example
 * ```ts
 * import { BlinkConnect } from '@goblink/connect/vanilla';
 *
 * const client = new BlinkConnect({ projectId: 'xxx' });
 *
 * client.on('connect', (wallet) => {
 *   console.log('Connected:', wallet.chain, wallet.address);
 * });
 *
 * // Get current state
 * const wallets = client.getWallets();
 * ```
 *
 * Note: The vanilla client provides state management and events.
 * Actual wallet connections in non-React apps require additional
 * setup with the underlying wallet SDKs, as most wallet adapters
 * are React-based. See docs for framework-specific guides.
 */
declare class BlinkConnect {
    private config;
    private store;
    private events;
    constructor(config: BlinkConnectConfig);
    /** Get all connected wallets */
    getWallets(): ConnectedWallet[];
    /** Get address for a specific chain */
    getAddress(chain: ChainType): string | null;
    /** Check if any wallet is connected */
    get isConnected(): boolean;
    /** Check if a specific chain is connected */
    isChainConnected(chain: ChainType): boolean;
    /** Subscribe to state changes */
    subscribe(listener: () => void): () => void;
    /** Listen to wallet events */
    on<E extends WalletEvent>(event: E, listener: (data: WalletEventMap[E]) => void): void;
    /** Remove event listener */
    off<E extends WalletEvent>(event: E, listener: (data: WalletEventMap[E]) => void): void;
    /** Update wallets (used internally or for manual state management) */
    setWallets(wallets: ConnectedWallet[]): void;
    /** Get the config */
    getConfig(): BlinkConnectConfig;
    /** Destroy the client and clean up */
    destroy(): void;
}

export { BlinkConnect };
