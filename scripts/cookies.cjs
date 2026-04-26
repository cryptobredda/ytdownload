const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const COOKIES_PATH = path.join(process.cwd(), 'downloads', 'cookies.txt');

function cookiesToNetscape(cookies) {
  let output = '# Netscape HTTP Cookie File\n';
  for (const cookie of cookies) {
    const domain = cookie.domain;
    const flag = domain.startsWith('.') ? 'TRUE' : 'FALSE';
    const cookiePath = cookie.path;
    const secure = cookie.secure ? 'TRUE' : 'FALSE';
    const expires = cookie.expires > 0 ? Math.floor(cookie.expires) : 0;
    const name = cookie.name;
    const value = cookie.value;
    output += `${domain}\t${flag}\t${cookiePath}\t${secure}\t${expires}\t${name}\t${value}\n`;
  }
  return output;
}

async function generateCookies() {
  console.log('[cookies] Generating YouTube cookies via headless browser...');

  let browser = null;

  try {
    browser = await puppeteer.launch({
      executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--no-zygote',
      ],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    );

    await page.goto('https://www.youtube.com', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    await new Promise((r) => setTimeout(r, 3000));

    const cookies = await page.cookies();
    await browser.close();
    browser = null;

    const ytCookies = cookies.filter(
      (c) => c.domain && c.domain.includes('youtube.com')
    );

    if (ytCookies.length === 0) {
      console.log('[cookies] No YouTube cookies obtained');
      return false;
    }

    const dir = path.dirname(COOKIES_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(COOKIES_PATH, cookiesToNetscape(ytCookies), 'utf-8');
    console.log(`[cookies] Saved ${ytCookies.length} cookies`);
    return true;
  } catch (err) {
    console.error('[cookies] Failed:', err.message);
    return false;
  } finally {
    if (browser) {
      try { await browser.close(); } catch {}
    }
  }
}

module.exports = { generateCookies };
