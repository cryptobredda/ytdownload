const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

async function refreshCookies() {
  try {
    const { generateCookies } = require('./scripts/cookies.cjs');
    await generateCookies();
  } catch (err) {
    console.error('[cookies] Auto-generation failed:', err.message);
  }
}

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const PORT = process.env.PORT || 3000;

  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
    console.log(`> WebSocket support available via polling fallback`);

    refreshCookies();

    setInterval(refreshCookies, 4 * 60 * 60 * 1000);
  });
});
