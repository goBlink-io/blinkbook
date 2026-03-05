import { A as AdapterHookResult } from '../types-Dgo4Mqar.cjs';

interface NearAdapterOptions {
    networkId?: string;
}
/**
 * NEAR adapter — uses @hot-labs/near-connect.
 */
declare function useNearAdapter(options?: NearAdapterOptions): AdapterHookResult;

export { type NearAdapterOptions, useNearAdapter };
