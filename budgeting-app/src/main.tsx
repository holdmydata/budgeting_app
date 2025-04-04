import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './global.css'

// Check if running in Electron and log status
const isElectron = window.electron !== undefined;
console.log('Running in Electron:', isElectron);

// Simple error handling
if (isElectron) {
  console.log('Electron environment detected');
}

// Basic rendering
const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Failed to render app:', error);
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background-color: #217346; color: white; font-family: Arial, sans-serif; text-align: center;">
        <h1>Hold My Budget</h1>
        <p>There was an error loading the application.</p>
      </div>
    `;
  }
}
