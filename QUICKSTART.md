# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Local Development

#### Prerequisites
- Node.js 18+ installed
- System dependencies: `yt-dlp` and `ffmpeg`

#### Step 1: Install System Dependencies

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y yt-dlp ffmpeg
```

**macOS:**
```bash
brew install yt-dlp ffmpeg
```

**Windows (with Chocolatey):**
```bash
choco install yt-dlp ffmpeg
```

#### Step 2: Install & Run

```bash
# Run the installation script
./install.sh

# Or manually install dependencies
npm install

# Start development server
npm run dev
```

#### Step 3: Open in Browser

Navigate to: **http://localhost:3000**

---

## 📖 How to Use

### Download a Single Video

1. Copy YouTube video URL
2. Paste into the input field
3. Click "Fetch Info"
4. Video preview will appear
5. Choose resolution (or keep "Best Available")
6. Click "Download"
7. Wait for download to complete
8. Click "Download" button when it appears in "Completed" section

### Download Audio Only (MP3)

1. Follow steps 1-4 above
2. Click "Audio (MP3)" button
3. Click "Download"
4. Wait for completion
5. Download the MP3 file

### Download a Playlist

1. Copy YouTube playlist URL
2. Paste into the input field
3. Click "Fetch Info"
4. Playlist preview will show all videos
5. Choose video or audio mode
6. Click "Download Playlist"
7. Watch progress as each video downloads
8. When complete, download the ZIP file containing all videos

---

## 🐳 Docker Deployment

### Quick Deploy

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Access at http://localhost:3000
```

### Update

```bash
docker-compose down
docker-compose up -d --build
```

---

## ☁️ Coolify Deployment

### Method 1: Git Repository (Easiest)

1. Push code to Git repository
2. In Coolify:
   - Add Resource → Git Repository
   - Enter your repo URL
   - Coolify auto-detects Dockerfile
   - Click Deploy
3. Done! 🎉

### Method 2: Docker Compose

1. In Coolify:
   - Add Resource → Docker Compose
   - Upload `docker-compose.yml`
   - Deploy

**See [COOLIFY.md](COOLIFY.md) for detailed instructions**

---

## 🎨 Features Overview

### ✅ What's Included

- **Video Downloads**: Any resolution from 144p to 4K
- **Audio Extraction**: High-quality MP3 conversion
- **Playlist Support**: Download entire playlists as ZIP
- **Live Progress**: Real-time download progress bars
- **Modern UI**: Beautiful dark theme with gradients
- **Responsive**: Works on desktop and mobile
- **WebSocket Updates**: Real-time task updates
- **Docker Ready**: One-command deployment

### 🎯 Supported Platforms

- YouTube videos
- YouTube playlists
- Any URL supported by yt-dlp

---

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/info` | POST | Get video/playlist info |
| `/api/download` | POST | Start download |
| `/api/tasks` | GET | Get all tasks |
| `/api/download-file` | GET | Download completed file |

---

## 📁 Project Structure

```
ytdownload/
├── app/                    # Next.js app directory
│   ├── api/                # API routes
│   └── page.tsx            # Main page
├── components/             # React components
│   ├── VideoPreview.tsx    # Video preview
│   └── DownloadTasks.tsx   # Task list
├── lib/                    # Core libraries
│   ├── ytdlp.ts            # yt-dlp integration
│   ├── websocket.ts        # WebSocket handling
│   └── types.ts            # TypeScript types
├── downloads/              # Completed downloads
├── temp/                   # Temporary files
├── Dockerfile              # Docker config
└── docker-compose.yml      # Docker Compose
```

---

## 🆘 Troubleshooting

### Build Fails
```bash
# Clean and reinstall
rm -rf node_modules .next
npm install
npm run build
```

### yt-dlp Errors
```bash
# Update yt-dlp
pip install --upgrade yt-dlp
# or
brew upgrade yt-dlp
```

### Port Already in Use
```bash
# Change port in package.json or set env
PORT=3001 npm run dev
```

### Download Stuck
- Check if URL is valid
- Ensure yt-dlp works: `yt-dlp --version`
- Check disk space
- View logs: `docker-compose logs`

---

## 🔒 Security Notes

- ⚠️ **For private/local use only**
- Do not expose to public internet without authentication
- Consider adding auth middleware for production
- Regularly update yt-dlp for security patches

---

## 📝 Next Steps

- [ ] Add user authentication
- [ ] Add download history
- [ ] Add quality presets
- [ ] Add subtitle download support
- [ ] Add batch URL import

---

## 💡 Tips

1. **Faster Downloads**: Use wired internet connection
2. **Save Space**: Delete files from `downloads/` folder regularly
3. **Playlist Limits**: Large playlists may take time - be patient!
4. **Browser**: Chrome/F recommended for best experience

---

## 📚 Resources

- [yt-dlp Documentation](https://github.com/yt-dlp/yt-dlp)
- [Next.js Documentation](https://nextjs.org/docs)
- [Coolify Documentation](https://coolify.io/docs)

---

**Enjoy your personal YTDownload platform! 🎉**
