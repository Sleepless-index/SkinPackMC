# AGENTS.md — Minecraft Bedrock Skin Pack Creator

## Project Goal

A fully client-side single-page application for creating Minecraft Bedrock skin packs in the browser and exporting them as `.mcpack` files.

## Feature Requirements

- **Skin grid** — Show every skin as a card in a responsive grid: a 3D snapshot (rendered by one hidden skinview3d viewer) plus the skin name. Clicking a card opens an edit dialog with a live rotatable/zoomable 3D viewer, name field, Slim toggle, prev/next and delete (with confirmation).
- Each skin can have a display name (written to the language files) and a model type (classic or slim).
- Automatic slim model detection: inspect the transparency of the right arm's top-face area (50,16)-(52,20). Slim arms are 3 pixels wide and leave this area empty. Store the detection result in a toggle that users can manually correct.
- Image dimension validation: accept square or 2:1 images, and explicitly reject 128x64 images. For accepted images that are not 64x64 or 128x128, show "This skin may not display correctly" only when that skin is selected.
- Add skins (support selecting multiple PNGs at once) and delete skins (deletion requires confirmation in a dialog).
- **Import by Minecraft Java Edition username** — Enter a username to download a skin and add it to the pack (the skin name is automatically set to the username). Use MineTools (`api.minetools.eu/uuid/{name}` to look up the UUID, then `/profile/{uuid}` to get the texture URL) and the Mojang textures CDN (HTTPS) to download the PNG; both allow cross-origin requests. Normalize the username with NFKC (full-width to half-width) before lookup.
- **Import a skin pack** — Parse an existing `.mcpack` or `.zip` to restore its editable state (use `parseZip` in `static/js/zip.js`, which supports STORE/DEFLATE). Automatically restore the pack name, description (excluding the attribution line), skin names (from `zh_CN.lang`), and slim model flags (from the geometry in `skins.json`).
- **Bottom: Skin pack details area** — Enter a skin pack name and an optional description. Use the name for both the exported `.mcpack` filename and the display name inside the pack. The manifest description is "user description \n Skin pack created by www.mcneko.com/tools/skinpack" (when no description is provided, include only the attribution line).
- One-click export of a `.mcpack` (a zip file) containing:
  - `manifest.json` (`format_version` 2, a `skin_pack` module, a random UUID, and a description whose final line is always "Skin pack created by www.mcneko.com/tools/skinpack")
  - `skins.json` (a `skins` array, `serialize_name`, and `localization_name`)
  - Skin PNGs (`skin_N.png`)
  - `texts/en_US.lang` and `texts/zh_CN.lang`
  - `pack_icon.png` (use `static/pack_icon.png` as the fixed pack icon)

## Technical Conventions

- Static page only; no build step or npm dependencies.
- Use **MDUI 2** for the UI (bundled in `static/vendor/`, Web Components).
- Use **skinview3d** for the 3D preview (bundled in `static/vendor/`), with automatic rendering of both skin layers.
- Do not add JSZip for zip generation; use the built-in `static/js/zip.js` (STORE, uncompressed; pure function `createZip(files)`).
- Keep project-owned JavaScript files in `static/js/`.
- `static/js/pack-icon.js` is the base64 of `static/pack_icon.png` (lets the page work from file://); regenerate it if the icon changes.

## Local Run / Tests

Double-click `index.html`, or run `node serve.mjs` (http://localhost:8080; set SSL_KEY/SSL_CERT for https).

`test-zip.mjs` is the self-test for `zip.js`:

```powershell
node test-zip.mjs
```

## Notes

- A skin pack's `localization_name` cannot contain spaces, so sanitize the pack name into an identifier when exporting. Write display names to `.lang` files unchanged.
- Use `crypto.randomUUID()` to generate UUIDs (with a getRandomValues fallback).
