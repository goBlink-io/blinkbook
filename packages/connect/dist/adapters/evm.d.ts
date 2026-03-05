import { A as AdapterHookResult } from '../types-Dgo4Mqar.js';

interface EvmAdapterResult {
    evm: AdapterHookResult;
    solana: AdapterHookResult;
    bitcoin: AdapterHookResult;
}
/**
 * EVM adapter — uses ReOwn AppKit which handles EVM + Solana + Bitcoin.
 * Returns adapter results for all three chains since they share one connection layer.
 */
declare function useEvmAdapter(): EvmAdapterResult;

export { useEvmAdapter };
