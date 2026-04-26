# YTDownload Platform

A modern, self-hosted YouTube download platform built with Next.js and yt-dlp. **Fully Dockerized and ready for Coolify deployment.**

## ✨ Features

- 🎥 **Single Video Downloads** - Download any YouTube video in multiple resolutions
- 🎵 **Audio Extraction** - Extract audio as MP3 from any video
- 📋 **Playlist Support** - Download entire playlists and package as ZIP
- 📊 **Real-time Progress** - Track download progress with live progress bars
- 🎨 **Modern UI** - Clean, responsive interface with dark theme
- 🐳 **Docker Ready** - 100% self-contained, no host dependencies

## 🚀 Quick Deploy

### Coolify (Recommended)

1. Push to Git repository
2. Add to Coolify → Select Dockerfile
3. Deploy!

**All dependencies (yt-dlp, ffmpeg) are included in the Docker image.**

### Docker Compose

```bash
docker-compose up -d --build
```

Then access: http://localhost:3000

### Local Development

```bash
npm install
npm run dev
```

**Note**: For local development, you'll need yt-dlp installed on your system:
- Arch Linux: `sudo pacman -S yt-dlp ffmpeg`
- Ubuntu/Debian: `sudo apt-get install yt-dlp ffmpeg`
- macOS: `brew install yt-dlp ffmpeg`

## Usage

1. **Single Video**:
   - Paste YouTube URL
   - Click "Fetch Info"
   - Select resolution or MP3
   - Click "Download"

2. **Playlist**:
   - Paste playlist URL
   - Click "Fetch Info"
   - Choose video/audio
   - Click "Download Playlist"
   - Wait for all videos to download
   - Download the ZIP file

## API Endpoints

- `POST /api/info` - Get video/playlist information
- `POST /api/download` - Start download (single or playlist)
- `GET /api/tasks` - Get all download tasks
- `GET /api/download-file?path=<path>` - Download completed file

## Project Structure

```
ytdownload/
├── app/
│   ├── api/              # API routes
│   │   ├── info/         # Video info endpoint
│   │   ├── download/     # Download endpoint
│   │   ├── tasks/        # Tasks endpoint
│   │   └── download-file/ # File download endpoint
│   ├── page.tsx          # Main page
│   └── layout.tsx        # Root layout
├── components/
│   ├── VideoPreview.tsx  # Video preview component
│   └── DownloadTasks.tsx # Download tasks list
├── lib/
│   ├── ytdlp.ts          # yt-dlp integration
│   ├── websocket.ts      # WebSocket handling
│   └── types.ts          # TypeScript types
├── downloads/            # Completed downloads
├── temp/                 # Temporary files
├── Dockerfile            # Docker configuration
└── docker-compose.yml    # Docker Compose configuration
```

## Configuration

Environment variables (optional):

```env
PORT=3000
NODE_ENV=production
```

## License

MIT

## Notes

- This platform is for personal use only
- Respect copyright and terms of service
- Downloaded content should comply with local laws
