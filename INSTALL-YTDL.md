# 🚨 Quick Fix: Install yt-dlp

## The Problem
The error shows that `yt-dlp` is not installed on your system. This is required for the application to work.

## The Solution

You're on **Arch Linux**, so you need to run this command:

```bash
sudo pacman -S yt-dlp ffmpeg
```

This will install both:
- **yt-dlp** - The YouTube download engine
- **ffmpeg** - Required for audio extraction (MP3)

## After Installation

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Test with your URL:
   ```
   https://www.youtube.com/watch?v=m_qlgFQs7E4&list=RDm_qlgFQs7E4&start_radio=1
   ```

## Alternative Installation Methods

If pacman doesn't work:

### Method 1: Using pip (Python)
```bash
pip install --user --break-system-packages yt-dlp
```

### Method 2: Download directly
```bash
# Download yt-dlp
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o ~/.local/bin/yt-dlp
chmod +x ~/.local/bin/yt-dlp

# Make sure ~/.local/bin is in your PATH
export PATH="$HOME/.local/bin:$PATH"
```

## Verify Installation

After installing, verify:
```bash
yt-dlp --version
ffmpeg -version
```

Both should show version numbers.

## WebSocket Error

The WebSocket error is **harmless** - it's just a fallback mechanism. The app works fine with polling (which is the primary method now).

---

**TL;DR**: Run `sudo pacman -S yt-dlp ffmpeg` and you're good to go! 🚀
