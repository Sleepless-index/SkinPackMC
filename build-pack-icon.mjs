// Regenerates static/js/pack-icon.js (the base64 of static/pack_icon.png).
// The page embeds the icon this way so exporting works when index.html is opened by double-click
// (file://), where fetch() of local files is blocked.
// Usage: node build-pack-icon.mjs   (run it whenever static/pack_icon.png changes)
import fs from 'fs';

const png = fs.readFileSync(new URL('./static/pack_icon.png', import.meta.url));
if (png.readUInt32BE(0) !== 0x89504e47) throw new Error('static/pack_icon.png is not a PNG file');
const w = png.readUInt32BE(16), h = png.readUInt32BE(20);
if (w !== h) throw new Error(`static/pack_icon.png must be square (got ${w}x${h})`);

const js = '// Auto-generated from static/pack_icon.png by build-pack-icon.mjs so the page also works when opened by double-click (file://).\n' +
           `window.PACK_ICON_B64="${png.toString('base64')}";\n`;
fs.writeFileSync(new URL('./static/js/pack-icon.js', import.meta.url), js);
console.log(`static/js/pack-icon.js updated (${w}x${h} icon, ${png.length} bytes)`);
