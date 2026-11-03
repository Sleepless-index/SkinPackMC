# Minecraft Bedrock Skin Pack Creator

A fully client-side Minecraft Bedrock skin pack creation tool. Preview skins and manage your skin list in the browser, then export a `.mcpack` skin pack that can be imported directly into the game—all without installing any software.

## Features

- **3D skin grid** — Every skin is shown as a full 3D model with its name in a responsive grid. Click a skin for a live, rotatable/zoomable preview with a walking animation, plus rename / Slim toggle / delete.
- **Manage multiple skins** — Select multiple PNGs to add at once. 
- **Import from NameMC links or usernames** — Click "Paste links" and paste one or more NameMC skin links (`namemc.com/skin/...`), NameMC profile links, or Java usernames (one per line). Usernames are resolved through Mojang's official API. Needs `node serve.mjs`; opened as a plain file, only usernames work (via a fallback service). If NameMC blocks the image download, save the skin and drag the PNG in instead.
- **Automatic slim model detection** — Skin arm width (slim or classic) is detected when a skin is added, and the result can be corrected manually.
- **Pixel editor** — The edit dialog includes a texture editor next to the 3D preview: pencil, eraser, fill (per body-part face), color picker, pan, undo/redo, scroll-wheel zoom (toward the cursor; pan with the Pan tool, middle mouse or Space + drag), a pixel grid and a body-part guide. Show or hide the editor with the "Pixel editor" button. Edits show on the 3D model live and are saved into the exported pack. Works with mouse, pen and touch.
- **Per-skin settings** — Customize the display name and model type for each skin.
- **One-click export** — Generate a `.mcpack` containing `manifest.json`, `skins.json`, skin PNGs, English and Chinese language files, and the project's fixed pack icon at `static/pack_icon.png`. Import it into the game and start using it.

## Usage

1. Open `index.html` in your browser (just double-click it — everything it needs is included, no internet required except for the Java-username import).
2. Click "Add skins" (or drag & drop PNGs / an existing `.mcpack` onto the page). Every skin appears in a grid as a 3D model with its name; click one to rotate it, rename it, or change Slim/Classic.
3. Enter a skin pack name below. This will also be the exported filename.
4. Click "Export" in the top bar, then click "Export .mcpack", then import the downloaded file into Minecraft Bedrock Edition.

## Running it

- **Easiest:** double-click `index.html` (usernames only for import).
- **Full features (NameMC links):** `node serve.mjs`, then open the printed address. Works in Termux too.

```
node test-zip.mjs # Run the zip generator self-test
node test-lookup.mjs # Run the skin lookup self-test (no network needed)
```

## Customizing the icons

- `static/pack_icon.png` — the cover image written into every exported `.mcpack` (square, 256×256 recommended).
- `static/nekoskin.png` — the favicon and home-screen icon.

After replacing `static/pack_icon.png`, run `node build-pack-icon.mjs` to regenerate `static/js/pack-icon.js` (the embedded copy that lets the page work from `file://`). `node test-zip.mjs` fails if the two are out of sync.

## Tech Stack

- [MDUI 2](https://www.mdui.org/) — Material Design 3 component library
- [skinview3d](https://github.com/bs-community/skinview3d) — 3D Minecraft skin renderer
- MDUI and skinview3d are bundled locally in `static/vendor/` (works offline)
- Built-in zero-dependency zip generator (`static/js/zip.js`); no build step or npm dependencies

## License

This project is open source under the [MIT License](LICENSE).
