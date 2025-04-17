/**
 * LZ4 wrapper to handle module loading in a Vite-compatible way
 * Falls back to lz4js (pure JavaScript implementation) when native bindings are not available
 */

// Import the pure JS implementation to ensure it's available in the browser
import * as lz4js from 'lz4js';

interface LZ4Module {
  decode?: (input: Uint8Array) => Uint8Array;
  encode?: (input: Uint8Array) => Uint8Array;
  compress?: (input: Uint8Array) => Uint8Array;
  decompress?: (input: Uint8Array, outputSize?: number) => Uint8Array;
  [key: string]: any;
}

// Create a module with the expected interface
const lz4Module: LZ4Module = {
  // Use lz4js functions but provide the expected interface
  decode: (input: Uint8Array) => lz4js.decompress(input),
  encode: (input: Uint8Array) => lz4js.compress(input),
  compress: lz4js.compress,
  decompress: lz4js.decompress,
};

// Export functions that @databricks/sql expects
export const tryLoadLZ4Module = () => lz4Module;
export default lz4Module; 