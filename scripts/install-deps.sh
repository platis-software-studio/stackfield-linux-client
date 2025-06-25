#!/bin/bash

# Post-install script for Stackfield Linux Client
# This script installs required clipboard utilities

echo "🔧 Installing Stackfield Linux Client dependencies..."

# Detect the package manager and distribution
if command -v apt-get &> /dev/null; then
    echo "📦 Detected apt package manager (Ubuntu/Debian)"
    sudo apt-get update
    sudo apt-get install -y xclip wl-clipboard
elif command -v dnf &> /dev/null; then
    echo "📦 Detected dnf package manager (Fedora)"
    sudo dnf install -y xclip wl-clipboard
elif command -v yum &> /dev/null; then
    echo "📦 Detected yum package manager (CentOS/RHEL)"
    sudo yum install -y xclip wl-clipboard
elif command -v pacman &> /dev/null; then
    echo "📦 Detected pacman package manager (Arch Linux)"
    sudo pacman -S --noconfirm xclip wl-clipboard
elif command -v zypper &> /dev/null; then
    echo "📦 Detected zypper package manager (openSUSE)"
    sudo zypper install -y xclip wl-clipboard
else
    echo "⚠️  Could not detect package manager."
    echo "   Please install 'xclip' and 'wl-clipboard' manually:"
    echo "   - Ubuntu/Debian: sudo apt install xclip wl-clipboard"
    echo "   - Fedora: sudo dnf install xclip wl-clipboard"
    echo "   - Arch: sudo pacman -S xclip wl-clipboard"
    echo "   - openSUSE: sudo zypper install xclip wl-clipboard"
    exit 1
fi

echo "✅ Dependencies installed successfully!"
echo "🚀 You can now run Stackfield Linux Client"
