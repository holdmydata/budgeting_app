const { app } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const handleSquirrelEvent = require('./squirrel.cjs');

// Handle Windows Squirrel events
if (handleSquirrelEvent()) {
  app.quit();
}

// Load the main process
require('./main.cjs'); 