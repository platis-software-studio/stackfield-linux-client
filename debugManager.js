class DebugManager {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.debugEnabled = false;
  }

  setDebugEnabled(enabled) {
    this.debugEnabled = enabled;
    this.log('Debug mode', enabled ? 'enabled' : 'disabled');
  }

  log(...args) {
    if (this.debugEnabled) {
      console.log('[DEBUG]', ...args);
    }
  }

  error(...args) {
    if (this.debugEnabled) {
      console.error('[DEBUG ERROR]', ...args);
    }
  }

  setupRendererDebugging() {
    if (!this.debugEnabled) return;

    this.mainWindow.webContents.once('did-finish-load', () => {
      this.mainWindow.webContents.executeJavaScript(`
        console.log('=== Electron Screen Sharing Debug ===');
        console.log('🚀 Electron version:', '${process.versions.electron}');
        console.log('🚀 Chrome version:', '${process.versions.chrome}');
        console.log('getUserMedia available:', !!navigator.mediaDevices?.getUserMedia);
        console.log('getDisplayMedia available:', !!navigator.mediaDevices?.getDisplayMedia);
        
        // Monitor media device calls
        if (navigator.mediaDevices) {
          const originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
          const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices);
          
          navigator.mediaDevices.getUserMedia = function(constraints) {
            console.log('🎥 getUserMedia called');
            return originalGetUserMedia(constraints).then(stream => {
              console.log('✅ getUserMedia success');
              return stream;
            }).catch(error => {
              console.error('❌ getUserMedia failed:', error);
              throw error;
            });
          };
          
          navigator.mediaDevices.getDisplayMedia = function(constraints) {
            console.log('🖥️ getDisplayMedia called');
            return originalGetDisplayMedia(constraints).then(stream => {
              console.log('✅ getDisplayMedia success');
              return stream;
            }).catch(error => {
              console.error('❌ getDisplayMedia failed:', error);
              throw error;
            });
          };
        }
        
        // Test function
        window.testScreenShare = async function() {
          try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
              video: true,
              audio: true
            });
            console.log('Screen share test success!', stream);
            return stream;
          } catch (error) {
            console.error('Screen share test failed:', error);
            throw error;
          }
        };
        
        console.log('Debug setup complete. Try: window.testScreenShare()');
      `);
    });
  }

  logScreenSharingEvent(event, data = '') {
    this.log(`Screen sharing ${event}:`, data);
  }

  logNotificationEvent(event, data = '') {
    this.log(`Notification ${event}:`, data);
  }

  logPermissionEvent(permission, granted) {
    this.log(`Permission ${permission}:`, granted ? 'granted' : 'denied');
  }
}

module.exports = DebugManager;
