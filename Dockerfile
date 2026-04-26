# Use Node.js 20 with Debian (not Alpine for better compatibility)
FROM node:20-slim

# Install Python, yt-dlp, ffmpeg, curl (for deno), unzip
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    unzip && \
    pip3 install --break-system-packages yt-dlp && \
    rm -rf /var/lib/apt/lists/* /root/.cache/pip && \
    ln -sf /usr/bin/python3 /usr/bin/python

# Install deno (required by yt-dlp for YouTube extraction)
RUN curl -fsSL https://deno.land/install.sh | sh && \
    mv /root/.deno/bin/deno /usr/local/bin/deno && \
    rm -rf /root/.deno

# Verify installations and pre-download EJS remote components for yt-dlp
RUN yt-dlp --version && ffmpeg -version | head -1 && deno --version && \
    yt-dlp --remote-components ejs:github --skip-download "https://www.youtube.com/watch?v=dQw4w9WgXcQ" 2>/dev/null || true

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (needed for build)
RUN npm ci

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p downloads temp

# Build the application
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --omit=dev

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
