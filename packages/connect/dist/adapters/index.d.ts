export { useEvmAdapter } from './evm.js';
export { useSuiAdapter } from './sui.js';
export { useNearAdapter } from './near.js';
export { useAptosAdapter } from './aptos.js';
export { useStarknetAdapter, useStarknetConnectors } from './starknet.js';
export { useTonAdapter } from './ton.js';
export { useTronAdapter } from './tron.js';
import { c as ChainType, A as AdapterHookResult } from '../types-Dgo4Mqar.js';
import '@starknet-react/core';

/**
 * Default no-op adapter returned when a chain's peer dependency is not installed.
 */
declare function createNoopAdapter(chain: ChainType): AdapterHookResult;

export { createNoopAdapter };
