const { BrowserWindow, ipcMain } = require('electron');
const path = require('path');

class ScreenPickerDialog {
  constructor(parentWindow) {
    this.parentWindow = parentWindow;
    this.pickerWindow = null;
    this.callback = null;
    this.eventHandlerBound = false;
  }

  show(sources, callback) {
    console.log('ScreenPicker: Showing picker with', sources.length, 'sources');
    this.callback = callback;
    this.sources = sources;

    // Create the picker window
    this.pickerWindow = new BrowserWindow({
      width: 800,
      height: 600,
      modal: true,
      parent: this.parentWindow,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      title: 'Select Screen or Window to Share',
      resizable: false,
      minimizable: false,
      maximizable: false
      // Remove icon line - it's causing the error
    });

    // Set up event handlers
    this.setupEventHandlers();

    // Load the picker HTML file
    const htmlPath = path.join(__dirname, 'screenPickerWindow.html');
    console.log('ScreenPicker: Loading HTML from:', htmlPath);
    
    this.pickerWindow.loadFile(htmlPath).catch(error => {
      console.error('ScreenPicker: Failed to load HTML file:', error);
      // Fallback: create a simple picker
      this.createFallbackPicker();
    });

    // Send sources data to the picker window when it's ready
    this.pickerWindow.webContents.once('did-finish-load', () => {
      console.log('ScreenPicker: Sending sources data to picker window');
      this.pickerWindow.webContents.send('sources-data', sources);
    });

    // Show the picker window
    this.pickerWindow.once('ready-to-show', () => {
      console.log('ScreenPicker: Showing picker window');
      this.pickerWindow.show();
      this.pickerWindow.focus();
    });

    // Handle window close without selection
    this.pickerWindow.on('closed', () => {
      console.log('ScreenPicker: Window closed');
      try {
        // Only call callback if it hasn't been called yet
        if (this.callback) {
          const callback = this.callback;
          this.callback = null;
          callback({});
        }
        this.cleanup();
      } catch (error) {
        console.error('Error handling window close:', error);
        this.cleanup();
      }
    });
  }

  setupEventHandlers() {
    if (this.eventHandlerBound) return;

    this.handlePickerResult = (event, sourceId) => {
      if (!this.pickerWindow || this.pickerWindow.isDestroyed() || !this.callback) {
        this.cleanup();
        return;
      }

      try {
        // Immediately null the callback to prevent multiple calls
        const callback = this.callback;
        this.callback = null;
        
        this.pickerWindow.close();
        
        if (sourceId) {
          // Find the selected source
          const selectedSource = this.sources.find(source => source.id === sourceId);
          if (selectedSource) {
            console.log('User selected:', selectedSource.name);
            callback({ 
              video: selectedSource, 
              audio: 'loopback' 
            });
          } else {
            callback({});
          }
        } else {
          console.log('User cancelled screen sharing');
          callback({});
        }
        
        this.cleanup();
      } catch (error) {
        console.error('Error handling picker result:', error);
        this.cleanup();
      }
    };
    
    ipcMain.on('screen-picker-result', this.handlePickerResult);
    this.eventHandlerBound = true;
  }

  cleanup() {
    try {
      if (this.eventHandlerBound && this.handlePickerResult) {
        ipcMain.removeListener('screen-picker-result', this.handlePickerResult);
        this.eventHandlerBound = false;
      }
      this.pickerWindow = null;
      this.handlePickerResult = null;
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  createFallbackPicker() {
    console.log('ScreenPicker: Using fallback picker');
    
    try {
      // Only proceed if callback still exists
      if (!this.callback) {
        this.cleanup();
        return;
      }

      const callback = this.callback;
      this.callback = null;

      // If the HTML file fails to load, just pick the first screen automatically
      const screenSource = this.sources.find(source => source.id.startsWith('screen:')) || this.sources[0];
      
      if (screenSource) {
        console.log('ScreenPicker: Auto-selecting first available source:', screenSource.name);
        callback({ 
          video: screenSource, 
          audio: 'loopback' 
        });
      } else {
        callback({});
      }
      
      this.cleanup();
    } catch (error) {
      console.error('Error in fallback picker:', error);
      if (this.callback) {
        const callback = this.callback;
        this.callback = null;
        callback({});
      }
      this.cleanup();
    }
  }
}

module.exports = ScreenPickerDialog;
