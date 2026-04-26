# 🚀 Coolify Deployment Guide

## Overview

This application is **fully Dockerized** and ready for Coolify deployment. All dependencies (yt-dlp, ffmpeg) are installed **inside the Docker container**, so you don't need to install anything on your server.

---

## 📋 Prerequisites

- Coolify instance running
- Git repository (GitHub, GitLab, etc.)
- At least 2GB RAM recommended
- At least 10GB disk space for downloads

---

## 🎯 Deployment Steps

### Method 1: Git Repository (Recommended)

#### Step 1: Push to Git Repository

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Create .gitignore to avoid committing unnecessary files
cat >> .gitignore << EOF
node_modules/
.next/
downloads/
temp/
*.log
.env
.env.local
EOF

# Commit
git commit -m "Initial commit - YTDownload Platform"

# Add remote and push
git remote add origin <your-git-repo-url>
git push -u origin main
```

#### Step 2: Add to Coolify

1. **Open Coolify Dashboard**
2. Click **"Add Resource"**
3. Select **"Git Repository"**
4. Fill in:
   - **Repository URL**: Your Git repo URL
   - **Branch**: `main`
   - **Build Pack**: Select `Dockerfile`
   - **Dockerfile location**: `Dockerfile` (auto-detected)

#### Step 3: Configure Environment

In Coolify service settings:

1. **Environment Variables** (optional):
   ```
   NODE_ENV=production
   PORT=3000
   ```

2. **Storage** (IMPORTANT):
   - Add persistent volume: `/app/downloads`
   - Add persistent volume: `/app/temp`
   
   This ensures your downloads persist across restarts and rebuilds.

3. **Ports**:
   - Internal Port: `3000`
   - Public Port: Map to your desired external port

#### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build (first build takes ~5-10 minutes due to yt-dlp and ffmpeg installation)
3. Once deployed, access via your Coolify-assigned URL

---

### Method 2: Docker Compose in Coolify

If you prefer Docker Compose:

1. **In Coolify**:
   - Add Resource → Docker Compose
   - Select `docker-compose.yml` from your repository

2. **Configure volumes**:
   - Coolify will auto-detect volumes from docker-compose.yml
   - Ensure persistent storage is enabled

3. **Deploy**

---

### Method 3: Direct Docker (Self-Hosted Server)

If you have direct server access:

```bash
# Clone your repository
git clone <your-repo-url>
cd ytdownload

# Build and run
docker-compose up -d --build

# Check logs
docker-compose logs -f

# Access at http://your-server-ip:3000
```

---

## 🔍 Build Process

When Coolify builds your app, here's what happens:

1. **Base Image**: Node.js 20 on Debian Slim
2. **Install Dependencies**:
   - Python 3
   - pip3
   - ffmpeg
   - yt-dlp (via pip)
3. **Install Node Dependencies**: `npm ci`
4. **Build Next.js**: `npm run build`
5. **Start**: `npm start` on port 3000

**Build time**: ~5-10 minutes on first build

---

## ✅ Verification

After deployment, verify everything works:

### 1. Check Health

```bash
# Via Coolify dashboard or curl
curl https://your-domain.com/api/tasks
```

Should return: `{"tasks":[]}`

### 2. Test Video Info

```bash
curl -X POST https://your-domain.com/api/info \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

Should return video metadata.

### 3. Test in Browser

1. Open your Coolify-assigned URL
2. Paste a YouTube URL
3. Click "Fetch Info"
4. If it works, yt-dlp is running correctly!

---

## 🐛 Troubleshooting

### Build Fails

**Problem**: Build timeout or fails during yt-dlp installation

**Solution**:
1. Check build logs in Coolify
2. Increase build timeout if needed (Coolify settings)
3. Retry build

### yt-dlp Not Working

**Problem**: "yt-dlp command not found" in production

**Solution**:
```bash
# Rebuild with no cache
docker-compose build --no-cache
docker-compose up -d
```

In Coolify: Click "Rebuild" with "No Cache" option

### Permission Issues

**Problem**: Can't write to downloads folder

**Solution**:
1. Ensure volumes are mounted correctly
2. Check volume permissions in Coolify

### Port Already in Use

**Problem**: Port 3000 conflict

**Solution**:
- Change PORT environment variable in Coolify
- Or change Internal Port mapping

---

## 📊 Resource Requirements

### Minimum
- **CPU**: 1 core
- **RAM**: 1GB
- **Disk**: 5GB (for app + temp files)

### Recommended
- **CPU**: 2 cores
- **RAM**: 2GB+
- **Disk**: 20GB+ (depending on download usage)

---

## 🔒 Security Notes

1. **Authentication**: This app has NO authentication by default
   - Add authentication before exposing to public internet
   - Or keep it behind VPN/internal network

2. **Download Limits**: Consider adding:
   - Rate limiting
   - Max file size limits
   - User quotas

3. **Storage Management**:
   - Regularly clean up old downloads
   - Monitor disk usage
   - Set up automated cleanup scripts

---

## 🔄 Updates

To update the application:

```bash
# Make your changes
git add .
git commit -m "Update description"
git push

# In Coolify
# - Auto-deploy if webhook is configured
# - Or manually click "Deploy"
```

---

## 📈 Monitoring

### Via Coolify Dashboard
- View real-time logs
- Monitor resource usage
- Check health status

### Via Commands
```bash
# View logs
docker-compose logs -f

# Check container stats
docker stats

# Check yt-dlp version inside container
docker-compose exec ytdownload yt-dlp --version
```

---

## 🎉 Success Checklist

After deployment, verify:

- [ ] App builds successfully in Coolify
- [ ] Health check returns 200
- [ ] Can paste YouTube URL and fetch info
- [ ] Video preview appears
- [ ] Can download single video
- [ ] Can download MP3
- [ ] Can download playlist
- [ ] Progress bars work
- [ ] Downloaded files are accessible

---

## 📞 Need Help?

- **Coolify Docs**: https://coolify.io/docs
- **yt-dlp Issues**: https://github.com/yt-dlp/yt-dlp
- **Docker Docs**: https://docs.docker.com

---

**Your YTDownload platform is 100% self-contained and ready to deploy!** 🚀
