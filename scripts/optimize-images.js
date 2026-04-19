#!/usr/bin/env node
/* eslint-disable no-console */

/*
 * Batch-convert referenced PNGs into responsive WebP variants.
 *
 * For each input PNG we emit up to three widths (480w, 960w, 1600w) written
 * alongside the original as `<name>-<width>.webp`. The HTML uses <picture>
 * with srcset so the browser downloads the smallest variant that fits the
 * device's layout + DPR.
 */

const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const BG_DIR = path.join(ROOT, 'assets', 'background_pngs');

// Decorative sources that actually appear in index.html / main.js / CSS.
const SOURCES = [
    // hero bg-cutouts
    'assets/background_pngs/las-vegas-night-time-neon-lights-casinos-df06d34b7adeabffd877b27a490cc01e_3.png',
    'assets/background_pngs/Stardust_sign_015.png',
    'assets/background_pngs/las-vegas-night-time-neon-lights-casinos-df06d34b7adeabffd877b27a490cc01e.png',
    'assets/background_pngs/flamingoturns75-nvyesterdays-jakobowens.png',
    'assets/background_pngs/photo-1645180804518-5dc3e353e647.png',
    'assets/background_pngs/tumblr_a308156a8eca84a5697bdf47f57395ee_ef479b5c_1280.png',
    'assets/background_pngs/dunes-casino-and-oasis-casino-neon-signs-at-night-aloha-art.png',
    'assets/background_pngs/welcome-to-las-vegas-neon-sign-nevada-usa-vintage-panorama-gregory-ballos.png',
    'assets/background_pngs/las-vegas-night-time-neon-lights-casinos-df06d34b7adeabffd877b27a490cc01e_4.png',
    'assets/background_pngs/premium_photo-1673468922198-af2d3dde732f.png',
    // section-sign-cutouts
    'assets/background_pngs/1000s.png',
    'assets/background_pngs/tumblr_poue4wIaAd1s0vozto1_1280.png',
    'assets/background_pngs/chips.png',
    'assets/background_pngs/palms.png',
    'assets/background_pngs/horsehoe.png',
    'assets/background_pngs/las-vegas-night-time-neon-lights-casinos-df06d34b7adeabffd877b27a490cc01e_2.png',
    'assets/background_pngs/slot_machine.png',
    'assets/background_pngs/rio.png',
    // footer cutout
    'assets/background_pngs/JAC-BEN-LIGHTS_cutout.png',
    // standalone
    'assets/poster.png',
];

const TARGET_WIDTHS = [480, 960, 1600];
// WebP quality tuned to be visually indistinguishable from the source at
// the display sizes these decorative cutouts are shown at.
const WEBP_QUALITY = 82;

function fmtBytes(n) {
    if (n < 1024) return `${n}B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)}KB`;
    return `${(n / 1024 / 1024).toFixed(2)}MB`;
}

async function convertOne(relPath) {
    const abs = path.join(ROOT, relPath);
    if (!fs.existsSync(abs)) {
        console.warn(`  ! missing: ${relPath}`);
        return { original: 0, generated: 0 };
    }

    const srcSize = fs.statSync(abs).size;
    const meta = await sharp(abs).metadata();
    const srcWidth = meta.width || 0;
    const dir = path.dirname(abs);
    const base = path.basename(abs, path.extname(abs));

    // Unique widths ≤ source width; always include the largest required
    // width we can actually produce without upscaling.
    const widths = Array.from(new Set(
        TARGET_WIDTHS.filter(w => w < srcWidth).concat(
            Math.min(srcWidth, TARGET_WIDTHS[TARGET_WIDTHS.length - 1])
        )
    )).sort((a, b) => a - b);

    let generated = 0;
    const outputs = [];
    for (const w of widths) {
        const out = path.join(dir, `${base}-${w}.webp`);
        await sharp(abs)
            .resize({ width: w, withoutEnlargement: true })
            .webp({ quality: WEBP_QUALITY, alphaQuality: 90, effort: 6 })
            .toFile(out);
        const outSize = fs.statSync(out).size;
        generated += outSize;
        outputs.push(`${w}w=${fmtBytes(outSize)}`);
    }

    console.log(`  ${base}.png  ${fmtBytes(srcSize)}  →  ${outputs.join(', ')}`);
    return { original: srcSize, generated };
}

(async () => {
    console.log(`Converting ${SOURCES.length} images → WebP (${TARGET_WIDTHS.join(', ')} widths)\n`);
    let totalOriginal = 0;
    let totalGenerated = 0;
    for (const rel of SOURCES) {
        const { original, generated } = await convertOne(rel);
        totalOriginal += original;
        totalGenerated += generated;
    }
    console.log(`\nTotal: ${fmtBytes(totalOriginal)} → ${fmtBytes(totalGenerated)}  ` +
        `(${((1 - totalGenerated / totalOriginal) * 100).toFixed(1)}% reduction)`);
})().catch(err => {
    console.error(err);
    process.exit(1);
});
