# Sunderfall

Mobile collectible card battler (Nox Interactive catalog). Original setting: the god-star Aurelion shattered over the world of Kaedra and four banners fight over its shards. Players collect cards from packs, build 30-card decks, and fight AI opponents in a campaign, skirmishes, and a guided tutorial. PvP is planned later.

Ships as **one self-contained HTML file** (no external requests, no image files) so it can be wrapped with Capacitor or hosted on GitHub Pages.

## Commands

```
npm install            # dev tools only: jsdom, acorn, acorn-walk
npm run build          # src/ -> dist/index.html (+ dist/sunderfall.html, dist/core.test.js, dist/bundle.js)
npm test               # build + syntax + scope check + AI sim + UI flow + tutorial flow (all must pass)
npm run audit:cards    # per-card play rate / win rate over 1600 AI games
npm run balance        # banner win rates (generated decks and starter decks)
npm run campaign       # win rate of starter decks against each campaign stage
npm run shots          # phone screenshots via Python Playwright (optional; needs `pip install playwright`)
```

Open `dist/index.html` in a browser to play locally.

## How the code is put together

`build.js` concatenates `src/` files **in this order** into a single IIFE: `cards.js, engine.js, ai.js, art.js, audio.js, tutorial.js, ui.js`. There are no modules: every top-level function and `var` is shared across files inside that one scope, so later files can call earlier ones. CSS is `fonts.css + style.css`; markup is `body.html`.

| File | Role |
|---|---|
| `src/cards.js` | Banners, keywords, triggers, rarities, all 72 cards + tokens (`CARD_LIST`, `TOKEN_LIST`), rules-text generator, starter decks, campaign (`CAMPAIGN`), skirmish tiers |
| `src/engine.js` | Rules engine. Pure state + actions, seeded RNG, no DOM. Public actions: `newGame, mulligan, playCard, declareAttack, declareBlocks, endTurn`; queries like `playBlocker, attackBlocker, canBlock, targetOptions` |
| `src/ai.js` | `AI.choose / AI.blocks / AI.mulligan` (levels 1 Squire, 2 Knight, 3 Warlord) by simulating options on `cloneState`; `AI.buildDeck` for opponent decks with rarity caps per quality |
| `src/art.js` | Woodcut card art drawn on canvas at runtime and cached as blob URLs; falls back to a hatched placeholder when canvas is missing (jsdom). Also SVG glyphs (`GLYPH`, `kwGlyph`) |
| `src/audio.js` | Web Audio sound effects, unlocked on first tap (iOS requirement) |
| `src/tutorial.js` | Drill-Yard guided battle: fixed hands and draws (`TUT_DATA`), scripted enemy for early turns, `STEPS` with spotlight + input gating, then free play |
| `src/ui.js` | Screens, battle view, fx playback, saves. Event delegation: elements carry `data-act` / `data-arg`, handled by the `ACT` map in one click listener |
| `src/style.css` | All styling. Tokens in `:root` |
| `src/fonts.css` | ~260 KB of base64 OFL fonts. Do not read or hand-edit it; regenerate if fonts change. Licenses in `licenses/` |

Battle UI flow: every engine call goes through `exec(fn)` in ui.js, which snapshots element positions, runs the action, re-renders, then plays the recorded `s.fx` events (damage floats, deaths, card reveals).

## Card data rules

- Cards are built with `U_(id, name, banner, cost, atk, hp, rarity, keywords, effects, icon, lore, extra)` and `S_(...)` for spells. Effects use `F(trigger, do, target, params)`.
- Triggers: `cast` (spells), `deploy`, `death` (Last Breath), `dawn`, `dusk`, `assault`, `allyDies` (Harvest), `spell` (Empower).
- Rules text is **generated** from effect data by `cardText()` / `effectText()`. Never hand-write text that disagrees with effects; use `extra.text` only when generation cannot express it.
- **Card ids are permanent.** Player saves store the collection and decks by id. Never rename or reuse an id; to retire a card, stop it appearing in packs instead.
- A new effect type (`do`) needs three things: text in `effectText` (cards.js), behavior in `applyEffect` (engine.js), and, if it matters for evaluation, weight in `unitValue()` inside `ai.js`.
- Decks: exactly 30 cards, at most 2 banners plus any Unbound, 2 copies max, 1 for Legendary.

Balance targets after any card change (run `npm run balance` and `npm run audit:cards`):
- Banner win rates within roughly 45-55% for both generated and starter decks.
- No card's win-rate-when-played below ~42% or above ~62% without a deliberate reason. Known exceptions: Mythics run a bit hot by design; Edict of Ash reads low because board wipes get cast from behind; Offering of Bone has a low play rate because the AI rarely sacrifices its own units.
- Check `npm run campaign` so early stages stay winnable with a starter deck and later stages ramp up.

## Conventions (strict)

- One IIFE, `var` only (no `let`/`const`), no ES modules, no build-time transpiling.
- No external resources at runtime: no CDN scripts, no web fonts by URL, no remote images.
- Wrap every `localStorage` access in try/catch. Save key: `sunderfall.save.v1`; new fields get defaults in `freshSave()` and `normalizeSave()`.
- No `alert`, `confirm` or `prompt`. Destructive actions use a tap-twice "armed" pattern (`App.armed`).
- No emoji anywhere in the UI. Icons are inline SVG or canvas.
- No duplicate element ids.
- Player-facing copy: short, plain, active voice, no em dashes.
- Visual direction: woodcut / war-ledger. Soot-black ground, bone paper, black ink, one dried-blood red, banner inks only as accents. Square corners, hard offset shadows. No glows, gradients-as-decoration, or rounded "app" cards.

## Before delivering any change

1. `npm test` passes (it runs `node --check`, the acorn scope check for undeclared identifiers, 168 AI-vs-AI games with invariant checks, a full jsdom tap-through of the UI, and the whole tutorial).
2. If cards or the AI changed: run the balance scripts above.
3. If the tutorial's cards, hands or steps changed: `node test/tutorial-flow.js` must still reach "Drill done".
4. If layout changed: `npm run shots` and look at the phone screenshots (390x844 and 375x667), and confirm no horizontal overflow.

Large search-and-replace edits can silently drop a function header or a `var`; the scope check exists to catch that, so always run it.

## Working with Steve

- Steve playtests on an iPhone and usually reports several issues at once. Fix them all in one pass, then run the full validation before handing back.
- When a system keeps producing bugs, step back and re-evaluate it critically rather than stacking patches.
- Development happens on Windows with no Mac; iOS builds will need a Mac later. Android (Capacitor) is the first release target.

## Platform notes

- Capacitor: use `dist` as `webDir` (the entry is `dist/index.html`). AdMob and RevenueCat follow the existing Nox pipeline.
- `ui.js` contains an optional cloud-save path (`Cloud`) that only activates inside a claude.ai artifact viewer (`window.claude`). Everywhere else it does nothing and saves stay in localStorage.
- PvP plan: the engine is deterministic given a seed and has no DOM, so the same `engine.js` can run on a server as the authority. Clients would send actions (`playCard`, `declareAttack`, `declareBlocks`, `endTurn`) and receive state.
