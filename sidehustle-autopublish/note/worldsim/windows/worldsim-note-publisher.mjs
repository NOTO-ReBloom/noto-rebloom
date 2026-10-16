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

async function fetchJson(rel) {
  const r = await fetch(RAW + rel + '?t=' + Date.now(), { headers: { 'cache-control':'no-cache','user-agent':'worldsim-note-publisher/1.0' } });
  if (!r.ok) throw new Error('FETCH_JSON_FAILED ' + rel + ' HTTP_' + r.status);
  return await r.json();
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
    const r=await fetch(u,{headers:{'cache-control':'no-cache','user-agent':'worldsim-reconcile/1.0'}});
    if(!r.ok) break;
    const o=await r.json();
    const d=o.data||{};
    const xs=Array.isArray(d.contents)?d.contents:[];
    for(const x of xs) if(x && x.status==='published') out.push({key:x.key,title:norm(x.name),url:'https://note.com/'+ACCOUNT+'/n/'+x.key});
    if(d.isLastPage||xs.length===0) break;
  }
  return out;
}
async function verifyPublic(key, title) {
  const url='https://note.com/'+ACCOUNT+'/n/'+key;
  for(let i=0;i<12;i++){
    const r=await fetch(url+'?verify='+Date.now(),{headers:{'cache-control':'no-cache','user-agent':'worldsim-verify/1.0'}});
    if(r.ok){
      const html=await r.text();
      if(html.includes(title) && !/購入して続きをみる|この記事を購入|購入手続き/.test(html)) return url;
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
  if(!cover) throw new Error('COVER_BUTTON_NOT_FOUND');
  let chooser;
  try{
    [chooser]=await Promise.all([page.waitForEvent('filechooser',{timeout:3500}),cover.click()]);
  }catch{
    await sleep(600);
    const up=page.getByRole('button',{name:/画像をアップロード|アップロード/}).first();
    if(!(await up.count())) throw new Error('COVER_UPLOAD_OPTION_NOT_FOUND');
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
    if(!clicked) throw new Error('COVER_CONFIRM_NOT_FOUND');
    await crop.waitFor({state:'hidden',timeout:15000}).catch(()=>{});
  }
  const save=page.getByRole('button',{name:/下書き保存/}).first();
  if(await save.count()) await save.click({force:true});
  await sleep(1300);
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
  await setCover(page,coverPath);

  const next=page.getByRole('button',{name:/公開に進む/}).first();
  if(!(await next.count())) throw new Error('PUBLISH_NEXT_NOT_FOUND');
  await next.click();
  await page.waitForURL(/\/publish/i,{timeout:15000});
  await sleep(650);

  const freeControls=[
    page.getByRole('radio',{name:/無料/}).first(),
    page.getByRole('button',{name:/無料/}).first(),
    page.getByText('無料',{exact:true}).first()
  ];
  for(const c of freeControls){
    if(await c.count()){await c.click().catch(()=>{});break;}
  }

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
  const url=await verifyPublic(key,item.title);
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
    if(found.length===1) state.published[e.id]={key:found[0].key,url:found[0].url,reconciledAt:new Date().toISOString()};
    else if(found.length>1) throw new Error('AMBIGUOUS_PUBLIC_DUPLICATE '+e.id);
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