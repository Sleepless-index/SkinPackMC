// Server-side skin lookup used by serve.mjs (/api/skin?q=...).
// Accepts a Java username, a NameMC skin or profile link, or a textures.minecraft.net link
// and returns the skin PNG. Uses Mojang's official API for usernames.
const UA = 'SkinPackCreator/1.0 (+https://github.com/Sleepless-index/SkinPackMc)';
const MAX_BYTES = 1 << 20;
const TTL_MS = 10 * 60 * 1000;
const cache = new Map();

export class LookupError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export function parseInput(raw) {
  const q = String(raw || '').trim().normalize('NFKC');
  let m;
  if ((m = q.match(/namemc\.com\/(?:[a-z]{2}\/)?skin\/([0-9a-f]{8,32})/i))) return { kind: 'namemc', id: m[1].toLowerCase() };
  if ((m = q.match(/namemc\.com\/(?:[a-z]{2}\/)?profile\/([A-Za-z0-9_]{1,16})(?:\.\d+)?(?:[/?#]|$)/i))) return { kind: 'user', name: m[1] };
  if ((m = q.match(/textures\.minecraft\.net\/texture\/([0-9a-f]{32,64})/i))) return { kind: 'texture', hash: m[1].toLowerCase() };
  if (/^[A-Za-z0-9_]{1,16}$/.test(q)) return { kind: 'user', name: q };
  return null;
}

async function getBytes(fetchImpl, url, what) {
  let r;
  try {
    r = await fetchImpl(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(10000) });
  } catch (e) {
    throw new LookupError(502, `${what}: network error (${e.message})`);
  }
  if (r.status === 429) throw new LookupError(429, `${what}: rate limited, wait a minute and try again`);
  if (!r.ok) throw new LookupError(r.status === 404 || r.status === 204 ? 404 : 502, `${what} failed (HTTP ${r.status})`);
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length > MAX_BYTES) throw new LookupError(502, `${what} returned an unexpectedly large file`);
  return buf;
}

const isPng = (b) => b.length > 24 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;

async function fromUsername(fetchImpl, name) {
  const idBuf = await getBytes(fetchImpl, `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(name)}`, 'Mojang username lookup')
    .catch((e) => { if (e.status === 404) throw new LookupError(404, `User "${name}" not found`); throw e; });
  const info = JSON.parse(idBuf.toString('utf8') || '{}');
  if (!info.id) throw new LookupError(404, `User "${name}" not found`);
  const prof = JSON.parse((await getBytes(fetchImpl, `https://sessionserver.mojang.com/session/minecraft/profile/${info.id}`, 'Mojang profile lookup')).toString('utf8'));
  const prop = (prof.properties || []).find((p) => p.name === 'textures');
  const tex = prop && JSON.parse(Buffer.from(prop.value, 'base64').toString('utf8'));
  const url = tex?.textures?.SKIN?.url;
  if (!url) throw new LookupError(404, `${info.name || name} has not set a Java Edition skin`);
  const png = await getBytes(fetchImpl, url.replace(/^http:\/\//, 'https://'), 'Skin download');
  return { buf: png, name: info.name || name };
}

export async function lookupSkin(raw, fetchImpl = fetch) {
  const p = parseInput(raw);
  if (!p) throw new LookupError(400, `"${String(raw).slice(0, 60)}" is not a username or a NameMC skin/profile link`);
  const key = JSON.stringify(p).toLowerCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.t < TTL_MS) return hit.v;

  let v;
  if (p.kind === 'user') v = await fromUsername(fetchImpl, p.name);
  else if (p.kind === 'texture') v = { buf: await getBytes(fetchImpl, `https://textures.minecraft.net/texture/${p.hash}`, 'Skin download'), name: `skin-${p.hash.slice(0, 6)}` };
  else {
    const buf = await getBytes(fetchImpl, `https://s.namemc.com/i/${p.id}.png`, 'NameMC skin download')
      .catch((e) => { throw new LookupError(e.status === 404 ? 404 : 502, `${e.message}. If NameMC blocks the download, save the skin from NameMC and drag the PNG in instead.`); });
    v = { buf, name: `NameMC ${p.id.slice(0, 6)}` };
  }
  if (!isPng(v.buf)) throw new LookupError(502, 'The skin server did not return a valid PNG');
  cache.set(key, { t: Date.now(), v });
  return v;
}
