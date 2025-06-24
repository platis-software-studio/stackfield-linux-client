# Stackfield Desktop App for Linux

A feature-rich Electron-based desktop application for Stackfield with advanced screen sharing capabilities, smart notifications, and professional UI.

## Features

### Core Features
- **Smart Notifications**: Visual notification indicators in system tray and taskbar
- **System Tray Integration**: Minimize to tray with right-click context menu
- **Advanced Screen Sharing**: Beautiful picker dialog to choose screens or windows
- **Fixed Image Clipboard**: Automatic image copying to system clipboard (Linux fix)
- **Dark Theme UI**: Modern dark interface for screen sharing picker
- **External Link Handling**: Opens external links in your default browser
- **Single Instance**: Prevents multiple app instances
- **Lightweight**: Minimal resource usage with modular architecture

### Clipboard System
- **Automatic Image Interception**: Detects when you copy images in Stackfield
- **Electron API Integration**: Uses native clipboard APIs for better compatibility
- **System Fallback**: Automatically uses xclip/wl-clipboard when needed
- **Cross-Platform**: Works on X11 and Wayland display servers
- **Error Handling**: Graceful fallbacks when clipboard utilities are missing

### Screen Sharing
- **Visual Source Picker**: Thumbnail previews of all available screens and windows
- **Smart Selection**: Distinguish between full screens and application windows
- **Dark Theme**: Professional dark UI that's easy on the eyes
- **Keyboard Support**: Escape to cancel, Enter to share selected source
- **Intuitive Controls**: Click to select, hover effects for better UX

### Notification System
- **Dynamic Icons**: Changes tray icon when you have unread messages
- **Real-time Updates**: Monitors Stackfield for personal message notifications
- **Visual Alerts**: Window flashing and tray icon changes
- **Badge Detection**: Automatically detects red notification badges

### Developer Features
- **Debug Mode**: Toggle-able debug console output
- **DevTools Integration**: Built-in developer tools access (F12)
- **Modular Architecture**: Clean, maintainable code structure
- **Error Handling**: Comprehensive error handling and logging

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Linux system with X11 or Wayland
- xclip and wl-clipboard (for image clipboard functionality)

### System Dependencies

