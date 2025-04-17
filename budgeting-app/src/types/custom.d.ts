// Declare global Buffer
declare global {
  interface Window {
    process?: any;
    Buffer?: typeof Buffer;
    electron?: any;
  }
  var Buffer: typeof import('buffer').Buffer;
}

// Declare Node.js modules
declare module 'buffer' {
  export const Buffer: any;
  export const INSPECT_MAX_BYTES: number;
  export const kMaxLength: number;
}

declare module 'stream-browserify' {
  import { Stream } from 'stream';
  export = Stream;
}

export {}; 