# Sunderfall

A collectible card battler for mobile, set in an original world: the god-star Aurelion has shattered, and four banners fight over its falling shards.

- 72 cards across four banners (Auric Dominion, Verdant Eld, Hollow Host, Forgeborn Clans) plus Unbound mercenaries
- Packs, collection, crafting with Ash, and a deck builder
- Eight-stage campaign and skirmishes against three AI difficulty levels
- Drill-Yard: a guided first battle that teaches the rules
- Woodcut-style card art generated on canvas, so the game ships as one HTML file with no image assets

## Quick start

Requires Node 18 or newer.

```
npm install
npm run build
```

Then open `dist/index.html` in a browser. Or wrap it with Capacitor, using `dist` as the web directory.

## Play on a phone

GitHub Pages serves the repo root, so https://bananasfester.github.io/sunderfall/ opens the game. The build writes `index.html`, `manifest.webmanifest` and `icons/` at the root; commit them with any source change so the live page stays current.

- iPhone: open the link in Safari, tap Share, then Add to Home Screen.
- Android: open the link in Chrome, tap the menu, then Add to Home screen (or Install app).

The home-screen copy keeps its own save, separate from the browser's.

## Tests and tools

```
npm test               # build, syntax and scope checks, 168 AI games, UI tap-through, full tutorial run
npm run audit:cards    # per-card play rate and win rate
npm run balance        # banner win rates
npm run campaign       # campaign difficulty curve for starter decks
npm run shots          # phone screenshots (needs Python + `pip install playwright`)
```

`docs/card-audit.txt` is the most recent card audit output.

## Project layout

```
src/        game source, concatenated into one file by build.js
test/       simulations, jsdom UI tests, balance scripts, screenshot scripts
docs/       card audit output
licenses/   SIL Open Font License texts for the embedded fonts
dist/       build output (not committed)
index.html  built game for GitHub Pages (with manifest.webmanifest and icons/)
```

See `CLAUDE.md` for architecture, card data rules, and coding conventions.

## Fonts

The build embeds Grenze Gotisch, IM Fell English, Barlow Condensed and Saira Stencil One, all under the SIL Open Font License 1.1. Their license files are in `licenses/`.
