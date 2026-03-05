export { useStarknetAdapter, useStarknetConnectors } from '../chunk-RL7K7ZPA.js';
export { useTonAdapter } from '../chunk-WOSATPPH.js';
export { useTronAdapter } from '../chunk-ZC73WCCE.js';
export { useEvmAdapter } from '../chunk-4NNB3BCA.js';
export { useSuiAdapter } from '../chunk-26K62SHN.js';
export { useNearAdapter } from '../chunk-DCDKWG25.js';
export { useAptosAdapter } from '../chunk-6KSLEOJ7.js';
import '../chunk-YJJ5VYUW.js';

// src/adapters/base.ts
function createNoopAdapter(chain) {
  return {
    chain,
    address: null,
    connected: false,
    connect: async () => {
      console.warn(
        `[BlinkConnect] ${chain} adapter dependencies not installed. Skipping connect.`
      );
    },
    disconnect: async () => {
    }
  };
}

export { createNoopAdapter };
