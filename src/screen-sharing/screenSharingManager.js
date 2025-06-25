const { desktopCapturer, session, systemPreferences } = require('electron');
const ScreenPickerDialog = require('./screenPicker');

class ScreenSharingManager {
  constructor(mainWindow, debugManager) {
    this.mainWindow = mainWindow;
    this.debugManager = debugManager;
    this.screenPicker = new ScreenPickerDialog(mainWindow);
  }

  setup() {
    this.debugManager.log('Setting up screen sharing...');
    
    // Request system permissions on macOS
    this.requestMacOSPermissions();
    
    // Set up display media handlers
    this.setupDisplayMediaHandlers();
  }

  requestMacOSPermissions() {
    if (process.platform === 'darwin') {
      systemPreferences.askForMediaAccess('camera').then((granted) => {
        this.debugManager.logPermissionEvent('camera', granted);
      });
      
      systemPreferences.askForMediaAccess('microphone').then((granted) => {
        this.debugManager.logPermissionEvent('microphone', granted);
      });
      
      const screenAccess = systemPreferences.getMediaAccessStatus('screen');
      if (screenAccess !== 'granted') {
        this.debugManager.log('Screen recording permission needed!');
        this.debugManager.log('Please grant permission in System Preferences > Security & Privacy > Screen Recording');
      }
    }
  }

  setupDisplayMediaHandlers() {
    // Set up on default session
    if (session.defaultSession.setDisplayMediaRequestHandler) {
      session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
        this.debugManager.logScreenSharingEvent('requested', 'default session');
        this.handleDisplayMediaRequest(callback);
      });
    }

    // Set up on window session
    if (this.mainWindow.webContents.session.setDisplayMediaRequestHandler) {
      this.mainWindow.webContents.session.setDisplayMediaRequestHandler((request, callback) => {
        this.debugManager.logScreenSharingEvent('requested', 'window session');
        this.handleDisplayMediaRequest(callback);
      });
    }
  }

  async handleDisplayMediaRequest(callback) {
    try {
      const sources = await desktopCapturer.getSources({ 
        types: ['screen', 'window'],
        thumbnailSize: { width: 150, height: 150 }
      });

      this.debugManager.logScreenSharingEvent('sources found', sources.length);

      if (sources.length === 0) {
        this.debugManager.logScreenSharingEvent('no sources available');
        callback({});
        return;
      }

      // Show the picker dialog
      this.debugManager.logScreenSharingEvent('showing picker');
      this.screenPicker.show(sources, (result) => {
        this.debugManager.logScreenSharingEvent('picker result', result ? 'selected' : 'cancelled');
        if (result && result.video) {
          callback(result);
        } else {
          callback({});
        }
      });

    } catch (error) {
      this.debugManager.error('Error in handleDisplayMediaRequest:', error);
      callback({});
    }
  }
}

module.exports = ScreenSharingManager;
