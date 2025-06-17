const { Menu, app } = require('electron');

class MenuManager {
  static createMenu(mainWindow, debugManager) {
    const template = [
      {
        label: 'File',
        submenu: [
          {
            label: 'Quit',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
              app.quit();
            }
          }
        ]
      },
      {
        label: 'View',
        submenu: [
          {
            label: 'Toggle DevTools',
            accelerator: 'F12',
            click: () => {
              mainWindow.webContents.toggleDevTools();
            }
          },
          {
            label: 'Reload',
            accelerator: 'F5',
            click: () => {
              mainWindow.reload();
            }
          },
          {
            type: 'separator'
          },
          {
            label: 'Zoom In',
            accelerator: 'CmdOrCtrl+=',
            click: () => {
              const currentZoom = mainWindow.webContents.getZoomLevel();
              mainWindow.webContents.setZoomLevel(currentZoom + 1);
            }
          },
          {
            label: 'Zoom Out',
            accelerator: 'CmdOrCtrl+-',
            click: () => {
              const currentZoom = mainWindow.webContents.getZoomLevel();
              mainWindow.webContents.setZoomLevel(currentZoom - 1);
            }
          },
          {
            label: 'Reset Zoom',
            accelerator: 'CmdOrCtrl+0',
            click: () => {
              mainWindow.webContents.setZoomLevel(0);
            }
          }
        ]
      },
      {
        label: 'Debug',
        submenu: [
          {
            label: 'Toggle Debug Mode',
            type: 'checkbox',
            checked: false,
            click: (menuItem) => {
              debugManager.setDebugEnabled(menuItem.checked);
              if (menuItem.checked) {
                debugManager.setupRendererDebugging();
              }
            }
          }
        ]
      }
    ];
    
    // Add macOS specific menu items
    if (process.platform === 'darwin') {
      template.unshift({
        label: app.getName(),
        submenu: [
          {
            label: 'About ' + app.getName(),
            role: 'about'
          },
          {
            type: 'separator'
          },
          {
            label: 'Hide ' + app.getName(),
            accelerator: 'Command+H',
            role: 'hide'
          },
          {
            label: 'Hide Others',
            accelerator: 'Command+Shift+H',
            role: 'hideothers'
          },
          {
            label: 'Show All',
            role: 'unhide'
          },
          {
            type: 'separator'
          },
          {
            label: 'Quit',
            accelerator: 'Command+Q',
            click: () => {
              app.quit();
            }
          }
        ]
      });
    }
    
    return Menu.buildFromTemplate(template);
  }
}

module.exports = MenuManager;
