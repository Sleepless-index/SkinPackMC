// Self-test for skin-lookup.mjs using a stubbed fetch (no network needed).
import assert from 'assert';
import { parseInput, lookupSkin } from './skin-lookup.mjs';

assert.deepEqual(parseInput('https://namemc.com/skin/0123456789abcdef'), { kind: 'namemc', id: '0123456789abcdef' });
assert.deepEqual(parseInput('namemc.com/profile/Notch.1'), { kind: 'user', name: 'Notch' });
assert.deepEqual(parseInput('Notch'), { kind: 'user', name: 'Notch' });
assert.equal(parseInput('https://evil.example/x'), null);
assert.equal(parseInput('namemc.com/profile/069a79f444e94726a5befca90e38aaf5'), null);

const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(40)]);
const seen = [];
const stub = async (url) => {
  seen.push(url);
  const ok = (body) => ({ ok: true, status: 200, arrayBuffer: async () => Buffer.from(body) });
  if (url.includes('api.mojang.com')) return ok(JSON.stringify({ id: 'abc123', name: 'Notch' }));
  if (url.includes('sessionserver')) {
    const v = Buffer.from(JSON.stringify({ textures: { SKIN: { url: 'http://textures.minecraft.net/texture/ff' } } })).toString('base64');
    return ok(JSON.stringify({ properties: [{ name: 'textures', value: v }] }));
  }
  if (url.includes('textures.minecraft.net') || url.includes('s.namemc.com')) return ok(png);
  return { ok: false, status: 404, arrayBuffer: async () => Buffer.alloc(0) };
};

const a = await lookupSkin('notch', stub);
assert.equal(a.name, 'Notch'); assert.ok(seen.some((u) => u.startsWith('https://textures.minecraft.net')));
const b = await lookupSkin('https://namemc.com/skin/0123456789abcdef', stub);
assert.ok(b.name.startsWith('NameMC ')); assert.ok(seen.includes('https://s.namemc.com/i/0123456789abcdef.png'));
await assert.rejects(() => lookupSkin('not a user!!', stub), (e) => e.status === 400);
const blocked = async () => ({ ok: false, status: 403, arrayBuffer: async () => Buffer.alloc(0) });
await assert.rejects(() => lookupSkin('namemc.com/skin/aaaaaaaaaaaaaaaa', blocked), (e) => e.status === 502 && /drag the PNG/.test(e.message));
console.log('skin-lookup tests passed');
