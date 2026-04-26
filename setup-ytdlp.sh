#!/bin/bash

# Installation script for yt-dlp on Arch Linux
echo "Installing yt-dlp and ffmpeg..."

# Try different methods
if command -v pacman &> /dev/null; then
    echo "Using pacman to install..."
    sudo pacman -S --noconfirm yt-dlp ffmpeg
elif command -v pipx &> /dev/null; then
    echo "Using pipx to install..."
    pipx install yt-dlp
else
    echo "Installing via pip (user)..."
    pip install --user --break-system-packages yt-dlp 2>/dev/null || pip install --user yt-dlp
fi

echo ""
echo "Checking installation..."
yt-dlp --version || echo "yt-dlp not found in PATH"
ffmpeg -version | head -1 || echo "ffmpeg not found"

echo ""
echo "If installation failed, please run manually:"
echo "  sudo pacman -S yt-dlp ffmpeg"
