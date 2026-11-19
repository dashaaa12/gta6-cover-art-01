# gta6-cover-art-01
[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/dashaaa12/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/dashaaa12/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

## What it does

Neon Coast Cover Studio turns your own photos into Grand Theft Auto VI style cover art. Drop in one photo — or several — and the studio arranges them into the series' signature multi-panel collage with cream gutters, a bold condensed masthead (the default wording is "GRAND THEFT AUTO VI"), a neon script subtitle ("Vice City"), a caption bar, wanted-heat stars and a film-grain finish, then exports a finished poster as a PNG.

Every panel can hold one of your photos (with per-panel zoom and pan, so one photo can fill the whole cover in different crops) or one of eight scenes the app paints itself on canvas: a sunset boulevard of palms, the downtown skyline at dusk, a sports car, a speedboat, a police helicopter with a searchlight, an art-deco hotel, a neon street, and an original painted duo portrait of two invented protagonists. Four layouts (Vice Collage, Four Corners, Hero + Insets, Panel Strips), four colour grades (Vice Sunset, Neon Nights, Golden Hour, Midnight Noir) and three export sizes — 1920×1080, 1080×1080 and 1080×1350 — cover everything from a desktop wallpaper to a portrait post. Three sample photos ship with the app so it produces a complete cover the moment it opens. Everything runs locally in the browser: photos are never uploaded, and there is no account, watermark or network call.

## How to run it

Open `app/index.html` in any modern browser (or serve the `app/` folder with any static file server). Click a panel on the cover to select it, choose a photo or a painted scene for it, adjust the crop, set the title, subtitle, caption and heat, then press **Export cover as PNG**.

## Verification

- The four files in `screenshots/` are the app itself running in a browser: the exported landscape cover, the editor with a photo loaded and a panel selected, and the portrait and square exports — all produced by the app's own renderer at its real export sizes.
- `node main.ts` run twice produces byte-identical output trees (the copies walk in sorted order and the dossier is rebuilt from the copied files by the kit's `buildDossier`).
- The app makes zero network requests: every font, photo and script it uses lives inside `app/`.

## Run it

```sh
node main.ts
```

This copies `app/` and `screenshots/` to the output directory and writes `dossier.json`.

---
<sub>Entered on [make.fun](https://make.fun/?ref=y1enas6g&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
