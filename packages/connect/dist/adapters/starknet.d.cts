import * as _starknet_react_core from '@starknet-react/core';
import { A as AdapterHookResult } from '../types-Dgo4Mqar.cjs';

/**
 * Starknet adapter — uses @starknet-react/core.
 */
declare function useStarknetAdapter(): AdapterHookResult;
/** Expose connectors for the modal to render wallet choices */
declare function useStarknetConnectors(): {
    connect: (args?: _starknet_react_core.ConnectVariables) => void;
    connectors: _starknet_react_core.Connector[];
};

export { useStarknetAdapter, useStarknetConnectors };
