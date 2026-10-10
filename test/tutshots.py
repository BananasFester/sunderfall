# Screenshots of the Drill-Yard tutorial at phone size.
import sys, os
from playwright.sync_api import sync_playwright
OUT = sys.argv[1] if len(sys.argv) > 1 else 'shots'; os.makedirs(OUT, exist_ok=True)
import pathlib
URL = (pathlib.Path(__file__).resolve().parent.parent / 'dist' / 'index.html').as_uri()
FAST = "window.__SF_TEST__={};(function(){var st=window.setTimeout;window.setTimeout=function(f,ms){return st(f,Math.min(ms||0,80));};})();"
errors = []
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.add_init_script(FAST); pg.goto(URL); pg.wait_for_timeout(400)
    pg.click('[data-act="pickBanner"][data-arg="forge"]'); pg.click('[data-act="confirmBanner"]'); pg.wait_for_timeout(200)
    pg.screenshot(path=f'{OUT}/t00-welcome.png')
    pg.click('#modal-root [data-act="startTut"]'); pg.wait_for_timeout(600)
    want = {1: 't01-intro', 2: 't02-life', 5: 't05-play', 11: 't11-attack', 15: 't15-block', 16: 't16-lastbreath', 20: 't20-target', 26: 't26-attack-all', 27: 't27-done'}
    shot = set()
    for i in range(400):
        pg.wait_for_timeout(120)
        if pg.query_selector('[data-act="leaveBattle"]'):
            pg.wait_for_timeout(500); pg.screenshot(path=f'{OUT}/t99-result.png'); break
        idx = pg.evaluate("(function(){var T=window.__SF_TEST__.peek().Tut;return T.active()?T.index()+1:-1})()")
        if idx == -1: 
            # free play: simple finish
            if pg.query_selector('[data-act="blkGo"]'): pg.click('[data-act="blkGo"]'); continue
            if pg.query_selector('[data-act="atkStart"]'):
                pg.click('[data-act="atkStart"]')
                for _ in range(6):
                    u = pg.query_selector('#board0 .unit.can-act')
                    if not u: break
                    u.click(); pg.wait_for_timeout(60)
                if pg.query_selector('[data-act="atkGo"]:not(.off)'): pg.click('[data-act="atkGo"]')
                else: pg.click('[data-act="atkCancel"]')
                continue
            if pg.query_selector('[data-act="endTurn"]'): pg.click('[data-act="endTurn"]')
            continue
        if not pg.query_selector('.coach'): continue
        if idx in want and idx not in shot:
            pg.wait_for_timeout(450); pg.screenshot(path=f'{OUT}/{want[idx]}.png'); shot.add(idx)
        if pg.query_selector('[data-act="tutNext"]'): pg.click('[data-act="tutNext"]'); continue
        ok = pg.evaluate("(function(){var f=window.__SF_TEST__.peek().Tut.focusEl(); if(!f) return false; f.dispatchEvent(new MouseEvent('click',{bubbles:true})); return true;})()")
    b.close()
print('errors', errors)