For optimal clipboard functionality, install the required system utilities:

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install xclip wl-clipboard
```

**Fedora:**
```bash
sudo dnf install xclip wl-clipboard
```

**Arch Linux:**
```bash
sudo pacman -S xclip wl-clipboard
```

**CentOS/RHEL:**
```bash
sudo yum install xclip wl-clipboard
```

### Setup
1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/stackfield-desktop-app.git
   cd stackfield-desktop-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the application:
   ```bash
   npm start
   ```
   Or use the shell script:
   ```bash
   ./stackfield.sh
   ```

## Usage

### System Tray
- **Left-click**: Toggle show/hide application window
- **Right-click**: Access context menu (Show, Hide, Quit)

### Image Clipboard
- **Automatic**: Image copying works automatically when you copy images in Stackfield
- **No Setup Required**: The app automatically intercepts and handles image clipboard operations
- **System Integration**: Images are copied to your system clipboard for use in other applications

### Screen Sharing
1. Start a video call in Stackfield
2. Click the screen share button
3. Choose from available screens and windows in the picker dialog
4. Click "Share" to start sharing or "Cancel" to abort

### Keyboard Shortcuts
- **F12**: Toggle Developer Tools
- **F5**: Reload application
- **Ctrl+Q** (Cmd+Q on Mac): Quit application
- **Ctrl/Cmd + +/-/0**: Zoom in/out/reset

### Debug Mode
- Go to **Debug → Toggle Debug Mode** in the menu
- Enable for detailed console logging and debugging information
- Disable for clean, quiet operation

## Building for Distribution

To create a distributable version:

```bash
npm run build
```

This will create platform-specific packages in the `dist/` folder.

## Architecture

The application is built with a modular architecture:

```
stackfield-linux-client/
├── main.js                         # Main entry point
├── preload.js                      # Security bridge for IPC
├── src/
│   ├── managers/
│   │   ├── clipboardManager.js     # Clipboard functionality
│   │   ├── debugManager.js         # Debug system
│   │   ├── menuManager.js          # Application menus
│   │   └── notificationManager.js  # Notification monitoring
│   └── screen-sharing/
│       ├── screenSharingManager.js # Screen sharing logic
│       ├── screenPicker.js         # Screen picker dialog
│       └── screenPickerWindow.html # Screen picker UI
├── assets/
│   ├── icon.png                    # Normal state icon
│   └── icon-alert.png             # Alert state icon
├── scripts/
│   ├── install-deps.sh            # Dependency installer
│   ├── stackfield-launcher.sh     # Launcher with checks
│   └── stackfield.sh              # Simple launcher
└── package.json                   # Project configuration
```

## Configuration

The app automatically handles:
- **Single Instance Prevention**: Only one app instance can run
- **External Link Handling**: Non-Stackfield URLs open in default browser
- **Permission Management**: Handles camera, microphone, and screen sharing permissions
- **Cross-Platform Compatibility**: Works on Windows, macOS, and Linux

### Platform-Specific Features

#### macOS
- Automatic permission requests for camera, microphone, and screen recording
- Native menu bar integration
- System Preferences integration for permissions

#### Windows/Linux
- System tray context menus
- Native window controls
- Automatic permission handling

## Icons

Make sure you have these icon files in your project directory:
- `icon.png` - Normal state icon (16x16px recommended for tray)
- `icon-alert.png` - Alert state icon (16x16px recommended for tray)

**Note**: Icons are AI-generated. For commercial use, please replace with your own icons to avoid potential copyright issues.

## Troubleshooting

### Image Clipboard Issues
- **Missing Dependencies**: Install xclip and wl-clipboard system packages
- **Permission Errors**: Ensure the app has permission to access the clipboard
- **Wayland Users**: Make sure wl-clipboard is installed for Wayland support
- **Debug Mode**: Enable debug mode to see detailed clipboard operation logs

### Screen Sharing Issues
- **macOS**: Grant screen recording permission in System Preferences > Security & Privacy > Screen Recording
- **Permission Errors**: Restart the application after granting system permissions
- **No Sources Available**: Check that other applications aren't blocking screen capture

### Debug Mode
- Enable Debug Mode from the menu to see detailed error messages
- Check the console for permission-related issues
- Use `window.testScreenShare()` in DevTools to test screen sharing directly

## Development

### Project Structure
The codebase follows a modular pattern:
- Each feature is separated into its own manager class
- Debug code is isolated and can be toggled on/off
- Clean separation between main process and renderer process logic

### Adding Features
1. Create a new manager class for your feature
2. Initialize it in `main.js`
3. Add any UI components as separate files
4. Update the menu system if needed

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

### Development Guidelines
- Follow the existing modular architecture
- Add debug logging for new features
- Ensure cross-platform compatibility
- Update documentation for new features

## Changelog

### Version 1.1.0
- **NEW**: Fixed image clipboard functionality for Linux
- **NEW**: Automatic clipboard interception for Stackfield images
- **NEW**: System clipboard fallback using xclip/wl-clipboard
- **NEW**: Cross-platform support for X11 and Wayland
- **IMPROVED**: Better error handling and user feedback
- **IMPROVED**: Enhanced debug mode with clipboard logging

### Version 1.0.0
- Advanced screen sharing with visual picker
- Dark theme UI for screen picker
- Right-click tray context menu
- Comprehensive debug system
- Modular architecture refactor
- Keyboard shortcuts and accessibility improvements

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Electron](https://electronjs.org/)
- Designed for [Stackfield](https://www.stackfield.com/)
- Uses native system APIs for screen sharing and notifications
- UI inspired by modern desktop applications

---

*This application is not officially affiliated with Stackfield. It's a community-built desktop wrapper to enhance the Stackfield web experience.*