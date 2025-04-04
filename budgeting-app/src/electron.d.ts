// Type declarations for Electron integration
interface Window {
  electron?: {
    send: (channel: string, ...args: any[]) => void;
    receive: (channel: string, func: (...args: any[]) => void) => void;
    removeAllListeners: (channel: string) => void;
  };
} 