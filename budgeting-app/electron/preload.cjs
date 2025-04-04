const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script executing...');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    send: (channel, ...args) => {
      // whitelist channels
      const validChannels = ['window-control'];
      if (validChannels.includes(channel)) {
        console.log(`Sending message on channel: ${channel}`, args);
        ipcRenderer.send(channel, ...args);
      } else {
        console.warn(`Invalid channel ${channel} in send`);
      }
    },
    receive: (channel, func) => {
      const validChannels = ['window-state-change'];
      if (validChannels.includes(channel)) {
        console.log(`Setting up receiver for channel: ${channel}`);
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      } else {
        console.warn(`Invalid channel ${channel} in receive`);
      }
    },
    removeAllListeners: (channel) => {
      const validChannels = ['window-state-change'];
      if (validChannels.includes(channel)) {
        console.log(`Removing listeners for channel: ${channel}`);
        ipcRenderer.removeAllListeners(channel);
      } else {
        console.warn(`Invalid channel ${channel} in removeAllListeners`);
      }
    },
    // Add status check method for debugging
    isElectron: true,
    getStatus: () => {
      return {
        electron: true,
        version: process.versions.electron,
        node: process.versions.node,
        chrome: process.versions.chrome,
        platform: process.platform
      };
    }
  }
);

// Log successful bridge creation
console.log('Electron bridge created successfully');

// Handle preload errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception in preload script:', error);
});

console.log('Preload script completed'); 