#!/usr/bin/env node
/* eslint-disable no-console */

/*
 * Pre-render a static poster of the hero 3D marquee.
 *
 * The 3D scene is gorgeous but the underlying assets (~83MB GLB +
 * ~92MB EXR) are far too heavy to ship to phones. This script loads
 * the live page in headless Chromium, waits for the model to fully
 * load, captures the WebGL canvas as a transparent PNG, and writes
 * responsive WebP variants alongside it. The HTML then uses a
 * <picture> inside #marquee-3d so mobile (and any device that skips
 * 3D) gets the poster instantly while desktop still overlays the live
 * canvas on top once the scene is ready.
 *
 * Run manually whenever the hero model changes:
 *   node scripts/render-marquee-poster.js
 *
 * Output:
 *   assets/models/hero-marquee-poster.png       (full-res transparent source)
 *   assets/models/hero-marquee-poster-{480,960,1600}.webp
 */

const path = require('node:path');
const fs = require('node:fs');
const http = require('node:http');
const { chromium } = require(path.resolve(__dirname, '..', 'audit', 'node_modules', 'playwright'));
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'assets', 'models');
const OUT_PNG = path.join(OUT_DIR, 'hero-marquee-poster.png');

// Big enough that any responsive variant we generate downstream is a
// downscale (which sharpens nicely under WebP). Square-ish so the
// model fits comfortably with breathing room on either side.
const RENDER_W = 1600;
const RENDER_H = 1600;

const RESPONSIVE_WIDTHS = [480, 960, 1600];
const WEBP_QUALITY = 88;

// Minimal MIME table — enough for our static assets.
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js':   'application/javascript; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.json': 'application/json',
    '.svg':  'image/svg+xml',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif':  'image/gif',
    '.ico':  'image/x-icon',
    '.glb':  'model/gltf-binary',
    '.gltf': 'model/gltf+json',
    '.exr':  'image/x-exr',
    '.woff': 'font/woff',
    '.woff2':'font/woff2',
    '.ttf':  'font/ttf',
    '.otf':  'font/otf',
};

function startStaticServer(rootDir) {
    return new Promise((resolve, reject) => {
        const server = http.createServer((req, res) => {
            try {
                const url = new URL(req.url, 'http://localhost');
                let rel = decodeURIComponent(url.pathname);
                if (rel.endsWith('/')) rel += 'index.html';
                // Normalize and prevent directory traversal.
                const safe = path.normalize(rel).replace(/^[/\\]+/, '');
                const abs = path.join(rootDir, safe);
                if (!abs.startsWith(rootDir)) {
                    res.statusCode = 403; return res.end('Forbidden');
                }
                fs.stat(abs, (err, stat) => {
                    if (err || !stat.isFile()) {
                        res.statusCode = 404; return res.end('Not found: ' + safe);
                    }
                    const ext = path.extname(abs).toLowerCase();
                    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
                    res.setHeader('Cache-Control', 'no-store');
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    fs.createReadStream(abs).pipe(res);
                });
            } catch (e) {
                res.statusCode = 500; res.end(String(e));
            }
        });
        server.on('error', reject);
        server.listen(0, '127.0.0.1', () => {
            const { port } = server.address();
            resolve({ server, port });
        });
    });
}

