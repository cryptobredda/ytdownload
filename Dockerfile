FROM node:20-slim

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

RUN curl -fsSL https://deno.land/install.sh | sh && \
    mv /root/.deno/bin/deno /usr/local/bin/deno && \
    rm -rf /root/.deno

RUN yt-dlp --version && ffmpeg -version | head -1 && deno --version && \
    yt-dlp --remote-components ejs:github --skip-download "https://www.youtube.com/watch?v=dQw4w9WgXcQ" 2>/dev/null || true

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN mkdir -p downloads temp

RUN npm run build

RUN npm prune --omit=dev

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
