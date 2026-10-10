# Phone-size screenshots of every screen, driven through real taps in Chromium.
import sys, time
from playwright.sync_api import sync_playwright

import pathlib
URL = (pathlib.Path(__file__).resolve().parent.parent / 'dist' / 'index.html').as_uri()
OUT = sys.argv[1] if len(sys.argv) > 1 else 'shots'
import os
os.makedirs(OUT, exist_ok=True)

FAST = """
window.__SF_TEST__ = {};
(function(){ var st = window.setTimeout; window.setTimeout = function(fn, ms){ return st(fn, Math.min(ms||0, 60)); }; })();
"""

errors = []
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    page = ctx.new_page()
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
    page.add_init_script(FAST)
    page.goto(URL)
    page.wait_for_timeout(300)

    def tap(sel):
        try:
            page.click(sel, timeout=2000)
        except Exception as e:
            print('tap failed', sel, str(e)[:80])
        page.wait_for_timeout(120)
    def safe(el):
        try:
            el.click(timeout=1500)
            return True
        except Exception:
            return False

    def shot(name):
        page.wait_for_timeout(250)
        page.screenshot(path=f'{OUT}/{name}.png')

    tap('[data-act="pickBanner"][data-arg="auric"]')
    shot('01-pick')
    tap('[data-act="confirmBanner"]')
    tap('[data-act="closeModal"]') if page.query_selector('[data-act="closeModal"]') else None
    page.evaluate("document.querySelector('#modal-root').innerHTML=''")
    shot('02-home')

    tap('[data-act="go"][data-arg="shop"]')
    tap('[data-act="buyPack"][data-arg="any"]')
    tap('[data-act="flip"][data-arg="0"]'); tap('[data-act="flip"][data-arg="1"]')
    page.wait_for_timeout(700)
    shot('03-pack-partial')
    tap('[data-act="flipAll"]'); page.wait_for_timeout(900)
    shot('04-pack-open')
    tap('[data-act="closeModal"]')
    tap('[data-act="go"][data-arg="home"]')
    tap('[data-act="go"][data-arg="collection"]')
    shot('05-collection')
    page.click('.ctile >> nth=2'); page.wait_for_timeout(200)
    shot('06-card-zoom')
    tap('[data-act="closeModal"]')
    tap('[data-act="go"][data-arg="home"]')
    tap('[data-act="go"][data-arg="decks"]')
    tap('[data-act="editDeck"]')
    shot('07-deck-edit')
    tap('[data-act="deTab"][data-arg="add"]')
    shot('08-deck-add')
    tap('[data-act="deDone"]')
    tap('[data-act="go"][data-arg="home"]')
    tap('[data-act="go"][data-arg="campaign"]')
    shot('09-campaign')
    tap('[data-act="stage"][data-arg="0"]')
    shot('10-stage')
    tap('[data-act="fightStage"]')
    page.wait_for_timeout(300)
    shot('11-mulligan')
    tap('[data-act="mullGo"]')

    got_block = got_target = got_zoom = got_attack = False
    for step in range(400):
        page.wait_for_timeout(150)
        if page.query_selector('[data-act="leaveBattle"]'):
            break
        if page.query_selector('[data-act="tipOk"]'):
            if step < 30:
                shot('12-tip')
            tap('[data-act="tipOk"]')
            continue
        if page.query_selector('[data-act="blkGo"]'):
            bl = page.query_selector('#board0 .unit.can-block')
            at = page.query_selector('#board1 .unit.attacking')
            if bl and at:
                safe(bl); page.wait_for_timeout(100); safe(at); page.wait_for_timeout(100)
            if not got_block:
                shot('13-blocking'); got_block = True
            tap('[data-act="blkGo"]')
            continue
        status = page.inner_text('#bstatus') if page.query_selector('#bstatus') else ''
        if 'Choose a target' in status:
            if not got_target:
                shot('14-targeting'); got_target = True
            t = page.query_selector('#battle .target')
            if not (t and safe(t)): tap('[data-act="tgtCancel"]')
            continue
        pl = page.query_selector('#hand .card.playable')
        if pl:
            if not safe(pl): continue
            page.wait_for_timeout(150)
            if not got_zoom:
                shot('15-hand-zoom'); got_zoom = True
            btn = page.query_selector('[data-act="playHand"]:not(.off)')
            if not (btn and safe(btn)): tap('[data-act="closeModal"]')
            continue
        if page.query_selector('[data-act="atkStart"]'):
            tap('[data-act="atkStart"]')
            for u in page.query_selector_all('#board0 .unit.can-act'):
                safe(u); page.wait_for_timeout(60)
            if not got_attack:
                shot('16-attack-select'); got_attack = True
            if page.query_selector('[data-act="atkGo"]:not(.off)'):
                tap('[data-act="atkGo"]')
                page.wait_for_timeout(200)
                shot('17-after-attack') if step < 200 else None
            else:
                tap('[data-act="atkCancel"]')
            continue
        if page.query_selector('[data-act="endTurn"]'):
            if step > 20 and step < 26:
                shot('18-midgame')
            tap('[data-act="endTurn"]')
            continue
    page.wait_for_timeout(600)
    shot('19-result')
    if page.query_selector('[data-act="leaveBattle"]'):
        tap('[data-act="leaveBattle"]')
    tap('[data-act="go"][data-arg="home"]')
    tap('[data-act="go"][data-arg="codex"]')
    shot('20-codex')
    tap('[data-act="codexTab"][data-arg="kw"]')
    shot('21-keywords')

    # small phone
    ctx2 = b.new_context(viewport={'width': 375, 'height': 667}, device_scale_factor=2, is_mobile=True, has_touch=True)
    p2 = ctx2.new_page()
    p2.add_init_script(FAST)
    p2.goto(URL)
    p2.wait_for_timeout(300)
    p2.click('[data-act="pickBanner"][data-arg="hollow"]'); p2.click('[data-act="confirmBanner"]')
    p2.evaluate("document.querySelector('#modal-root').innerHTML=''")
    p2.click('[data-act="go"][data-arg="skirmish"]'); p2.click('[data-act="fightSkirmish"]'); p2.wait_for_timeout(300); p2.click('[data-act="mullGo"]')
    for i in range(60):
        p2.wait_for_timeout(150)
        if p2.query_selector('[data-act="tipOk"]'): p2.click('[data-act="tipOk"]'); continue
        if p2.query_selector('[data-act="blkGo"]'): p2.click('[data-act="blkGo"]'); continue
        pl = p2.query_selector('#hand .card.playable')
        if pl:
            pl.click(); p2.wait_for_timeout(100)
            btn = p2.query_selector('[data-act="playHand"]:not(.off)')
            if btn: btn.click()
            else: p2.click('[data-act="closeModal"]')
            s = p2.inner_text('#bstatus')
            if 'Choose a target' in s:
                t = p2.query_selector('#battle .target')
                if t: t.click()
                else: p2.click('[data-act="tgtCancel"]')
            continue
        if p2.query_selector('[data-act="endTurn"]'): p2.click('[data-act="endTurn"]')
    p2.wait_for_timeout(400)
    p2.screenshot(path=f'{OUT}/22-small-phone-battle.png')
    # horizontal overflow check
    ov = p2.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
    print('horizontal overflow px:', ov)
    b.close()

print('errors:', errors[:10])
