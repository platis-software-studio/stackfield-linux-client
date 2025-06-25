const { nativeImage } = require('electron');

class NotificationManager {
  constructor(mainWindow, normalIconPath, alertIconPath, debugManager) {
    this.mainWindow = mainWindow;
    this.normalIconPath = normalIconPath;
    this.alertIconPath = alertIconPath;
    this.debugManager = debugManager;
    this.currentIcon = 'normal';
    this.tray = null;
    this.updateTrayTooltip = null;
  }

  setTray(tray) {
    this.tray = tray;
  }

  setTrayTooltipUpdater(updater) {
    this.updateTrayTooltip = updater;
  }

  startMonitoring() {
    // Start monitoring for notifications after page loads
    this.mainWindow.webContents.once('did-finish-load', () => {
      setTimeout(() => this.checkForPersonalNotifications(), 3000);
      setInterval(() => this.checkForPersonalNotifications(), 5000);
    });

    // Also check when the page title changes
    this.mainWindow.on('page-title-updated', () => {
      setTimeout(() => this.checkForPersonalNotifications(), 500);
    });

    // Check when window gains focus
    this.mainWindow.on('focus', () => {
      setTimeout(() => this.checkForPersonalNotifications(), 1000);
    });
  }

  checkForPersonalNotifications() {
    if (this.mainWindow.isDestroyed()) return;
    
    this.mainWindow.webContents.executeJavaScript(`
      (function() {
        let hasPersonalNotifications = false;
        
        const dmBadges = document.querySelectorAll('span.SpnGroupUnreaded.SpnGroupRed');
        
        dmBadges.forEach(badge => {
          const text = badge.textContent ? badge.textContent.trim() : '';
          const count = parseInt(text) || 0;
          
          if (count > 0 && badge.offsetParent !== null) {
            hasPersonalNotifications = true;
          }
        });
        
        return hasPersonalNotifications;
      })();
    `).then(result => {
      this.updateIcons(result);
    }).catch(() => {
      // Fallback: check if the page title contains notification indicators
      const title = this.mainWindow.getTitle();
      const hasPersonalInTitle = title.includes('(');
      this.updateIcons(hasPersonalInTitle);
    });
  }

  updateIcons(hasPersonalNotifications) {
    try {
      if (hasPersonalNotifications && this.currentIcon !== 'alert') {
        // Switch to alert icon
        const alertIcon = nativeImage.createFromPath(this.alertIconPath);
        
        // Update tray icon
        if (this.tray) {
          this.tray.setImage(alertIcon.resize({ width: 16, height: 16 }));
        }
        
        // Update tray tooltip
        if (this.updateTrayTooltip) {
          this.updateTrayTooltip(true);
        }
        
        // Update window icon
        this.mainWindow.setIcon(alertIcon);
        
        // Flash taskbar icon
        this.mainWindow.flashFrame(true);
        
        // Send desktop notification
        this.sendDesktopNotification();
        
        this.currentIcon = 'alert';
        this.debugManager.logNotificationEvent('alert activated');
        
      } else if (!hasPersonalNotifications && this.currentIcon !== 'normal') {
        // Switch back to normal icon
        const normalIcon = nativeImage.createFromPath(this.normalIconPath);
        
        // Update tray icon
        if (this.tray) {
          this.tray.setImage(normalIcon.resize({ width: 16, height: 16 }));
        }
        
        // Update tray tooltip
        if (this.updateTrayTooltip) {
          this.updateTrayTooltip(false);
        }
        
        // Update window icon
        this.mainWindow.setIcon(normalIcon);
        
        // Stop flashing
        this.mainWindow.flashFrame(false);
        
        this.currentIcon = 'normal';
        this.debugManager.logNotificationEvent('alert cleared');
      }
    } catch (error) {
      this.debugManager.error('Error updating icons:', error);
    }
  }

  sendDesktopNotification() {
    try {
      const { Notification } = require('electron');
      
      if (Notification.isSupported()) {
        const notification = new Notification({
          title: 'Stackfield',
          body: 'You have new messages',
          icon: this.alertIconPath,
          silent: true
        });
        
        notification.show();
      }
    } catch (error) {
      this.debugManager.error('Error sending notification:', error);
    }
  }
}

module.exports = NotificationManager;
