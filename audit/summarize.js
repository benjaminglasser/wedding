const fs = require('fs');
const report = JSON.parse(fs.readFileSync(__dirname + '/report.json', 'utf8'));

for (const [name, d] of Object.entries(report)) {
    console.log(`\n=== ${name} (vw=${d.vw}, docW=${d.docW}, overflow=${d.hasHorizontalOverflow}, tinyTargets=${d.tinyTargets.length}) ===`);
    // Summarize overflowers by class selector
    const counts = new Map();
    for (const o of d.overflowers) {
        const key = `${o.tag}.${(o.cls || '').split(' ').slice(0, 2).join('.')}`.slice(0, 100);
        const prev = counts.get(key) || { count: 0, maxRight: 0, minX: 0, sample: o };
        prev.count++;
        prev.maxRight = Math.max(prev.maxRight, o.right);
        prev.minX = Math.min(prev.minX, o.x);
        counts.set(key, prev);
    }
    const rows = [...counts.entries()].sort((a, b) => (b[1].maxRight - b[1].minX) - (a[1].maxRight - a[1].minX)).slice(0, 15);
    for (const [k, v] of rows) {
        console.log(`  ${k}  x${v.count}  range=[${v.minX}..${v.maxRight}]`);
    }
    if (d.consoleErrors && d.consoleErrors.length) {
        console.log(`  -- console errors: ${d.consoleErrors.length}`);
        for (const e of d.consoleErrors.slice(0, 3)) console.log(`     ${e.slice(0, 160)}`);
    }
}
