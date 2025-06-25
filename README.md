# Stackfield Linux Client

An Electron-based desktop application for Stackfield that provides native Linux integration with advanced notification features, screen sharing capabilities, and system tray integration.

## Features

### Notification System
- **Visual Tray Icon Alerts**: System tray icon changes between normal and alert states
- **Taskbar Icon Flashing**: Window flashes in taskbar when new messages arrive
- **Desktop Notifications**: Native Linux notifications for new messages
- **Dynamic Tray Tooltips**: Tooltip updates to show notification status
- **Auto-Detection**: Automatically detects personal messages and direct messages

### Screen Sharing
- Full desktop screen sharing support
- Individual window sharing
- Optimized for Stackfield's collaboration features

### System Integration
- **System Tray**: Minimizes to tray with right-click context menu
- **Single Instance**: Prevents multiple app instances
- **Proper Quit Behavior**: Clean exit via menu, tray, or Ctrl+Q
- **Linux Desktop Integration**: Proper Window Class and desktop file integration

### Enhanced Features
- Clipboard handling for better copy/paste experience
- External link handling (opens in system browser)
- Zoom controls (Ctrl +, Ctrl -, Ctrl 0)
- DevTools access for debugging
- Permission management for camera, microphone, and screen capture

## Installation

### Prerequisites
- Node.js (v16 or later)
- npm
- Linux desktop environment
- Required system packages: `xclip`, `wl-clipboard`

### From DEB Package (Recommended)

1. **Download the latest DEB package** from the releases section
2. **Install the package**:
   ```bash
   sudo dpkg -i stackfield-electron_*.deb
   ```
3. **Install dependencies** (if needed):
   ```bash
   sudo apt install -f
   ```
4. **Launch the application**:
   - From Applications menu: Look for "Stackfield (Electron)"
   - From terminal: `/opt/Stackfield/stackfield-electron`

### From Source

1. **Clone the repository**:
   ```bash
   git clone https://github.com/platis-software-studio/stackfield-linux-client.git
   cd stackfield-linux-client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run in development mode**:
   ```bash
   npm start
   ```

4. **Build DEB package**:
   ```bash
   npm run build:linux
   ```

## Usage

### System Tray Features
- **Left Click**: Toggle window visibility
- **Right Click**: Access context menu (Show, Hide, Quit)
- **Icon States**: 
  - Normal: Default Stackfield icon
  - Alert: Red alert icon when new messages arrive
  - Tooltip: Shows "You have new messages!" during alerts

### Notification Behavior
The app automatically monitors for:
- Direct messages (DMs)
- Personal notifications
- Red badge indicators in Stackfield interface

When notifications are detected:
1. Tray icon changes to alert state
2. Taskbar icon flashes
3. Desktop notification appears
4. Tray tooltip updates

### Keyboard Shortcuts
- **Ctrl+Q**: Quit application
- **F5**: Reload page
- **F12**: Toggle DevTools
- **Ctrl +/-/0**: Zoom in/out/reset

## Building

### Build Commands
```bash
# Build for Linux only
npm run build:linux

# Build for all platforms
npm run build:all

# Development with logging
npm run dev
```

### Build Configuration
The app uses electron-builder with the following targets:
- **DEB Package**: For Debian/Ubuntu distributions
- **AppImage**: Portable Linux application

## Technical Details

### Desktop Integration
- **Window Class**: `stackfield-electron`
- **Desktop File**: Installed to `/usr/share/applications/`
- **Icons**: Multiple sizes installed to `/usr/share/icons/hicolor/`
- **Binary Location**: `/opt/Stackfield/stackfield-electron`

### Notification Detection
The app uses JavaScript injection to monitor Stackfield's DOM for:
- `span.SpnGroupUnreaded.SpnGroupRed` elements (red notification badges)
- Badge text content and visibility
- Page title changes for fallback detection

### File Structure
```
├── main.js                 # Main Electron process
├── preload.js             # Preload script for security
├── assets/                # Icons and static assets
├── src/
│   ├── managers/          # Feature managers
│   │   ├── notificationManager.js
│   │   ├── menuManager.js
│   │   ├── debugManager.js
│   │   └── clipboardManager.js
│   └── screen-sharing/    # Screen sharing implementation
└── scripts/               # Build and installation scripts
```

## Troubleshooting

### App Won't Start
- Check if dependencies are installed: `xclip`, `wl-clipboard`
- Verify Node.js version: `node --version` (should be v16+)
- Try starting from terminal to see error messages

### Notifications Not Working
- Ensure you're logged into Stackfield
- Check if notification permissions are granted
- Verify tray icon is visible in system tray

### System Tray Icon Missing
- Some desktop environments require tray icon extensions
- Check your desktop environment's tray icon settings
- Try logging out and back in after installation

### DEB Package Issues
```bash
# Remove old installation
sudo dpkg -r stackfield-electron

# Install with dependency resolution
sudo apt install ./stackfield-electron_*.deb
```

## Development

### Prerequisites for Development
```bash
# Install system dependencies
sudo apt install build-essential git nodejs npm

# Install Electron globally (optional)
npm install -g electron
```

### Development Workflow
1. Make changes to source files
2. Test with `npm start`
3. Build with `npm run build:linux`
4. Test installation with generated DEB package

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on Linux
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and feature requests, please use the GitHub issue tracker.

## Changelog

### Version 1.1.2
- Fixed taskbar icon notifications for all Linux desktop environments
- Added dynamic tray tooltips
- Improved desktop notifications
- Enhanced quit functionality
- Better icon handling in packaged applications
- Proper Window Class integration for Cinnamon/GNOME/KDE

### Version 1.1.1
- Added notification detection system
- Implemented tray icon functionality  
- Basic screen sharing support

### Version 1.0.0
- Initial release
- Basic Electron wrapper for Stackfield
