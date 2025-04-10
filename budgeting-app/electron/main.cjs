const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const handleSquirrelEvent = require('./squirrel.cjs');
const fs = require('fs');

if (handleSquirrelEvent(app)) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}

let mainWindow;
let appReady = false;

function createWindow() {
  // Register custom protocol
  protocol.registerFileProtocol('app', (request, callback) => {
    const url = request.url.substr(6); // Remove 'app://'
    callback({ path: path.normalize(`${__dirname}/${url}`) });
  });

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 940,
    minHeight: 600,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
      // Improve security settings
      webSecurity: true,
      allowRunningInsecureContent: false,
      devTools: isDev,
      enableRemoteModule: false,
      sandbox: true,
      // Add CSP
      additionalArguments: ['--js-flags=--expose-gc'],
      // Enable secure defaults
      disableBlinkFeatures: 'Auxclick'
    },
    backgroundColor: '#217346',
    show: false,
  });

  // Set Content-Security-Policy
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
        ]
      }
    });
  });

  // Only open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Allow local file access
  mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
    (details, callback) => {
      callback({ requestHeaders: { Origin: '*', ...details.requestHeaders } });
    },
  );

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        'Access-Control-Allow-Origin': ['*'],
        ...details.responseHeaders,
      },
    });
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173').then(() => {
      console.log('Development server loaded successfully');
      appReady = true;
      mainWindow.webContents.send('app-ready');
    }).catch(err => {
      console.error('Failed to load development server:', err);
      mainWindow.webContents.send('app-error', 'Failed to load development server');
    });
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html');
    console.log('Loading production build from:', indexPath);
    
    // Check if the file exists
    if (!fs.existsSync(indexPath)) {
      console.error('index.html does not exist at:', indexPath);
      mainWindow.webContents.send('app-error', 'index.html not found');
      return;
    }

    // Check if the dist directory exists
    const distPath = path.join(__dirname, '../dist');
    if (!fs.existsSync(distPath)) {
      console.error('dist directory does not exist at:', distPath);
      mainWindow.webContents.send('app-error', 'dist directory not found');
      return;
    }

    // Log the contents of the dist directory
    console.log('Contents of dist directory:', fs.readdirSync(distPath));

    // Log the contents of the assets directory
    const assetsPath = path.join(distPath, 'assets');
    if (fs.existsSync(assetsPath)) {
      console.log('Contents of assets directory:', fs.readdirSync(assetsPath));
    }

    // Try reading the index.html file content
    try {
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      console.log('Index.html content length:', indexContent.length);
    } catch (error) {
      console.error('Error reading index.html:', error);
      mainWindow.webContents.send('app-error', 'Error reading index.html');
    }

    // Use file URL protocol
    const fileUrl = `file://${indexPath.replace(/\\/g, '/')}`;
    console.log('Loading file URL:', fileUrl);
    
    mainWindow.loadURL(fileUrl).then(() => {
      console.log('Production build loaded successfully');
      appReady = true;
      mainWindow.webContents.send('app-ready');
    }).catch(err => {
      console.error('Failed to load index.html:', err);
      mainWindow.webContents.send('app-error', 'Failed to load application');
      
      // As a fallback, try loading with a simple HTML content
      const fallbackHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Hold My Budget</title>
            <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';">
            <style>
              body {
                background-color: #217346;
                color: white;
                font-family: Arial, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                text-align: center;
              }
              h1 { margin-bottom: 10px; }
              p { margin-top: 0; }
            </style>
          </head>
          <body>
            <h1>Hold My Budget</h1>
            <p>There was an error loading the application.</p>
            <p>Please check the console for more information.</p>
          </body>
        </html>
      `;
      
      mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(fallbackHtml)}`);
    });
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window controls
  ipcMain.on('window-control', (event, command) => {
    switch (command) {
      case 'minimize':
        mainWindow.minimize();
        break;
      case 'maximize':
        if (mainWindow.isMaximized()) {
          mainWindow.restore();
        } else {
          mainWindow.maximize();
        }
        break;
      case 'quit':
      case 'close':
        // Force close the window and quit the app
        mainWindow.destroy();
        app.quit();
        break;
    }
  });

  // Handle ready check from splash screen
  ipcMain.on('check-ready', (event) => {
    console.log('Received ready check, app ready status:', appReady);
    if (appReady) {
      event.reply('app-ready');
    }
  });

  // Handle close button click
  mainWindow.on('close', (e) => {
    mainWindow.destroy();
    app.quit();
  });

  // Emit window state changes
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('window-state-change', 'maximized');
  });

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('window-state-change', 'restored');
  });

  // Add error handling
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
    mainWindow.webContents.send('app-error', `Failed to load: ${errorDescription}`);
  });

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer ${level}] ${message}`);
  });

  // Add more detailed error handling
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Window finished loading');
    appReady = true;
    mainWindow.webContents.send('app-ready');
  });

  mainWindow.webContents.on('crashed', () => {
    console.error('Renderer process crashed');
    mainWindow.webContents.send('app-error', 'Application crashed');
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  protocol.registerFileProtocol('file', (request, callback) => {
    const pathname = decodeURI(request.url.replace('file:///', ''));
    callback(pathname);
  });
  
  createWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
}); 