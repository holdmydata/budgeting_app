declare interface Window {
  electron?: {
    send: (channel: string, ...args: any[]) => void;
  };
} 