#!/bin/bash

echo "🎬 YTDownload Platform - Installation Script"
echo "============================================"
echo ""

# Check if yt-dlp is installed
if ! command -v yt-dlp &> /dev/null; then
    echo "⚠️  yt-dlp not found. Installing..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update && sudo apt-get install -y yt-dlp
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install yt-dlp
    else
        echo "Please install yt-dlp manually: https://github.com/yt-dlp/yt-dlp#installation"
        exit 1
    fi
else
    echo "✅ yt-dlp already installed"
fi

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  ffmpeg not found. Installing..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get update && sudo apt-get install -y ffmpeg
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install ffmpeg
    else
        echo "Please install ffmpeg manually: https://ffmpeg.org/download.html"
        exit 1
    fi
else
    echo "✅ ffmpeg already installed"
fi

# Install Node dependencies
echo ""
echo "📦 Installing Node dependencies..."
npm install

echo ""
echo "✅ Installation complete!"
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:3000"
echo ""
