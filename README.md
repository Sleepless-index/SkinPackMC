# Minecraft Bedrock Skin Pack Creator

A fully client-side Minecraft Bedrock skin pack creation tool. Preview skins and manage your skin list in the browser, then export a `.mcpack` skin pack that can be imported directly into the game—all without installing any software.

## Features

- **3D skin grid** — Every skin is shown as a full 3D model with its name in a responsive grid. Click a skin for a live, rotatable/zoomable preview with a walking animation, plus rename / Slim toggle / delete.
- **Manage multiple skins** — Select multiple PNGs to add at once. 
- **Import by username** — Enter a Minecraft Java Edition username to download that skin and add it to the pack. The skin name is automatically set to the username.
- **Automatic slim model detection** — Skin arm width (slim or classic) is detected when a skin is added, and the result can be corrected manually.
- **Per-skin settings** — Customize the display name and model type for each skin.
- **One-click export** — Generate a `.mcpack` containing `manifest.json`, `skins.json`, skin PNGs, English and Chinese language files, and the project's fixed pack icon at `static/pack_icon.png`. Import it into the game and start using it.

## Usage

1. Open `index.html` in your browser (just double-click it — everything it needs is included, no internet required except for the Java-username import).
2. Click "Add skins" (or drag & drop PNGs / an existing `.mcpack` onto the page). Every skin appears in a grid as a 3D model with its name; click one to rotate it, rename it, or change Slim/Classic.
3. Enter a skin pack name below. This will also be the exported filename.
4. Click "Export .mcpack", then import the downloaded file into Minecraft Bedrock Edition.

## Running it

- **Easiest:** double-click `index.html`.
- **Windows:** double-click `Start.bat` (starts a tiny local server and opens the page; falls back to opening `index.html` if Node.js isn't installed).
- **Mac/Linux:** run `start.command`, or `node serve.mjs`.

```
node test-zip.mjs # Run the zip generator self-test
```

## Tech Stack

- [MDUI 2](https://www.mdui.org/) — Material Design 3 component library
- [skinview3d](https://github.com/bs-community/skinview3d) — 3D Minecraft skin renderer
- MDUI and skinview3d are bundled locally in `static/vendor/` (works offline)
- Built-in zero-dependency zip generator (`static/js/zip.js`); no build step or npm dependencies

## License

This project is open source under the [MIT License](LICENSE).
