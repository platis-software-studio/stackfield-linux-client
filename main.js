const { app, BrowserWindow, Tray, nativeImage, shell } = require('electron');
const path = require('path');

let win;
let tray;
let currentIcon = 'normal';

// Prevent multiple instances of the app
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // If someone tries to run the app again, just show the existing window
    if (win) {
      win.show();
      win.focus();
    }
  });
}

app.whenReady().then(() => {
  const normalIconPath = path.join(__dirname, 'icon.png');
  const alertIconPath = path.join(__dirname, 'icon-alert.png');

  // Create the main window
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: normalIconPath,
    show: false
  });

  // Show window when ready
  win.once('ready-to-show', () => {
    win.show();
  });

  // Load Stackfield website
  win.loadURL('https://www.stackfield.com');

  // Handle new window creation - open external links in browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    // Open external links in the default browser
    shell.openExternal(url);
    return { action: 'deny' }; // Prevent opening in Electron
  });

  // Handle navigation to external sites
  win.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    const currentUrl = new URL(win.webContents.getURL());
    
    // If navigating to a different domain, open in browser instead
    if (parsedUrl.hostname !== currentUrl.hostname && parsedUrl.hostname !== 'www.stackfield.com' && parsedUrl.hostname !== 'stackfield.com') {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });

  // Create system tray icon
  const trayIcon = nativeImage.createFromPath(normalIconPath);
  tray = new Tray(trayIcon.resize({ width: 16, height: 16 }));
  tray.setToolTip('Stackfield');

  // Handle tray icon clicks (show/hide window)
  tray.on('click', () => {
    if (win.isVisible()) {
      win.hide();
    } else {
      win.show();
      win.focus();
    }
  });

  // Function to update icons based on notification status
  function updateIcons(hasPersonalNotifications) {
    try {
      if (hasPersonalNotifications && currentIcon !== 'alert') {
        // Switch to alert icon
        const alertIcon = nativeImage.createFromPath(alertIconPath);
        tray.setImage(alertIcon.resize({ width: 16, height: 16 }));
        win.setIcon(alertIcon);
        currentIcon = 'alert';
        win.flashFrame(true); // Flash window to get attention
      } else if (!hasPersonalNotifications && currentIcon !== 'normal') {
        // Switch back to normal icon
        const normalIcon = nativeImage.createFromPath(normalIconPath);
        tray.setImage(normalIcon.resize({ width: 16, height: 16 }));
        win.setIcon(normalIcon);
        currentIcon = 'normal';
        win.flashFrame(false);
      }
    } catch (error) {
      console.error('Error updating icons:', error);
    }
  }

  // Function to check for personal notifications
  function checkForPersonalNotifications() {
    if (win.isDestroyed()) return;
    
    // This code runs inside the Stackfield webpage to look for notifications
    win.webContents.executeJavaScript(`
      (function() {
        let hasPersonalNotifications = false;
        
        // Look for the specific HTML pattern that indicates personal messages
        const dmBadges = document.querySelectorAll('span.SpnGroupUnreaded.SpnGroupRed');
        
        dmBadges.forEach(badge => {
          const text = badge.textContent ? badge.textContent.trim() : '';
          const count = parseInt(text) || 0;
          
          // If there's a number greater than 0 and the badge is visible
          if (count > 0 && badge.offsetParent !== null) {
            hasPersonalNotifications = true;
          }
        });
        
        return hasPersonalNotifications;
      })();
    `).then(result => {
      updateIcons(result);
    }).catch(() => {
      // Fallback: check if the page title contains notification indicators
      const title = win.getTitle();
      const hasPersonalInTitle = title.includes('(');
      updateIcons(hasPersonalInTitle);
    });
  }

  // Start monitoring for notifications
  win.webContents.once('did-finish-load', () => {
    // Wait 3 seconds for page to fully load, then start checking
    setTimeout(checkForPersonalNotifications, 3000);
    // Check every 5 seconds for new notifications
    setInterval(checkForPersonalNotifications, 5000);
  });

  // Also check when the page title changes
  win.on('page-title-updated', () => {
    setTimeout(checkForPersonalNotifications, 500);
  });

  // Check when window gains focus (after you read messages)
  win.on('focus', () => {
    setTimeout(checkForPersonalNotifications, 1000);
  });

  // Handle window close button (hide instead of quit)
  win.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      win.hide();
    }
  });

  // Clean up when app is closed
  win.on('closed', () => {
    if (tray) tray.destroy();
    win = null;
  });
});

// Handle app quit
app.on('before-quit', () => {
  app.isQuitting = true;
});

app.on('window-all-closed', () => {
  if (tray) tray.destroy();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
