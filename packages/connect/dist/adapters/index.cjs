'use strict';

var chunkYOFXR6K6_cjs = require('../chunk-YOFXR6K6.cjs');
var chunkJTAEOBYC_cjs = require('../chunk-JTAEOBYC.cjs');
var chunkO3CQTKTL_cjs = require('../chunk-O3CQTKTL.cjs');
var chunkDLTJ74N5_cjs = require('../chunk-DLTJ74N5.cjs');
var chunkWODRPRHJ_cjs = require('../chunk-WODRPRHJ.cjs');
var chunkJFU7VAGT_cjs = require('../chunk-JFU7VAGT.cjs');
var chunkPOYEVZNA_cjs = require('../chunk-POYEVZNA.cjs');
require('../chunk-OOTTOONG.cjs');

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

Object.defineProperty(exports, "useStarknetAdapter", {
  enumerable: true,
  get: function () { return chunkYOFXR6K6_cjs.useStarknetAdapter; }
});
Object.defineProperty(exports, "useStarknetConnectors", {
  enumerable: true,
  get: function () { return chunkYOFXR6K6_cjs.useStarknetConnectors; }
});
Object.defineProperty(exports, "useTonAdapter", {
  enumerable: true,
  get: function () { return chunkJTAEOBYC_cjs.useTonAdapter; }
});
Object.defineProperty(exports, "useTronAdapter", {
  enumerable: true,
  get: function () { return chunkO3CQTKTL_cjs.useTronAdapter; }
});
Object.defineProperty(exports, "useEvmAdapter", {
  enumerable: true,
  get: function () { return chunkDLTJ74N5_cjs.useEvmAdapter; }
});
Object.defineProperty(exports, "useSuiAdapter", {
  enumerable: true,
  get: function () { return chunkWODRPRHJ_cjs.useSuiAdapter; }
});
Object.defineProperty(exports, "useNearAdapter", {
  enumerable: true,
  get: function () { return chunkJFU7VAGT_cjs.useNearAdapter; }
});
Object.defineProperty(exports, "useAptosAdapter", {
  enumerable: true,
  get: function () { return chunkPOYEVZNA_cjs.useAptosAdapter; }
});
exports.createNoopAdapter = createNoopAdapter;
