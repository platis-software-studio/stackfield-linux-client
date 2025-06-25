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

  logClipboardEvent(event, data = '') {
    this.log(`Clipboard ${event}:`, data);
  }

  setupClipboardDebugging() {
    if (!this.debugEnabled) return;

    this.mainWindow.webContents.once('did-finish-load', () => {
      // Add a delay to ensure the page is fully loaded
      setTimeout(() => {
        this.mainWindow.webContents.executeJavaScript(`
          try {
            // Check if clipboard API is available
            if (!navigator.clipboard) {
              console.log('📋 Clipboard API not available');
              return;
            }
            
            // Monitor clipboard operations
            const originalWriteText = navigator.clipboard.writeText?.bind(navigator.clipboard);
            const originalWrite = navigator.clipboard.write?.bind(navigator.clipboard);
            
            if (originalWriteText) {
              navigator.clipboard.writeText = function(text) {
                console.log('📋 Clipboard writeText called with:', text ? text.substring(0, 100) : 'undefined');
                return originalWriteText(text).then(() => {
                  console.log('✅ Clipboard writeText success');
                }).catch(error => {
                  console.error('❌ Clipboard writeText failed:', error);
                  throw error;
                });
              };
            }
            
            if (originalWrite) {
              navigator.clipboard.write = function(data) {
                console.log('📋 Clipboard write called with:', data);
                return originalWrite(data).then(() => {
                  console.log('✅ Clipboard write success');
                }).catch(error => {
                  console.error('❌ Clipboard write failed:', error);
                  throw error;
                });
              };
            }
            
            console.log('✅ Clipboard debugging setup complete');
          } catch (error) {
            console.error('❌ Error setting up clipboard debugging:', error);
          }
        `).catch(error => {
          this.error('Failed to inject clipboard debugging:', error);
        });
      }, 2000);
    });
  }
}

module.exports = DebugManager;
