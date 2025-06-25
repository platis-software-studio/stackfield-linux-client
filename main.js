const { app, BrowserWindow, Tray, nativeImage, shell, Menu } = require('electron');
const path = require('path');
const ScreenSharingManager = require('./src/screen-sharing/screenSharingManager');
const NotificationManager = require('./src/managers/notificationManager');
const MenuManager = require('./src/managers/menuManager');
const DebugManager = require('./src/managers/debugManager');
const ClipboardManager = require('./src/managers/clipboardManager');

let win;
let tray;
let screenSharingManager;
let notificationManager;
let debugManager;
let clipboardManager;

// Set explicit WM_CLASS for Linux desktop integration
if (process.platform === 'linux') {
  app.setName('stackfield-electron');
}

// Prevent multiple instances of the app
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (win) {
      win.show();
      win.focus();
    }
  });
}

app.whenReady().then(() => {
  console.log('App is ready, starting setup...');
  
  // Handle icon paths for both development and production
  let normalIconPath, alertIconPath;
  
  if (app.isPackaged) {
    // Production: Icons are unpacked next to app.asar
    normalIconPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'assets', 'icon.png');
    alertIconPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'assets', 'icon-alert.png');
  } else {
    // Development: Icons are in assets folder
    normalIconPath = path.join(__dirname, 'assets', 'icon.png');
    alertIconPath = path.join(__dirname, 'assets', 'icon-alert.png');
  }

  console.log('Creating main window...');
  
  // Create the main window
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      allowRunningInsecureContent: false,
      webSecurity: true,
      experimentalFeatures: true,
      devTools: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: normalIconPath,
    show: false
  });
  
  // Set the app's window class name for Linux taskbar integration
  if (process.platform === 'linux') {
    win.setIcon(normalIconPath);
    console.log('Linux desktop integration enabled');
  }

  console.log('Main window created, initializing managers...');

  try {
    // Initialize managers
    debugManager = new DebugManager(win);
    screenSharingManager = new ScreenSharingManager(win, debugManager);
    notificationManager = new NotificationManager(win, normalIconPath, alertIconPath, debugManager);
    clipboardManager = new ClipboardManager(win, debugManager);
    
    console.log('Managers initialized, setting up screen sharing...');
    
    // Set up screen sharing
    screenSharingManager.setup();

    // Set up clipboard handling
    clipboardManager.setupIPC();

    console.log('Setting up permissions...');
    
    // Set up permissions
    setupPermissions();

    console.log('Creating menu...');
    
    // Create application menu
    const menu = MenuManager.createMenu(win, debugManager);
    Menu.setApplicationMenu(menu);

    console.log('Setup complete, showing window...');
    
  } catch (error) {
    console.error('Error during initialization:', error);
  }

  // Show window when ready
  win.once('ready-to-show', () => {
    win.show();
  });

  // Load Stackfield website
  win.loadURL('https://www.stackfield.com');

  // Handle external links
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    const currentUrl = new URL(win.webContents.getURL());
    
    if (parsedUrl.hostname !== currentUrl.hostname && 
        parsedUrl.hostname !== 'www.stackfield.com' && 
        parsedUrl.hostname !== 'stackfield.com') {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });

  // Create system tray
  const trayIcon = nativeImage.createFromPath(normalIconPath);
  tray = new Tray(trayIcon.resize({ width: 16, height: 16 }));
  
  // Dynamic tooltip based on notifications
  const updateTrayTooltip = (hasNotifications) => {
    const tooltip = hasNotifications ? 'Stackfield - You have new messages!' : 'Stackfield';
    tray.setToolTip(tooltip);
  };
  
  updateTrayTooltip(false);

  // Create context menu for tray
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Stackfield',
      click: () => {
        win.show();
        win.focus();
      }
    },
    {
      label: 'Hide Stackfield',
      click: () => {
        win.hide();
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  // Connect tray to notification manager
  notificationManager.setTray(tray);
  notificationManager.setTrayTooltipUpdater(updateTrayTooltip);

  // Handle left click on tray
  tray.on('click', () => {
    if (win.isVisible() && win.isFocused()) {
      win.hide();
    } else {
      win.show();
      win.focus();
    }
  });

  // Start notification monitoring
  notificationManager.startMonitoring();

  // Handle window close
  win.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      win.hide();
    }
  });

  // Handle app quit events
  app.on('before-quit', () => {
    app.isQuitting = true;
  });

  // Handle Ctrl+Q / Cmd+Q globally
  app.on('activate', () => {
    if (win) {
      win.show();
      win.focus();
    }
  });

  win.on('closed', () => {
    if (tray) tray.destroy();
    win = null;
  });
});

function setupPermissions() {
  // Handle standard permission requests
  win.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowedPermissions = [
      'camera', 'microphone', 'display-capture', 'media', 'geolocation', 'notifications'
    ];
    callback(allowedPermissions.includes(permission));
  });

  // Handle permission checks
  win.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
    const allowedPermissions = ['camera', 'microphone', 'display-capture', 'media'];
    return allowedPermissions.includes(permission);
  });
}

app.on('window-all-closed', () => {
  if (tray) tray.destroy();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
