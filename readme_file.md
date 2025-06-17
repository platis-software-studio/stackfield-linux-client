# Stackfield Desktop App

A lightweight Electron-based desktop application for Stackfield that provides system tray integration and smart notification handling.

## Features

- 🔔 **Smart Notifications**: Visual notification indicators in system tray and taskbar
- 📱 **System Tray Integration**: Minimize to tray, click to show/hide
- 🌐 **External Link Handling**: Opens external links in your default browser
- 🔒 **Single Instance**: Prevents multiple app instances
- ⚡ **Lightweight**: Minimal resource usage
- 🎨 **Dynamic Icons**: Changes tray icon when you have unread messages

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm

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

## Building for Distribution

To create a distributable version:

```bash
npm run build
```

This will create platform-specific packages in the `dist/` folder.

## How it Works

The app loads Stackfield in an Electron window and monitors for:
- Personal message notifications (red badges)
- Page title changes indicating new messages
- Updates the system tray icon to alert you of unread messages

## Configuration

The app automatically:
- Prevents multiple instances
- Hides to system tray when closed
- Opens external links in your default browser
- Flashes the window when new notifications arrive

## Icons

Make sure you have these icon files in your project directory:
- `icon.png` - Normal state icon
- `icon-alert.png` - Alert state icon (when you have notifications)

Please note: Icons are generated with AI. Not sure, if there are copyright issues. If in doubt, Use your own icons.

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Electron](https://electronjs.org/) 
- Designed for [Stackfield](https://www.stackfield.com/)