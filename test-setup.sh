#!/bin/bash

echo "🧪 Testing YTDownload Platform"
echo "================================"
echo ""

# Test 1: Check yt-dlp
echo "Test 1: Checking yt-dlp..."
if command -v yt-dlp &> /dev/null; then
    echo "✅ yt-dlp found: $(yt-dlp --version)"
else
    echo "❌ yt-dlp NOT found!"
    echo "   Please install: sudo pacman -S yt-dlp ffmpeg"
    exit 1
fi

# Test 2: Check ffmpeg
echo ""
echo "Test 2: Checking ffmpeg..."
if command -v ffmpeg &> /dev/null; then
    echo "✅ ffmpeg found: $(ffmpeg -version | head -1)"
else
    echo "⚠️  ffmpeg NOT found (optional, needed for MP3)"
fi

# Test 3: Test yt-dlp with your URL
echo ""
echo "Test 3: Testing with your YouTube URL..."
URL="https://www.youtube.com/watch?v=m_qlgFQs7E4"
echo "URL: $URL"
echo ""
echo "Fetching video info..."
yt-dlp --dump-json --no-playlist "$URL" | jq '{title: .title, uploader: .uploader, duration: .duration}' 2>/dev/null || {
    echo "❌ Failed to fetch video info"
    exit 1
}

echo ""
echo "================================"
echo "✅ All tests passed!"
echo ""
echo "You can now run: npm run dev"
echo "And test the web interface!"
