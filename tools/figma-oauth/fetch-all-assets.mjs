// Download every figma MCP asset referenced in figma-data/ctx-*.md while URLs are alive.
// Files land in figma-data/assets-raw/by-uuid/<uuid>.<ext>; manifest.json maps uuid -> {sections, var, bytes, type}.
import { readdirSync, readFileSync, mkdirSync, writeFileSync, existsSync, statSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const TOK = JSON.parse(readFileSync(path.join(here, 'tokens.json'), 'utf8')).access_token;
const DATA = 'C:/kipu/learn/Claude projects/X5Rudn/figma-data';
const OUT = path.join(DATA, 'assets-raw', 'by-uuid');
mkdirSync(OUT, { recursive: true });

const assets = new Map(); // uuid -> { sections:Set, var:string }
for (const f of readdirSync(DATA).filter((f) => f.startsWith('ctx-') && f.endsWith('.md'))) {
  const text = readFileSync(path.join(DATA, f), 'utf8');
  for (const m of text.matchAll(/const (\w+) = "https:\/\/www\.figma\.com\/api\/mcp\/asset\/([0-9a-f-]+)"/g)) {
    const [, varName, uuid] = m;
    if (!assets.has(uuid)) assets.set(uuid, { sections: new Set(), var: varName });
    assets.get(uuid).sections.add(f.replace(/^ctx-|\.md$/g, ''));
  }
}
console.log(`unique assets: ${assets.size}`);

const extOf = (ct) => (ct.includes('png') ? 'png' : ct.includes('svg') ? 'svg' : ct.includes('jpeg') ? 'jpg' : ct.includes('webp') ? 'webp' : 'bin');
const manifest = {};
let i = 0, ok = 0, fail = 0;
for (const [uuid, info] of assets) {
  i++;
  const already = readdirSync(OUT).find((f) => f.startsWith(uuid + '.'));
  if (already && statSync(path.join(OUT, already)).size > 0) {
    manifest[uuid] = { file: already, sections: [...info.sections], var: info.var, cached: true };
    ok++;
    continue;
  }
  const tmp = path.join(OUT, uuid + '.tmp');
  try {
    const ct = execSync(
      `curl -s -m 60 -o "${tmp}" -w "%{content_type}" -H "Authorization: Bearer ${TOK}" "https://www.figma.com/api/mcp/asset/${uuid}"`,
      { encoding: 'utf8' }
    ).trim();
    const size = statSync(tmp).size;
    if (size < 100) throw new Error(`tiny response (${size}b, ${ct})`);
    const ext = extOf(ct);
    const final = `${uuid}.${ext}`;
    execSync(`mv "${tmp}" "${path.join(OUT, final)}"`, { shell: 'C:/Program Files/Git/bin/bash.exe' });
    manifest[uuid] = { file: final, sections: [...info.sections], var: info.var, bytes: size, type: ct };
    ok++;
    console.log(`${i}/${assets.size} ok ${final} ${(size / 1024).toFixed(0)}KB [${[...info.sections]}]`);
  } catch (e) {
    fail++;
    console.error(`${i}/${assets.size} FAIL ${uuid}: ${e.message}`);
    manifest[uuid] = { error: e.message, sections: [...info.sections], var: info.var };
  }
  await new Promise((r) => setTimeout(r, 1500));
}
writeFileSync(path.join(DATA, 'assets-raw', 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`DONE ok=${ok} fail=${fail} of ${assets.size}`);
