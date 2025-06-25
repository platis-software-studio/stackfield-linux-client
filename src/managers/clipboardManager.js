const { clipboard, nativeImage, ipcMain } = require('electron');
const { spawn, exec } = require('child_process');

class ClipboardManager {
  constructor(mainWindow, debugManager) {
    this.mainWindow = mainWindow;
    this.debugManager = debugManager;
    this.hasXClip = false;
    this.hasWlClipboard = false;
    this.checkDependencies();
  }

  // Check if required system dependencies are available
  checkDependencies() {
    // Check for xclip
    exec('which xclip', (error) => {
      this.hasXClip = !error;
      this.debugManager.logClipboardEvent('xclip available', this.hasXClip);
    });

    // Check for wl-clipboard
    exec('which wl-copy', (error) => {
      this.hasWlClipboard = !error;
      this.debugManager.logClipboardEvent('wl-clipboard available', this.hasWlClipboard);
    });
  }

  // Set up IPC handlers
  setupIPC() {
    // Auto-setup clipboard intercept when page loads
    this.setupClipboardIntercept();

    ipcMain.handle('test-clipboard', async (event) => {
      try {
        // Simple test to write and read text
        clipboard.writeText('Electron clipboard test');
        const text = clipboard.readText();
        this.debugManager.logClipboardEvent('test success', text);
        return { success: true, text };
      } catch (error) {
        this.debugManager.error('Clipboard test failed:', error);
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('set-clipboard-image-simple', async (event, dataUrl) => {
      try {
        this.debugManager.logClipboardEvent('simple image request');
        
        // Convert data URL to native image
        const image = nativeImage.createFromDataURL(dataUrl);
        
        if (image.isEmpty()) {
          throw new Error('Image is empty or invalid');
        }

        // Try Electron clipboard first
        clipboard.writeImage(image);
        
        // Verify
        const clipboardImage = clipboard.readImage();
        if (!clipboardImage.isEmpty()) {
          this.debugManager.logClipboardEvent('Electron clipboard success');
          return { success: true, method: 'electron' };
        }

        // Fallback to system clipboard
        if (process.platform === 'linux') {
          if (!this.hasXClip && !this.hasWlClipboard) {
            throw new Error('No system clipboard utilities available. Please install xclip or wl-clipboard.');
          }
          const buffer = image.toPNG();
          await this.useSystemClipboard(buffer, 'image/png');
          return { success: true, method: 'system' };
        }

        throw new Error('All clipboard methods failed');
        
      } catch (error) {
        this.debugManager.error('Clipboard image failed:', error);
        return { success: false, error: error.message };
      }
    });
  }

  // Automatically set up clipboard intercept for Stackfield
  setupClipboardIntercept() {
    this.mainWindow.webContents.on('did-finish-load', () => {
      // Wait for page to fully load
      setTimeout(() => {
        this.injectClipboardIntercept();
      }, 2000);
    });
  }

  // Inject the clipboard intercept into the page
  injectClipboardIntercept() {
    this.mainWindow.webContents.executeJavaScript(`
      (function() {
        // Prevent double setup
        if (window.stackfieldClipboardSetup) return;
        window.stackfieldClipboardSetup = true;
        
        console.log('🔧 Setting up Stackfield clipboard intercept...');
        
        const originalWrite = navigator.clipboard.write.bind(navigator.clipboard);
        
        navigator.clipboard.write = async function(data) {
          console.log('📋 Clipboard intercept active');
          
          for (const item of data) {
            for (const type of item.types) {
              if (type.startsWith('image/')) {
                console.log('🖼️ Image copy detected:', type);
                
                try {
                  const blob = await item.getType(type);
                  
                  // Convert to data URL for our Electron API
                  const reader = new FileReader();
                  reader.onload = async function(event) {
                    const dataUrl = event.target.result;
                    
                    try {
                      const result = await window.electronAPI.setClipboardImageSimple(dataUrl);
                      if (result.success) {
                        console.log('✅ Image copied to system clipboard via', result.method);
                      } else {
                        console.warn('⚠️ Electron clipboard failed, trying original method');
                        originalWrite(data);
                      }
                    } catch (error) {
                      console.error('❌ Clipboard API error:', error);
                      originalWrite(data);
                    }
                  };
                  reader.readAsDataURL(blob);
                  
                  return Promise.resolve();
                  
                } catch (error) {
                  console.error('❌ Image processing failed:', error);
                }
              }
            }
          }
          
          // Fallback for non-images
          return originalWrite(data);
        };
        
        console.log('✅ Stackfield clipboard intercept ready');
      })();
    `).catch(error => {
      this.debugManager.error('Failed to inject clipboard intercept:', error);
    });
  }

  async useSystemClipboard(buffer, mimeType) {
    return new Promise((resolve, reject) => {
      // Try xclip first if available
      if (this.hasXClip) {
        this.tryXClip(buffer, mimeType).then(resolve).catch(() => {
          if (this.hasWlClipboard) {
            this.tryWlClipboard(buffer, mimeType).then(resolve).catch(reject);
          } else {
            reject(new Error('xclip failed and wl-clipboard not available'));
          }
        });
      } else if (this.hasWlClipboard) {
        this.tryWlClipboard(buffer, mimeType).then(resolve).catch(reject);
      } else {
        reject(new Error('No clipboard utilities available'));
      }
    });
  }

  async tryWlClipboard(buffer, mimeType) {
    return new Promise((resolve, reject) => {
      const wlCopy = spawn('wl-copy', ['--type', mimeType], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stderr = '';
      wlCopy.stderr.on('data', (data) => stderr += data);

      wlCopy.on('close', (code) => {
        if (code === 0) {
          this.debugManager.logClipboardEvent('wl-copy success');
          resolve();
        } else {
          reject(new Error(`wl-copy failed: ${stderr}`));
        }
      });

      wlCopy.on('error', (error) => {
        reject(error);
      });

      wlCopy.stdin.write(buffer);
      wlCopy.stdin.end();
    });
  }
}

module.exports = ClipboardManager;
