// VOID IDE - Main Process
const { app, BrowserWindow, ipcMain, dialog, Menu, globalShortcut, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// Logging
const logPath = path.join(app.getPath('userData'), 'logs');
if (!fs.existsSync(logPath)) {
  fs.mkdirSync(logPath, { recursive: true });
}
const logFile = path.join(logPath, `void-${Date.now()}.log`);

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFile, logMessage);
  console.log(message);
}

log('VOID IDE starting...');

let mainWindow;

function createWindow() {
  log('Creating main window...');
  
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1200,
    minHeight: 800,
    backgroundColor: '#0a0a0f',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true
    },
    frame: true,
    titleBarStyle: 'default',
    icon: path.join(__dirname, '../src/assets/icon.png')
  });

  mainWindow.loadFile(path.join(__dirname, '../src/renderer/index.html'));

  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  createMenu();
  
  log('Main window created');
}

function createMenu() {
  const template = [
    {
      label: 'VOID',
      submenu: [
        { label: 'About VOID IDE', role: 'about' },
        { type: 'separator' },
        { label: 'Preferences', accelerator: 'CmdOrCtrl+,', click: () => mainWindow?.webContents.send('menu-action', 'preferences') },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'File',
      submenu: [
        { label: 'New Project', accelerator: 'CmdOrCtrl+N', click: () => mainWindow?.webContents.send('menu-action', 'new-project') },
        { label: 'Open Project', accelerator: 'CmdOrCtrl+O', click: () => openProject() },
        { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => mainWindow?.webContents.send('menu-action', 'save') },
        { label: 'Save All', accelerator: 'CmdOrCtrl+Shift+S', click: () => mainWindow?.webContents.send('menu-action', 'save-all') },
        { type: 'separator' },
        { label: 'Import Asset', click: () => importAsset() },
        { label: 'Export Project', click: () => mainWindow?.webContents.send('menu-action', 'export') }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'World',
      submenu: [
        { label: 'AI: Generate World', accelerator: 'CmdOrCtrl+G', click: () => mainWindow?.webContents.send('menu-action', 'ai-generate-world') },
        { label: 'AI: Generate Level', accelerator: 'CmdOrCtrl+Shift+G', click: () => mainWindow?.webContents.send('menu-action', 'ai-generate-level') },
        { type: 'separator' },
        { label: 'Add Object', click: () => mainWindow?.webContents.send('menu-action', 'add-object') },
        { label: 'Add Light', click: () => mainWindow?.webContents.send('menu-action', 'add-light') },
        { label: 'Add Camera', click: () => mainWindow?.webContents.send('menu-action', 'add-camera') }
      ]
    },
    {
      label: 'AI',
      submenu: [
        { label: 'AI Code Assistant', accelerator: 'F1', click: () => mainWindow?.webContents.send('menu-action', 'ai-assistant') },
        { label: 'AI: Generate Code', accelerator: 'F2', click: () => mainWindow?.webContents.send('menu-action', 'ai-code') },
        { label: 'AI: Generate Assets', accelerator: 'F3', click: () => mainWindow?.webContents.send('menu-action', 'ai-assets') },
        { type: 'separator' },
        { label: 'AI: Playtest', click: () => mainWindow?.webContents.send('menu-action', 'ai-playtest') },
        { label: 'AI: Auto-Balance', click: () => mainWindow?.webContents.send('menu-action', 'ai-balance') },
        { label: 'AI: Find Bugs', click: () => mainWindow?.webContents.send('menu-action', 'ai-bugfind') }
      ]
    },
    {
      label: 'Build',
      submenu: [
        { label: 'Play', accelerator: 'F5', click: () => mainWindow?.webContents.send('menu-action', 'play') },
        { label: 'Stop', accelerator: 'Shift+F5', click: () => mainWindow?.webContents.send('menu-action', 'stop') },
        { type: 'separator' },
        { label: 'Build for Web', click: () => mainWindow?.webContents.send('menu-action', 'build-web') },
        { label: 'Build for Desktop', click: () => mainWindow?.webContents.send('menu-action', 'build-desktop') },
        { label: 'Build for Mobile', click: () => mainWindow?.webContents.send('menu-action', 'build-mobile') }
      ]
    },
    {
      label: 'Help',
      submenu: [
        { label: 'Documentation', click: () => shell.openExternal('https://void-ide.dev/docs') },
        { label: 'AI Prompts Library', click: () => mainWindow?.webContents.send('menu-action', 'ai-prompts') },
        { type: 'separator' },
        { label: 'Report Bug', click: () => shell.openExternal('https://github.com/AlienLost08/void-ide/issues') }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

async function openProject() {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Open VOID Project'
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const projectPath = result.filePaths[0];
    mainWindow?.webContents.send('project-opened', projectPath);
    log(`Project opened: ${projectPath}`);
  }
}

async function importAsset() {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    title: 'Import Assets',
    filters: [
      { name: '3D Models', extensions: ['obj', 'fbx', 'gltf', 'glb'] },
      { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp'] },
      { name: 'Audio', extensions: ['mp3', 'wav', 'ogg'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    mainWindow?.webContents.send('assets-imported', result.filePaths);
    log(`Assets imported: ${result.filePaths.length} files`);
  }
}

// IPC Handlers
ipcMain.handle('get-user-data-path', () => app.getPath('userData'));

ipcMain.handle('read-file', async (event, filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    log(`Error reading file: ${error.message}`);
    return null;
  }
});

ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch (error) {
    log(`Error writing file: ${error.message}`);
    return false;
  }
});

ipcMain.handle('list-directory', async (event, dirPath) => {
  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    return items.map(item => ({
      name: item.name,
      isDirectory: item.isDirectory(),
      path: path.join(dirPath, item.name)
    }));
  } catch (error) {
    log(`Error listing directory: ${error.message}`);
    return [];
  }
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  return dialog.showOpenDialog(mainWindow, options);
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  return dialog.showSaveDialog(mainWindow, options);
});

ipcMain.handle('show-message-box', async (event, options) => {
  return dialog.showMessageBox(mainWindow, options);
});

// App lifecycle
app.whenReady().then(() => {
  log('App ready');
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  log('All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  log('App quitting...');
  globalShortcut.unregisterAll();
});

// Handle errors
process.on('uncaughtException', (error) => {
  log(`Uncaught Exception: ${error.message}\n${error.stack}`);
  dialog.showErrorBox('VOID IDE Error', error.message);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled Rejection: ${reason}`);
});
