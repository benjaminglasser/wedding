/*
 * Responsive audit: capture full-page screenshots and detect layout issues
 * (horizontal overflow, elements wider than viewport, tiny text, etc.)
 * across many breakpoints.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const URL = process.env.AUDIT_URL || 'http://localhost:8080/';
const OUT = path.join(__dirname, 'screenshots');
const REPORT = path.join(__dirname, 'report.json');

const VIEWPORTS = [
    { name: '320x568-iphone-se',       w: 320,  h: 568 },
    { name: '360x780-small-android',    w: 360,  h: 780 },
    { name: '375x812-iphone-x',         w: 375,  h: 812 },
    { name: '414x896-iphone-xr',        w: 414,  h: 896 },
    { name: '480x900-phablet',          w: 480,  h: 900 },
    { name: '600x960-small-tablet',     w: 600,  h: 960 },
    { name: '768x1024-tablet',          w: 768,  h: 1024 },
    { name: '820x1180-tablet-landscape',w: 820,  h: 1180 },
    { name: '1024x768-landscape',       w: 1024, h: 768 },
    { name: '1280x800-laptop',          w: 1280, h: 800 },
    { name: '1440x900-desktop',         w: 1440, h: 900 },
    { name: '1600x1000-desktop',        w: 1600, h: 1000 },
    { name: '1920x1080-fhd',            w: 1920, h: 1080 },
    { name: '2560x1440-qhd',            w: 2560, h: 1440 },
    { name: '3440x1440-ultrawide',      w: 3440, h: 1440 },
];

fs.mkdirSync(OUT, { recursive: true });

async function run() {
    const EXEC = process.env.CHROME_BIN || '/Users/bglasser/Library/Caches/ms-playwright/chromium-1200/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
    const browser = await chromium.launch({ executablePath: EXEC });
    const report = {};

    for (const vp of VIEWPORTS) {
        const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1 });
        const page = await ctx.newPage();
        const consoleErrors = [];
        page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
        page.on('pageerror', (e) => consoleErrors.push('PAGEERROR: ' + e.message));

        await page.goto(URL, { waitUntil: 'networkidle' });
        // wait a bit for loader and animations
        await page.waitForTimeout(2500);
        // Dismiss loader if it is still visible
        try {
            await page.evaluate(() => {
                const l = document.getElementById('loader');
                if (l) l.style.display = 'none';
                document.body.classList.add('loaded');
            });
        } catch {}
        await page.waitForTimeout(500);

        // Layout info
        const info = await page.evaluate(() => {
            const html = document.documentElement;
            const body = document.body;
            const vw = window.innerWidth;
            const docW = Math.max(html.scrollWidth, body.scrollWidth);
            const overflowers = [];

            function describe(el) {
                const r = el.getBoundingClientRect();
                return {
                    tag: el.tagName.toLowerCase(),
                    id: el.id || undefined,
                    cls: el.className && el.className.toString ? el.className.toString().slice(0, 120) : '',
                    x: Math.round(r.left),
                    right: Math.round(r.right),
                    w: Math.round(r.width),
                    h: Math.round(r.height),
                };
            }

            const all = document.querySelectorAll('*');
            for (const el of all) {
                const rect = el.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) continue;
                // Skip hidden elements
                const cs = window.getComputedStyle(el);
                if (cs.visibility === 'hidden' || cs.display === 'none' || cs.opacity === '0') continue;
                // Ignore aria-hidden decorative layers that are visually masked anyway
                const isDecorative = el.getAttribute('aria-hidden') === 'true';
                if (rect.right > vw + 2 || rect.left < -2) {
                    overflowers.push({ ...describe(el), decorative: isDecorative });
                }
            }

            // Only keep top-most offenders (deepest that still exceed)
            // Deduplicate by keeping those not contained by another overflower of greater width
            const simplified = overflowers
                .sort((a, b) => (b.right - b.x) - (a.right - a.x))
                .slice(0, 60);

            // Check for tiny clickable/CTA targets (< 30x30)
            const tinyTargets = [];
            for (const el of document.querySelectorAll('a, button, input[type=button], input[type=submit], [role=button]')) {
                const cs = window.getComputedStyle(el);
                if (cs.display === 'none' || cs.visibility === 'hidden') continue;
                const r = el.getBoundingClientRect();
                if (r.width > 0 && r.height > 0 && (r.width < 30 || r.height < 30)) {
                    tinyTargets.push(describe(el));
                }
            }

            return {
                vw,
                docW,
                hasHorizontalOverflow: docW > vw,
                overflowCount: overflowers.length,
                overflowers: simplified,
                tinyTargets,
                scrollHeight: html.scrollHeight,
            };
        });

        const file = path.join(OUT, `${vp.name}.png`);
        try {
            await page.screenshot({ path: file, fullPage: true, timeout: 60000, animations: 'disabled' });
        } catch (e) {
            console.warn('screenshot failed', vp.name, e.message);
        }

        report[vp.name] = { viewport: vp, ...info, consoleErrors };
        console.log(`[${vp.name}] vw=${info.vw} docW=${info.docW} overflow=${info.hasHorizontalOverflow} overflowCount=${info.overflowCount} scrollH=${info.scrollHeight}`);

        await ctx.close();
    }

    await browser.close();
    fs.writeFileSync(REPORT, JSON.stringify(report, null, 2));
    console.log('Wrote', REPORT);
}

run().catch((e) => { console.error(e); process.exit(1); });
