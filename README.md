[![make.fun bounty](https://make.fun/api/competitions/gta6-cover-art-01/badge.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Checked by make.fun](https://make.fun/api/competitions/gta6-cover-art-01/checked-badge.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![Author](https://make.fun/api/users/@dashaaa12/badge.svg)](https://make.fun/bounty/gta6-cover-art-01)

# Neon Coast Cover Studio

**Competition:** [Make GTA 6 Cover Art](https://make.fun/bounty/gta6-cover-art-01) · $250 prize pool

## What it does

Neon Coast Cover Studio turns your own photos into Grand Theft Auto VI style cover art. Drop in one photo — or several — and the studio arranges them into the series' signature multi-panel collage with cream gutters, a bold condensed masthead (the default wording is "GRAND THEFT AUTO VI"), a neon script subtitle ("Vice City"), a caption bar, wanted-heat stars and a film-grain finish, then exports a finished poster as a PNG.

Every panel can hold one of your photos (with per-panel zoom and pan, so one photo can fill the whole cover in different crops) or one of eight scenes the app paints itself on canvas: a sunset boulevard of palms, the downtown skyline at dusk, a sports car, a speedboat, a police helicopter with a searchlight, an art-deco hotel, a neon street, and an original painted duo portrait of two invented protagonists. Four layouts (Vice Collage, Four Corners, Hero + Insets, Panel Strips), four colour grades (Vice Sunset, Neon Nights, Golden Hour, Midnight Noir) and three export sizes — 1920×1080, 1080×1080 and 1080×1350 — cover everything from a desktop wallpaper to a portrait post. Three sample photos ship with the app so it produces a complete cover the moment it opens. Everything runs locally in the browser: photos are never uploaded, and there is no account, watermark or network call.

## How to run it

Open `app/index.html` in any modern browser (or serve the `app/` folder with any static file server). Click a panel on the cover to select it, choose a photo or a painted scene for it, adjust the crop, set the title, subtitle, caption and heat, then press **Export cover as PNG**. Hand-in: `node main.ts` copies `app/` and `screenshots/` into the output directory and writes `dossier.json`.

## Verification

- The four files in `screenshots/` are the app itself running in a browser: the exported landscape cover, the editor with a photo loaded and a panel selected, and the portrait and square exports — all produced by the app's own renderer at its real export sizes.
- `node main.ts` run twice produces byte-identical output trees (the copies walk in sorted order and the dossier is rebuilt from the copied files by the kit's `buildDossier`).
- The app makes zero network requests: every font, photo and script it uses lives inside `app/`.

---

<sub>Built for the [Make GTA 6 Cover Art](https://make.fun/bounty/gta6-cover-art-01) bounty on make.fun · Referral: [make.fun/r/y1enas6g](https://make.fun/r/y1enas6g) · This is an independent entry, not affiliated with make.fun.</sub>
