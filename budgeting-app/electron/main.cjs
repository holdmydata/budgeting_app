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
      webSecurity: false, // Disable web security for loading local resources
      allowRunningInsecureContent: true,
      devTools: true,
      enableRemoteModule: true,
      sandbox: false
    },
    backgroundColor: '#217346',
    show: false,
  });

  // Always open DevTools for debugging
  mainWindow.webContents.openDevTools();

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
    mainWindow.loadURL('http://localhost:5173');
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html');
    console.log('Loading production build from:', indexPath);
    
    // Check if the file exists
    if (!fs.existsSync(indexPath)) {
      console.error('index.html does not exist at:', indexPath);
      return;
    }

    // Check if the dist directory exists
    const distPath = path.join(__dirname, '../dist');
    if (!fs.existsSync(distPath)) {
      console.error('dist directory does not exist at:', distPath);
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
    }

    // Use file URL protocol
    const fileUrl = `file://${indexPath.replace(/\\/g, '/')}`;
    console.log('Loading file URL:', fileUrl);
    
    mainWindow.loadURL(fileUrl).catch(err => {
      console.error('Failed to load index.html:', err);
      
      // As a fallback, try loading with a simple HTML content
      const fallbackHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Hold My Budget</title>
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
  });

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer ${level}] ${message}`);
  });

  // Add more detailed error handling
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Window finished loading');
  });

  mainWindow.webContents.on('crashed', () => {
    console.error('Renderer process crashed');
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