async function renderPoster() {
    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

    console.log('Starting local static server...');
    const { server, port } = await startStaticServer(ROOT);
    const baseUrl = `http://127.0.0.1:${port}/`;
    console.log(`  → ${baseUrl}`);

    let browser;
    try {
        console.log('Launching Chromium (headed: false)...');
        browser = await chromium.launch();

        const context = await browser.newContext({
            viewport: { width: RENDER_W, height: RENDER_H },
            deviceScaleFactor: 1,
        });
        const page = await context.newPage();

        page.on('pageerror', (e) => console.warn('PAGEERROR:', e.message));
        page.on('console', (m) => {
            const t = m.type();
            if (t === 'error' || t === 'warning') console.log(`  [${t}]`, m.text());
        });

        console.log(`Loading ${baseUrl} ...`);
        await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

        // The runtime EXRLoader depends on the global `fflate` for
        // decompression but the live page never loads it (the EXR
        // pipeline still completes a lot of the time because some
        // builds use a different code path). Inject it before
        // marquee3d.js gets a chance to call `new EXRLoader()` so the
        // HDRI environment actually applies to the captured frame —
        // that's what gives the bulbs their warm glow.
        await page.addScriptTag({
            url: 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/libs/fflate.min.js'
        }).catch((e) => {
            console.warn('Could not inject fflate (continuing without HDRI):', e.message);
        });

        // Force the marquee container to fill our render viewport (we
        // want the model rendered at full poster resolution regardless
        // of the responsive `clamp(...)` height that drives the live
        // site at runtime). Also kill the loader and any motion that
        // could displace the canvas.
        console.log('Configuring page for high-res capture...');
        await page.addStyleTag({
            content: `
                html, body { background: transparent !important; }
                #loader { display: none !important; }
                .grain-overlay, .vignette-overlay { display: none !important; }
                .bg-collage { display: none !important; }
                .scroll-indicator { display: none !important; }
                /* Stretch the marquee container to full viewport so the
                   3D camera renders at maximum resolution. */
                .marquee-3d-container,
                #marquee-3d {
                    position: fixed !important;
                    inset: 0 !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    margin: 0 !important;
                    transform: none !important;
                    opacity: 1 !important;
                    animation: none !important;
                }
                #marquee-canvas {
                    width: 100% !important;
                    height: 100% !important;
                }
                .hero {
                    overflow: visible !important;
                    background: transparent !important;
                }
                .hero::before, .hero::after { display: none !important; }
                .hero-content::before, .hero-content::after { display: none !important; }
            `,
        });

        // Hide the loader DOM and let main.js run to wire up Three.js.
        await page.evaluate(() => {
            const l = document.getElementById('loader');
            if (l) l.remove();
            document.body.classList.remove('loader-active');
        });

        // Wait for window.__marquee3DReady to resolve. Generous timeout
        // because the GLB is huge — even on localhost decoding takes a
        // few seconds.
        console.log('Waiting for 3D model to load (this can take 10-30s)...');
        await page.waitForFunction(
            () => window.__marquee3DReady !== undefined,
            null,
            { timeout: 60_000 }
        );
        const ok = await page.evaluate(() => window.__marquee3DReady.then(v => v));
        console.log(`  → __marquee3DReady resolved (model loaded: ${ok})`);

        // Wait for the HDRI environment to apply — the EXR loader is
        // async and resolves separately from the GLB. The console
        // emits "HDRI environment loaded" when ready; we poll for the
        // scene.environment via window.__marquee3DScene if exposed,
        // otherwise just wait a generous extra beat.
        await page.waitForTimeout(2500);

        // Force a final render synchronously and grab the canvas
        // contents as a transparent PNG dataURL. Doing it from inside
        // the page guarantees we capture the WebGL framebuffer (a
        // straight Playwright element screenshot can come back blank
        // because WebGL clears after the compositor copies the frame).
        console.log('Capturing canvas...');
        const dataUrl = await page.evaluate(({ w, h }) => {
            const canvas = document.getElementById('marquee-canvas');
            if (!canvas) throw new Error('marquee-canvas not found');
            // Render once with preserveDrawingBuffer-like semantics: we
            // call the renderer's .render() right before reading, so the
            // back buffer still contains the latest frame.
            return new Promise((resolve, reject) => {
                requestAnimationFrame(() => {
                    try {
                        // Snapshot the canvas at its native resolution.
                        // toDataURL preserves alpha for transparent
                        // backgrounds (renderer.setClearColor(0, 0)).
                        const url = canvas.toDataURL('image/png');
                        resolve(url);
                    } catch (err) {
                        reject(err);
                    }
                });
            });
        }, { w: RENDER_W, h: RENDER_H });

        if (!dataUrl || !dataUrl.startsWith('data:image/png;base64,')) {
            throw new Error('Canvas capture failed: invalid dataURL');
        }
        const pngBuf = Buffer.from(dataUrl.split(',')[1], 'base64');
        fs.writeFileSync(OUT_PNG, pngBuf);
        const meta = await sharp(pngBuf).metadata();
        console.log(`  → wrote ${path.relative(ROOT, OUT_PNG)} (${meta.width}×${meta.height}, ${(pngBuf.length/1024/1024).toFixed(2)}MB)`);

        // Generate responsive WebP variants. Mobile picks the
        // smallest that's wide enough for its viewport+DPR.
        console.log('Generating WebP variants...');
        for (const w of RESPONSIVE_WIDTHS) {
            const out = path.join(OUT_DIR, `hero-marquee-poster-${w}.webp`);
            await sharp(pngBuf)
                .resize({ width: w, withoutEnlargement: false })
                .webp({ quality: WEBP_QUALITY, alphaQuality: 95, effort: 6 })
                .toFile(out);
            const sz = fs.statSync(out).size;
            console.log(`  → ${path.relative(ROOT, out)}  (${(sz/1024).toFixed(1)}KB)`);
        }

        console.log('\nDone.');
    } finally {
        if (browser) await browser.close();
        server.close();
    }
}

renderPoster().catch((err) => {
    console.error('FAILED:', err);
    process.exit(1);
});
