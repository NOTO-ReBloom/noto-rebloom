import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ACCOUNT = 'royal_lion645';
const RAW = 'https://raw.githubusercontent.com/NOTO-ReBloom/noto-rebloom/main/';
const QUEUE_PATH = 'sidehustle-autopublish/note/worldsim/publication_queue.json';
const CONFIG_PATH = path.join(__dirname, 'config.json');
const STATE_PATH = path.join(__dirname, 'worldsim_note_state.json');
const LOG_DIR = path.join(__dirname, 'logs');
const LOG_PATH = path.join(LOG_DIR, 'worldsim_note_publisher.log');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

fs.mkdirSync(LOG_DIR, { recursive: true });

function log() {
  const values = Array.from(arguments);
  const line = '[' + new Date().toISOString() + '] ' + values.map(v => typeof v === 'string' ? v : JSON.stringify(v)).join(' ');
  console.log(line);
  fs.appendFileSync(LOG_PATH, line + '\n', 'utf8');
}
function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')); } catch { return fallback; }
}
function writeJson(file, obj) { fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n', 'utf8'); }
function norm(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }

async function fetchJsonResponse(url, label, headers = {}, attempts = 6) {
  let last = 'unknown';
  for (let i = 1; i <= attempts; i++) {
    try {
      const r = await fetch(url, { headers: { 'accept':'application/json,text/plain,*/*', 'cache-control':'no-cache', ...headers } });
      const text = await r.text();
      if (!r.ok) last = 'HTTP_' + r.status + ' ' + text.slice(0,160);
      else if (!text.trim()) last = 'EMPTY_RESPONSE';
      else {
        try { return JSON.parse(text); }
        catch (e) { last = 'INVALID_JSON ' + String(e && e.message || e) + ' body=' + text.slice(0,160); }
      }
    } catch (e) {
      last = 'FETCH_ERROR ' + String(e && e.message || e);
    }
    if (i < attempts) await sleep(Math.min(5000, 700 * i));
  }
  throw new Error(label + '_FAILED ' + last);
}
async function fetchJson(rel) {
  return await fetchJsonResponse(
    RAW + rel + '?t=' + Date.now(),
    'FETCH_JSON ' + rel,
    { 'user-agent':'worldsim-note-publisher/1.1' },
    6
  );
}
async function fetchText(rel) {
  const r = await fetch(RAW + rel + '?t=' + Date.now(), { headers: { 'cache-control':'no-cache','user-agent':'worldsim-note-publisher/1.0' } });
  if (!r.ok) throw new Error('FETCH_TEXT_FAILED ' + rel + ' HTTP_' + r.status);
  return await r.text();
}
async function publicItems() {
  const out = [];
  for (let p=1; p<=50; p++) {
    const u='https://note.com/api/v2/creators/' + ACCOUNT + '/contents?kind=note&disabled_pinned=true&page=' + p + '&audit=' + Date.now();
    const o=await fetchJsonResponse(
      u,
      'NOTE_PUBLIC_PAGE_' + p,
      { 'user-agent':'worldsim-reconcile/1.1', 'referer':'https://note.com/' + ACCOUNT },
      8
    );
    const d=o.data||{};
    const xs=Array.isArray(d.contents)?d.contents:[];
    for(const x of xs) if(x && x.status==='published') out.push({key:x.key,title:norm(x.name),url:'https://note.com/'+ACCOUNT+'/n/'+x.key});
    if(d.isLastPage||xs.length===0) break;
  }
  return out;
}
async function verifyPublic(key, title, tags=[]) {
  const url='https://note.com/'+ACCOUNT+'/n/'+key;
  for(let i=0;i<12;i++){
    const r=await fetch(url+'?verify='+Date.now(),{headers:{'cache-control':'no-cache','user-agent':'worldsim-verify/1.0'}});
    if(r.ok){
      const html=await r.text();
      const tagsOk=(tags||[]).every(t=>html.includes(String(t).replace(/^#/,'')));
      if(html.includes(title) && tagsOk && !/購入して続きをみる|この記事を購入|購入手続き/.test(html)) return url;
    }
    await sleep(1500);
  }
  return null;
}
async function ensureAuth(page) {
  await page.goto('https://note.com/notes/new',{waitUntil:'domcontentloaded',timeout:30000});
  await sleep(900);
  if(/login|sign_in|accounts\.note\.com/i.test(page.url())) throw new Error('HUMAN_AUTH_REQUIRED');
  await page.waitForURL(/editor\.note\.com\/notes\/[a-z0-9]+\/edit/i,{timeout:30000});
}
function bodyWithoutTitle(md) {
  const lines=md.replace(/\r/g,'').split('\n');
  if(lines[0] && lines[0].startsWith('# ')) lines.shift();
  return lines.join('\n').trim();
}
function inlinePlain(s) {
  return s.replace(/\*\*(.*?)\*\*/g,'$1').replace(/\[(.*?)\]\((.*?)\)/g,'$1 ($2)');
}
async function typeBody(page, md) {
  const lines=bodyWithoutTitle(md).split('\n');
  const editor=page.locator('.ProseMirror');
  await editor.click();
  for(const raw of lines){
    const line=raw.trimEnd();
    if(!line.trim()){await page.keyboard.press('Enter');continue;}
    if(line.startsWith('## ')){
      await page.keyboard.type('## ');
      await sleep(120);
      await page.keyboard.insertText(inlinePlain(line.slice(3)));
      await page.keyboard.press('Enter');
      continue;
    }
    if(line.startsWith('### ')){
      await page.keyboard.type('### ');
      await sleep(120);
      await page.keyboard.insertText(inlinePlain(line.slice(4)));
      await page.keyboard.press('Enter');
      continue;
    }
    await page.keyboard.insertText(inlinePlain(line));
    await page.keyboard.press('Enter');
  }
}
async function renderCover(context, item) {
  const dir=path.join(LOG_DIR,'worldsim-covers');
  fs.mkdirSync(dir,{recursive:true});
  const out=path.join(dir,item.id+'.png');
  const p=await context.newPage({viewport:{width:1280,height:670}});
  const bg=item.accent||'#18202A';
  const label=String(item.coverLabel||'AI世界観測所').replace(/</g,'&lt;');
  const copy=String(item.coverCopy||item.title).replace(/</g,'&lt;');
  const html='<!doctype html><html><body style="margin:0;width:1280px;height:670px;background:'+bg+';color:#F3EFE6;font-family:Yu Gothic,Noto Sans JP,sans-serif;overflow:hidden"><div style="position:absolute;inset:0;padding:70px 86px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between"><div style="font-size:25px;font-weight:700;letter-spacing:.18em;opacity:.82">'+label+'</div><div><div style="width:86px;height:5px;background:#F3EFE6;margin-bottom:34px"></div><div style="font-size:61px;line-height:1.24;font-weight:800;max-width:1060px">'+copy+'</div></div><div style="font-size:23px;letter-spacing:.12em;opacity:.65;text-align:right">AI WORLD OBSERVATORY / LYRA</div></div></body></html>';
  await p.setContent(html,{waitUntil:'load'});
  await p.screenshot({path:out});
  await p.close();
  return out;
}
async function setCover(page, imagePath) {
  await page.evaluate(()=>window.scrollTo(0,0));
  await sleep(500);
  const btns=page.locator('button[aria-label="画像を追加"]');
  const n=await btns.count();
  let cover=null;
  for(let i=0;i<n;i++){
    const b=await btns.nth(i).boundingBox().catch(()=>null);
    if(b&&b.y<220){cover=btns.nth(i);break;}
  }
  if(!cover){
    const generic=page.getByRole('button',{name:/見出し画像|画像を追加|画像を設定|カバー画像|カバー/}).first();
    if(await generic.count() && await generic.isVisible().catch(()=>false)) cover=generic;
  }
  if(!cover){
    log('COVER_SKIPPED',{reason:'COVER_BUTTON_NOT_FOUND',url:page.url()});
    return false;
  }
  let chooser;
  try{
    [chooser]=await Promise.all([page.waitForEvent('filechooser',{timeout:3500}),cover.click()]);
  }catch{
    await sleep(600);
    const up=page.getByRole('button',{name:/画像をアップロード|アップロード/}).first();
    if(!(await up.count())){
      log('COVER_SKIPPED',{reason:'COVER_UPLOAD_OPTION_NOT_FOUND',url:page.url()});
      await page.keyboard.press('Escape').catch(()=>{});
      return false;
    }
    [chooser]=await Promise.all([page.waitForEvent('filechooser',{timeout:5000}),up.click()]);
  }
  await chooser.setFiles(imagePath);
  const crop=page.locator('.CropModal__content');
  if(await crop.waitFor({state:'visible',timeout:8000}).then(()=>true).catch(()=>false)){
    let clicked=false;
    for(const label of ['保存','適用','完了','設定する','決定','確定','OK']){
      const b=crop.getByRole('button',{name:label,exact:true}).first();
      if(await b.count()){await b.click();clicked=true;break;}
    }
    if(!clicked){
      const bs=crop.locator('button');
      const c=await bs.count();
      for(let i=c-1;i>=0;i--){
        const t=norm(await bs.nth(i).innerText().catch(()=>''));
        if(!/キャンセル|Cancel/i.test(t)){await bs.nth(i).click();clicked=true;break;}
      }
    }
    if(!clicked){
      log('COVER_SKIPPED',{reason:'COVER_CONFIRM_NOT_FOUND',url:page.url()});
      await page.keyboard.press('Escape').catch(()=>{});
      return false;
    }
    await crop.waitFor({state:'hidden',timeout:15000}).catch(()=>{});
  }
  const save=page.getByRole('button',{name:/下書き保存/}).first();
  if(await save.count()) await save.click({force:true});
  await sleep(1300);
  return true;
}
async function setHashtags(page,tags){
  const clean=[...new Set((tags||[]).map(x=>String(x).replace(/^#/,'').trim()).filter(Boolean))].slice(0,10);
  if(!clean.length) throw new Error('HASHTAGS_REQUIRED');
  const selectors=[
    'input[placeholder*="ハッシュタグ"]',
    'input[aria-label*="ハッシュタグ"]',
    'input[placeholder*="タグ"]',
    'input[aria-label*="タグ"]'
  ];
  let input=null;
  for(const sel of selectors){
    const candidates=page.locator(sel);
    const n=await candidates.count();
    for(let i=0;i<n;i++){
      if(await candidates.nth(i).isVisible().catch(()=>false)){input=candidates.nth(i);break;}
    }
    if(input)break;
  }
  if(!input){
    const label=page.getByText(/ハッシュタグ/,{exact:false}).first();
    if(await label.count()){
      const scope=label.locator('xpath=..');
      const c=scope.locator('input').first();
      if(await c.count()&&await c.isVisible().catch(()=>false))input=c;
    }
  }
  if(!input)throw new Error('HASHTAG_INPUT_NOT_FOUND');
  for(const tag of clean){
    await input.click();
    await input.fill(tag).catch(async()=>{await page.keyboard.press('Control+A');await page.keyboard.insertText(tag);});
    await page.keyboard.press('Enter');
    await sleep(180);
  }
  const body=norm(await page.locator('body').innerText().catch(()=>''));
  const missing=clean.filter(t=>!body.includes(t));
  if(missing.length)throw new Error('HASHTAG_UI_VERIFY_FAILED '+missing.join(','));
  return clean;
}
async function waitForPublishSettings(page, timeoutMs=20000){
  const started=Date.now();
  while(Date.now()-started<timeoutMs){
    if(/\/publish/i.test(page.url())) return true;
    const selectors=[
      'input[placeholder*="ハッシュタグ"]',
      'input[aria-label*="ハッシュタグ"]',
      'input[placeholder*="タグ"]',
      'input[aria-label*="タグ"]'
    ];
    for(const sel of selectors){
      const loc=page.locator(sel).first();
      if(await loc.count() && await loc.isVisible().catch(()=>false)) return true;
    }
    const body=norm(await page.locator('body').innerText().catch(()=>''));
    if(/公開設定|ハッシュタグ/.test(body) && /無料|有料/.test(body) && /公開する|投稿する|投稿/.test(body)) return true;
    await sleep(400);
  }
  return false;
}
async function createAndPublish(context, item, md) {
  const page=context.pages()[0]||await context.newPage();
  await ensureAuth(page);
  await page.waitForSelector('textarea[placeholder="記事タイトル"]',{timeout:15000});
  await page.fill('textarea[placeholder="記事タイトル"]',item.title);
  await page.waitForSelector('.ProseMirror',{timeout:15000});
  await typeBody(page,md);
  const save=page.getByRole('button',{name:/下書き保存/}).first();
  if(await save.count()) await save.click({force:true});
  await sleep(1200);
  const m=page.url().match(/\/notes\/([a-z0-9]+)/i);
  if(!m) throw new Error('NOTE_KEY_NOT_FOUND');
  const key=m[1];
  const coverPath=await renderCover(context,item);
  const coverApplied=await setCover(page,coverPath);
  if(!coverApplied) log('CONTINUE_WITHOUT_COVER',{id:item.id,title:item.title});

  const publishUrl='https://editor.note.com/notes/'+key+'/publish/';
  await page.goto(publishUrl,{waitUntil:'domcontentloaded',timeout:30000});
  const publishSettingsReady=await waitForPublishSettings(page,20000);
  if(!publishSettingsReady){
    const diagDir=path.join(LOG_DIR,'diagnostics');
    fs.mkdirSync(diagDir,{recursive:true});
    const stamp=Date.now();
    await page.screenshot({path:path.join(diagDir,'publish-settings-'+stamp+'.png'),fullPage:true}).catch(()=>{});
    fs.writeFileSync(path.join(diagDir,'publish-settings-'+stamp+'.html'),await page.content().catch(()=>''),'utf8');
    throw new Error('DIRECT_PUBLISH_SETTINGS_NOT_FOUND url='+page.url());
  }
  log('PUBLISH_SETTINGS_READY',{id:item.id,key,url:page.url()});
  await sleep(650);

  const freeControls=[
    page.getByRole('radio',{name:/無料/}).first(),
    page.getByRole('button',{name:/無料/}).first(),
    page.getByText('無料',{exact:true}).first()
  ];
  for(const c of freeControls){
    if(await c.count()){await c.click().catch(()=>{});break;}
  }

  const appliedTags=await setHashtags(page,item.tags);

  const pubs=[
    page.getByRole('button',{name:'公開する',exact:true}).first(),
    page.getByRole('button',{name:'投稿する',exact:true}).first(),
    page.getByRole('button',{name:'公開',exact:true}).first(),
    page.locator('button[type="submit"]').first()
  ];
  let clicked=false;
  for(const b of pubs){
    if(await b.count()&&!(await b.isDisabled().catch(()=>false))){await b.click();clicked=true;break;}
  }
  if(!clicked) throw new Error('PUBLISH_BUTTON_NOT_FOUND');
  await sleep(1800);
  const url=await verifyPublic(key,item.title,appliedTags);
  if(!url) throw new Error('PUBLIC_VERIFY_FAILED '+item.id);
  return {key,url};
}
async function main(){
  const cfg=readJson(CONFIG_PATH,{});
  const profileDir=path.resolve(__dirname,cfg.browserProfileDir||'./note_chrome_profile');
  const queue=await fetchJson(QUEUE_PATH);
  const state=readJson(STATE_PATH,{version:1,published:{}});
  const current=await publicItems();

  for(const e of queue.entries||[]){
    const found=current.filter(x=>x.title===norm(e.title));
    if(found.length===1){
      state.published[e.id]={key:found[0].key,url:found[0].url,reconciledAt:new Date().toISOString(),title:e.title};
    }else if(found.length>1){
      throw new Error('AMBIGUOUS_PUBLIC_DUPLICATE '+e.id);
    }else if(state.published[e.id]){
      log('DROP_STALE_LOCAL_PUBLICATION_STATE',{id:e.id,old:state.published[e.id],expectedTitle:e.title});
      delete state.published[e.id];
    }
  }
  writeJson(STATE_PATH,state);

  const candidates=(queue.entries||[]).filter(e=>e.enabled===true&&e.publicUrlVerified!==true&&!state.published[e.id]).sort((a,b)=>(a.order||999)-(b.order||999));
  if(!candidates.length){log('NO_PENDING_WORLDSIM_POST');return;}

  const item=candidates[0];
  const md=await fetchText(item.bodyPath);
  const body=bodyWithoutTitle(md);
  if(body.length<250) throw new Error('BODY_TOO_SHORT '+item.id);
  if(body.length>12000) throw new Error('BODY_TOO_LONG '+item.id);

  const context=await chromium.launchPersistentContext(profileDir,{channel:'chrome',headless:cfg.headlessAutomation??cfg.headless??true,viewport:{width:1440,height:1000}});
  try{
    const result=await createAndPublish(context,item,md);
    state.published[item.id]={key:result.key,url:result.url,publishedAt:new Date().toISOString()};
    writeJson(STATE_PATH,state);
    log('WORLDSIM_PUBLISH_SUCCESS',{id:item.id,title:item.title,url:result.url});
  }finally{
    await context.close().catch(()=>{});
  }
}
main().catch(e=>{log('FATAL',e&&e.stack||String(e));process.exitCode=1;});