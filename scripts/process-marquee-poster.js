#!/usr/bin/env node
/* eslint-disable no-console */

/*
 * Convert a "logo on solid black" hero marquee export into the
 * transparent-background poster set we ship to the browser. Used when
 * the source artwork is provided as a flat JPEG/PNG (e.g. the
 * `export_transparent_v2` render the bride/groom signed off on)
 * rather than re-rendered through render-marquee-poster.js.
 *
 * What it does:
 *   1. Luma-keys the input — pixels close to pure black become
 *      transparent, mid-tones get partial alpha (smooth anti-aliased
 *      edges), bright colors stay opaque.
 *   2. Crops to the logo's non-transparent bounding box, then expands
 *      that box outward by VIEW_PADDING_FRACTION on every side. The
 *      live Three.js camera uses the same padding (see
 *      js/marquee3d.js MODEL_TARGET_SIZE * VIEW_PADDING), so when the
 *      live canvas paints on top of the poster the logo doesn't jump
 *      or resize.
 *   3. Pads to a 1:1 square so the poster letterboxes the same way
 *      the WebGL camera does in any container aspect ratio.
 *   4. Emits the same `hero-marquee-poster*.{png,webp}` set the HTML
 *      <picture> already references.
 *
 * Usage:
 *   node scripts/process-marquee-poster.js path/to/source.png
 */

const path = require('node:path');
const fs = require('node:fs');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'assets', 'models');
const OUT_PNG = path.join(OUT_DIR, 'hero-marquee-poster.png');

const RESPONSIVE_WIDTHS = [480, 960, 1600];
const WEBP_QUALITY = 88;

// Matches js/marquee3d.js: VIEW_PADDING = 1.18. The live camera fits
// MODEL_TARGET_SIZE (11.5) into a square view of MODEL_TARGET_SIZE *
// VIEW_PADDING (= 13.57) world units. So the model's longest
// dimension ends up at 1/VIEW_PADDING ≈ 84.7% of the visible frame,
// regardless of container aspect ratio. We mirror that exactly here:
// final frame size = max(bbox W, bbox H) * VIEW_PADDING. This keeps
// the poster + live WebGL render in lock-step so the swap from
// poster → live 3D is visually invisible.
const VIEW_PADDING = 1.18;

// Soft luma key thresholds. Anything darker than LUMA_TRANSPARENT
// becomes fully transparent; anything brighter than LUMA_OPAQUE stays
// fully opaque; the band between is interpolated linearly to give us
// soft anti-aliased edges where the logo's color fades to black.
const LUMA_TRANSPARENT = 24;
const LUMA_OPAQUE = 60;

async function main() {
    const srcArg = process.argv[2];
    if (!srcArg) {
        console.error('Usage: node scripts/process-marquee-poster.js <source-image>');
        process.exit(1);
    }
    const src = path.resolve(srcArg);
    if (!fs.existsSync(src)) {
        console.error(`Source not found: ${src}`);
        process.exit(1);
    }
    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

    console.log(`Reading ${path.relative(ROOT, src)}...`);
    const meta = await sharp(src).metadata();
    console.log(`  → ${meta.width}×${meta.height} ${meta.format} (alpha: ${!!meta.hasAlpha})`);

    // Pull raw RGBA pixels so we can both apply the luma key and
    // measure the bounding box of the non-transparent pixels in a
    // single pass.
    const { data, info } = await sharp(src)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
    const { width, height, channels } = info;

    console.log('Applying luma key...');
    let minX = width, minY = height, maxX = -1, maxY = -1;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * channels;
            const r = data[i], g = data[i + 1], b = data[i + 2];
            const lum = Math.max(r, g, b);
            let alpha;
            if (lum <= LUMA_TRANSPARENT) {
                alpha = 0;
            } else if (lum >= LUMA_OPAQUE) {
                alpha = 255;
            } else {
                alpha = Math.round(((lum - LUMA_TRANSPARENT) / (LUMA_OPAQUE - LUMA_TRANSPARENT)) * 255);
            }
            data[i + 3] = alpha;
            // Track bbox of pixels that are at least mostly opaque so
            // we don't include the soft anti-alias halo.
            if (alpha >= 64) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }
    if (maxX < 0) {
        throw new Error('Luma key found no logo pixels — is the source actually all black?');
    }
    const bboxW = maxX - minX + 1;
    const bboxH = maxY - minY + 1;
    console.log(`  → logo bbox: ${minX},${minY}..${maxX},${maxY}  (${bboxW}×${bboxH})`);

    // Build the keyed PNG buffer in memory, then crop+pad off it.
    const keyedPng = await sharp(data, { raw: info }).png({ compressionLevel: 9 }).toBuffer();

    // Step 2: extract the logo bounding box (no padding yet).
    const cropped = await sharp(keyedPng)
        .extract({ left: minX, top: minY, width: bboxW, height: bboxH })
        .toBuffer();

    // Step 3: build a square frame whose side length = max(bbox dim) *
    // VIEW_PADDING. This makes the logo's longest dimension occupy
    // 1/VIEW_PADDING ≈ 84.7% of the frame — identical to what the
    // Three.js camera renders at runtime, so swapping the poster for
    // the live canvas doesn't change the on-screen logo size.
    const finalSize = Math.round(Math.max(bboxW, bboxH) * VIEW_PADDING);
    const left = Math.floor((finalSize - bboxW) / 2);
    const right = finalSize - bboxW - left;
    const top = Math.floor((finalSize - bboxH) / 2);
    const bottom = finalSize - bboxH - top;

    const square = await sharp(cropped)
        .extend({
            top, bottom, left, right,
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png({ compressionLevel: 9 })
        .toBuffer();

    fs.writeFileSync(OUT_PNG, square);
    const finalMeta = await sharp(square).metadata();
    console.log(`  → wrote ${path.relative(ROOT, OUT_PNG)} (${finalMeta.width}×${finalMeta.height}, ${(square.length / 1024).toFixed(1)}KB)`);

    // Step 4: responsive WebP variants.
    console.log('Generating WebP variants...');
    for (const w of RESPONSIVE_WIDTHS) {
        const out = path.join(OUT_DIR, `hero-marquee-poster-${w}.webp`);
        await sharp(square)
            .resize({ width: w, withoutEnlargement: false })
            .webp({ quality: WEBP_QUALITY, alphaQuality: 95, effort: 6 })
            .toFile(out);
        const sz = fs.statSync(out).size;
        console.log(`  → ${path.relative(ROOT, out)}  (${(sz / 1024).toFixed(1)}KB)`);
    }

    console.log('\nDone.');
}

main().catch((err) => {
    console.error('FAILED:', err);
    process.exit(1);
});
