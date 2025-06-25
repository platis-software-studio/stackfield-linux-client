#!/bin/bash

# Simple post-install script for Stackfield Linux Client
# This script only updates desktop integration (no package installation)

echo "🔧 Setting up Stackfield Linux Client..."

# Function to update desktop database
update_desktop_database() {
    if command -v update-desktop-database &> /dev/null; then
        echo "🖥️  Updating desktop database..."
        update-desktop-database /usr/share/applications/ 2>/dev/null || true
    fi
}

# Function to update icon cache
update_icon_cache() {
    if command -v gtk-update-icon-cache &> /dev/null; then
        echo "🎨 Updating icon cache..."
        gtk-update-icon-cache -f -t /usr/share/icons/hicolor/ 2>/dev/null || true
    fi
}

# Update desktop integration only
update_desktop_database
update_icon_cache

echo "✅ Desktop integration updated!"
echo "🚀 Stackfield Linux Client is ready to use!"
echo ""
echo "💡 Note: Please install clipboard utilities manually if needed:"
echo "   sudo apt install xclip wl-clipboard"
