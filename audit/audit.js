/*
 * Fast responsive audit: capture viewport screenshots at scroll positions
 * and detect layout issues across many breakpoints. Runs in parallel.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const URL = process.env.AUDIT_URL || 'http://localhost:8080/';
const OUT = path.join(__dirname, 'screenshots');
const REPORT = path.join(__dirname, 'report.json');
const EXEC = process.env.CHROME_BIN || '/Users/bglasser/Library/Caches/ms-playwright/chromium-1200/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

const VIEWPORTS = [
    { name: '320',  w: 320,  h: 568 },
    { name: '360',  w: 360,  h: 780 },
    { name: '375',  w: 375,  h: 812 },
    { name: '414',  w: 414,  h: 896 },
    { name: '480',  w: 480,  h: 900 },
    { name: '600',  w: 600,  h: 960 },
    { name: '768',  w: 768,  h: 1024 },
    { name: '1024', w: 1024, h: 768 },
    { name: '1280', w: 1280, h: 800 },
    { name: '1440', w: 1440, h: 900 },
    { name: '1920', w: 1920, h: 1080 },
    { name: '2560', w: 2560, h: 1440 },
];

const SECTIONS = ['#hero', '.bulb-banner.banner-1', '#schedule', '.bulb-banner.banner-2', '#rsvp', '#hotel', '#attire', '#gifts', '#footer'];

fs.mkdirSync(OUT, { recursive: true });

async function auditOne(browser, vp) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const consoleErrors = [];
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    page.on('pageerror', (e) => consoleErrors.push('PAGEERROR: ' + e.message));

    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
        const l = document.getElementById('loader');
        if (l) l.style.display = 'none';
        document.body.classList.add('loaded');
        const style = document.createElement('style');
        style.textContent = '*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition:none!important}';
        document.head.appendChild(style);
    });
    await page.waitForTimeout(300);

    const info = await page.evaluate(() => {
        const html = document.documentElement;
        const vw = window.innerWidth;
        const docW = Math.max(html.scrollWidth, document.body.scrollWidth);
        const overflowers = [];
        function describe(el) {
            const r = el.getBoundingClientRect();
            return { tag: el.tagName.toLowerCase(), cls: (el.className?.toString?.() || '').slice(0, 80), x: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width) };
        }
        for (const el of document.querySelectorAll('*')) {
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) continue;
            const cs = getComputedStyle(el);
            if (cs.visibility === 'hidden' || cs.display === 'none') continue;
            if (r.right > vw + 2 || r.left < -2) overflowers.push(describe(el));
        }
        // find tiny text
        const tinyText = [];
        for (const el of document.querySelectorAll('p, h1, h2, h3, h4, span, a, button, li')) {
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) continue;
            if (!el.textContent?.trim()) continue;
            const cs = getComputedStyle(el);
            if (cs.visibility === 'hidden' || cs.display === 'none') continue;
            const fs = parseFloat(cs.fontSize);
            if (fs < 11 && r.width > 20) tinyText.push({ ...describe(el), fontSize: fs, sample: el.textContent.trim().slice(0, 40) });
        }
        return { vw, docW, overflow: docW > vw, overflowCount: overflowers.length, overflowers: overflowers.slice(0, 30), tinyText: tinyText.slice(0, 15), scrollHeight: html.scrollHeight };
    });

    const vpDir = path.join(OUT, vp.name);
    fs.mkdirSync(vpDir, { recursive: true });

    // Take viewport-only screenshots scrolling through the page
    const scrollH = info.scrollHeight;
    const step = Math.min(vp.h - 80, scrollH);
    let idx = 0;
    for (let y = 0; y < scrollH; y += step) {
        await page.evaluate((yy) => window.scrollTo(0, yy), y);
        await page.waitForTimeout(150);
        try {
            await page.screenshot({ path: path.join(vpDir, `scroll-${String(idx).padStart(2, '0')}.png`), timeout: 15000, animations: 'disabled' });
        } catch (e) { /* ignore */ }
        idx++;
        if (idx > 20) break;
    }

    await ctx.close();
    console.log(`[${vp.name}] vw=${info.vw} docW=${info.docW} overflow=${info.overflow} overflowElts=${info.overflowCount} tinyText=${info.tinyText.length} H=${info.scrollHeight}`);
    return { viewport: vp, ...info, consoleErrors: consoleErrors.slice(0, 5) };
}

async function run() {
    const browser = await chromium.launch({ executablePath: EXEC });
    const report = {};
    // Run 4 in parallel
    const batches = [];
    const concurrency = 4;
    for (let i = 0; i < VIEWPORTS.length; i += concurrency) {
        const chunk = VIEWPORTS.slice(i, i + concurrency);
        const results = await Promise.all(chunk.map((vp) => auditOne(browser, vp).catch((e) => ({ viewport: vp, error: e.message }))));
        for (const r of results) report[r.viewport.name] = r;
    }
    await browser.close();
    fs.writeFileSync(REPORT, JSON.stringify(report, null, 2));
    console.log('Done.');
}

run().catch((e) => { console.error(e); process.exit(1); });
