#!/usr/bin/env python3
from pathlib import Path
from urllib.parse import urlparse, unquote
import json, mimetypes
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'site'
OUT=ROOT/'tests'; OUT.mkdir(exist_ok=True)

def ctype(p):
    return {'.js':'text/javascript','.webmanifest':'application/manifest+json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.mp3':'audio/mpeg','.wav':'audio/wav'}.get(p.suffix.lower()) or mimetypes.guess_type(p.name)[0] or 'application/octet-stream'

def route_files(page,missing):
    def handler(route):
        u=urlparse(route.request.url)
        if u.netloc!='fb.local': route.abort(); return
        rel=unquote(u.path.lstrip('/')) or 'index.html'; p=(SITE/rel).resolve()
        try: p.relative_to(SITE.resolve())
        except ValueError: missing.append(rel); route.fulfill(status=403,body=b''); return
        if not p.is_file(): missing.append(rel); route.fulfill(status=404,body=b''); return
        if p.suffix.lower() in {'.mp3','.wav'}: route.fulfill(status=204,body=b''); return
        route.fulfill(status=200,body=p.read_bytes(),content_type=ctype(p))
    page.route('https://fb.local/**',handler)

def open_page(browser,w,h,mobile=False):
    ctx=browser.new_context(viewport={'width':w,'height':h},is_mobile=mobile,has_touch=mobile)
    p=ctx.new_page(); missing=[]; errors=[]; route_files(p,missing)
    p.on('pageerror',lambda e:errors.append(str(e)))
    p.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
    html=(SITE/'index.html').read_text('utf-8').replace('<head>','<head><base href="https://fb.local/">',1)
    p.set_content(html,wait_until='domcontentloaded')
    p.wait_for_function('window.FB_DEBUG && window.GAME_DATA',timeout=30000)
    return ctx,p,missing,errors

def check(browser,w,h,label,mobile=False):
    ctx,p,missing,errors=open_page(browser,w,h,mobile)
    b=p.locator('#new-game'); assert b.count()==1
    rect=b.bounding_box(); assert rect
    assert rect['x']>=-0.5 and rect['y']>=-0.5,(label,rect)
    assert rect['x']+rect['width']<=w+0.5,(label,rect,w)
    assert rect['y']+rect['height']<=h+0.5,(label,rect,h)
    center=p.evaluate('''() => {const b=document.querySelector('#new-game').getBoundingClientRect(); const e=document.elementFromPoint(b.left+b.width/2,b.top+b.height/2); return {id:e?.id||'', text:e?.textContent?.trim()||''};}''')
    assert center['id']=='new-game',(label,center,rect)
    p.screenshot(path=str(OUT/f'final_v217_title_{label}.png'))
    p.click('#new-game')
    p.wait_for_selector('#premonition-screen:not(.hidden)',timeout=10000)
    assert not missing,missing
    assert not errors,errors
    ctx.close()
    return {'viewport':[w,h],'button':rect,'hit_target':center,'started':True}

if __name__=='__main__':
    cases=[
        (1920,1080,'desktop_1080',False),(1440,900,'desktop_900',False),
        (1366,768,'desktop_768',False),(1280,720,'desktop_720',False),
        (1024,768,'desktop_1024',False),(768,1024,'tablet',True),
        (430,932,'mobile_430',True),(390,844,'mobile_390',True),
        (375,667,'mobile_short',True),(320,568,'mobile_small',True),
    ]
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required'])
        result={'version':'2.17.0','cases':{}}
        for w,h,label,mobile in cases:
            result['cases'][label]=check(browser,w,h,label,mobile)
        browser.close()
    result['passed']=True
    (OUT/'title_recovery_browser_qa_v217.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),'utf-8')
    print(json.dumps(result,ensure_ascii=False,indent=2))
