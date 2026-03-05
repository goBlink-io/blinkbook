export { useEvmAdapter } from './evm.cjs';
export { useSuiAdapter } from './sui.cjs';
export { useNearAdapter } from './near.cjs';
export { useAptosAdapter } from './aptos.cjs';
export { useStarknetAdapter, useStarknetConnectors } from './starknet.cjs';
export { useTonAdapter } from './ton.cjs';
export { useTronAdapter } from './tron.cjs';
import { c as ChainType, A as AdapterHookResult } from '../types-Dgo4Mqar.cjs';
import '@starknet-react/core';

/**
 * Default no-op adapter returned when a chain's peer dependency is not installed.
 */
declare function createNoopAdapter(chain: ChainType): AdapterHookResult;

export { createNoopAdapter };
