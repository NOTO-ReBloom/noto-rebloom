import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ACCOUNT = 'royal_lion645';
const CONFIG_PATH = path.join(__dirname, 'config.json');
const LOG_DIR = path.join(__dirname, 'logs');
const LOG_PATH = path.join(LOG_DIR, 'worldsim_fixed8_cleanup.log');
const BACKUP_PATH = path.join(LOG_DIR, 'worldsim_fixed8_public_backup.json');
const STATE_PATH = path.join(LOG_DIR, 'worldsim_fixed8_cleanup_state.json');
const KEEP = [
  { key:'n7cd373fc8c20', title:'3つの国を同じ世界に置きました。まだ、互いの存在を知りません' },
  { key:'nad366a73d9c1', title:'港は木を欲しがった。山は4票で反対した｜アルカ、最初の7日' },
  { key:'na29741584097', title:'賛成は6、反対2。それでも灌漑整備は否決された｜ミレア、最初の7日' },
  { key:'nf4ab129b1b02', title:'鉱山を2日止める。6対3で安全点検が通った｜ヴァルド、最初の7日' }
];
const KEEP_KEYS = new Set(KEEP.map(x=>x.key));
const sleep = ms => new Promise(r=>setTimeout(r,ms));

fs.mkdirSync(LOG_DIR,{recursive:true});
function norm(v){return String(v||'').replace(/\s+/g,' ').trim();}
function log(...values){
  const line='['+new Date().toISOString()+'] '+values.map(v=>typeof v==='string'?v:JSON.stringify(v)).join(' ');
  console.log(line); fs.appendFileSync(LOG_PATH,line+'\n','utf8');
}
function readJson(file,fallback={}){
  try{return JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));}catch{return fallback;}
}
function writeJson(file,obj){fs.writeFileSync(file,JSON.stringify(obj,null,2)+'\n','utf8');}
function publicUrl(key){return 'https://note.com/'+ACCOUNT+'/n/'+key;}

async function fetchJson(url,label,attempts=10){
  let last='unknown';
  for(let i=1;i<=attempts;i++){
    try{
      const r=await fetch(url,{headers:{'accept':'application/json,text/plain,*/*','cache-control':'no-cache','user-agent':'worldsim-fixed8/1.0'}});
      const text=await r.text();
      if(!r.ok) last='HTTP_'+r.status;
      else if(!text.trim()) last='EMPTY';
      else {
        try{return JSON.parse(text);}catch(e){last='INVALID_JSON '+String(e.message||e);}
      }
    }catch(e){last=String(e&&e.message||e);}
    if(i<attempts) await sleep(Math.min(5000,700*i));
  }
  throw new Error(label+' '+last);
}

async function fetchPublished(){
  const items=[];
  for(let p=1;p<=120;p++){
    const url='https://note.com/api/v2/creators/'+ACCOUNT+'/contents?kind=note&disabled_pinned=true&page='+p+'&audit='+Date.now()+'-'+p;
    let o;
    try{o=await fetchJson(url,'PUBLIC_PAGE_'+p,10);}
    catch(e){
      if(p>1 && / EMPTY$/.test(String(e.message||e))){log('PUBLIC_LIST_END_EMPTY',{page:p,count:items.length});break;}
      throw e;
    }
    const d=o.data||{};
    const xs=Array.isArray(d.contents)?d.contents:[];
    for(const x of xs){
      if(x&&x.status==='published') items.push({
        key:x.key,title:norm(x.name),status:x.status,
        publishAt:x.publishAt||x.publish_at||null,
        price:x.price==null?null:x.price,
        url:publicUrl(x.key)
      });
    }
    if(d.isLastPage||xs.length===0){log('PUBLIC_LIST_END',{page:p,count:items.length});break;}
  }
  return items;
}

async function inspectPublic(key,title){
  for(let i=1;i<=8;i++){
    try{
      const r=await fetch(publicUrl(key)+'?verify='+Date.now()+'-'+i,{headers:{'cache-control':'no-cache','user-agent':'worldsim-fixed8-verify/1.0'}});
      const html=await r.text();
      const missing=!r.ok||/お探しのページが見つかりません|ページが見つかりません|この記事は公開されていません/.test(html);
      return {status:r.status,exists:!missing,titleOk:html.includes(title)};
    }catch(e){
      if(i===8) return {status:0,exists:false,titleOk:false,error:String(e&&e.message||e)};
      await sleep(500*i);
    }
  }
}

async function firstVisible(candidates,timeout=500){
  for(const c of candidates){
    try{const l=c.first(); if(await l.isVisible({timeout})) return l;}catch{}
  }
  return null;
}

async function findVisibleTargetAnchor(page,key){
  const c=page.locator('a[href*="'+key+'"]');
  const n=await c.count().catch(()=>0);
  for(let i=0;i<n;i++) if(await c.nth(i).isVisible({timeout:200}).catch(()=>false)) return c.nth(i);
  return null;
}

async function openArticleListTarget(page,key){
  for(const url of ['https://note.com/notes?status=published','https://note.com/notes']){
    await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
    await sleep(1500);
    if(/login|sign_in/.test(page.url())) throw new Error('NOTE_LOGIN_REQUIRED');
    let lastHeight=0,stable=0;
    for(let round=0;round<40;round++){
      const a=await findVisibleTargetAnchor(page,key);
      if(a) return a;
      const h=await page.evaluate(()=>document.documentElement.scrollHeight).catch(()=>0);
      stable=h===lastHeight?stable+1:0; lastHeight=h;
      if(stable>=4) break;
      await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight)).catch(()=>{});
      await sleep(600);
    }
  }
  return null;
}

async function findDeleteItem(page){
  return firstVisible([
    page.getByRole('menuitem',{name:/記事を削除|削除/}),
    page.getByText('記事を削除',{exact:true}),
    page.getByText('削除する',{exact:true}),
    page.getByText('削除',{exact:true}),
    page.locator('[role="menuitem"]').filter({hasText:/削除/})
  ],500);
}

async function openDeleteFromExactRow(page,key){
  if(KEEP_KEYS.has(key)) throw new Error('KEEP_KEY_DELETE_BLOCKED '+key);
  const anchor=await openArticleListTarget(page,key);
  if(!anchor) throw new Error('ARTICLE_LIST_TARGET_NOT_FOUND '+key);
  await anchor.scrollIntoViewIfNeeded();
  let row=anchor;
  for(let depth=1;depth<=14;depth++){
    row=row.locator('xpath=..');
    let menu=await firstVisible([
      row.getByRole('button',{name:/その他|メニュー|記事メニュー|オプション/}),
      row.locator('button[aria-label*="その他"],button[aria-label*="メニュー"],button[title*="その他"],button[title*="メニュー"]')
    ],220);
    if(!menu){
      const buttons=await row.locator('button').evaluateAll(es=>es.map((e,index)=>{
        const r=e.getBoundingClientRect();
        return {index,visible:r.width>0&&r.height>0,x:r.x,label:(String(e.textContent||'')+' '+String(e.getAttribute('aria-label')||'')+' '+String(e.getAttribute('title')||'')).replace(/\s+/g,' ').trim()};
      }).filter(x=>x.visible).sort((a,b)=>b.x-a.x)).catch(()=>[]);
      const selected=buttons.find(b=>!/編集|表示|プレビュー|閉じる|キャンセル/.test(b.label));
      if(selected) menu=row.locator('button').nth(selected.index);
    }
    if(!menu) continue;
    await menu.click(); await sleep(300);
    const del=await findDeleteItem(page);
    if(del) return del;
    await page.keyboard.press('Escape').catch(()=>{});
  }
  throw new Error('DELETE_MENU_NOT_FOUND '+key);
}

async function findDeleteConfirm(page){
  const dialog=await firstVisible([page.getByRole('dialog'),page.locator('[role="alertdialog"]')],250);
  const root=dialog||page;
  return firstVisible([
    root.getByRole('button',{name:/^(削除する|削除|記事を削除|完全に削除|はい|OK)$/}),
    root.locator('button').filter({hasText:/^(削除する|記事を削除|完全に削除)$/}),
    root.locator('input[type="submit"][value*="削除"],input[type="button"][value*="削除"]')
  ],300);
}

async function clickDeleteAndConfirm(page,key,del){
  if(KEEP_KEYS.has(key)) throw new Error('KEEP_KEY_CONFIRM_BLOCKED '+key);
  let nativeAccepted=false;
  const handler=async dialog=>{
    const m=norm(dialog.message());
    if(/削除|delete/i.test(m)){await dialog.accept();nativeAccepted=true;} else await dialog.dismiss();
  };
  page.once('dialog',handler);
  try{
    await del.click(); await sleep(500);
    for(let round=1;round<=12;round++){
      if(nativeAccepted){await sleep(1200);return;}
      const c=await findDeleteConfirm(page);
      if(c && await c.isEnabled().catch(()=>true)){await c.click();await sleep(1200);return;}
      await sleep(400);
    }
  } finally {page.off('dialog',handler);}
  throw new Error('DELETE_CONFIRM_NOT_FOUND '+key);
}

async function deletePublishedTarget(page,target){
  if(KEEP_KEYS.has(target.key)) throw new Error('KEEP_KEY_TARGET_BLOCKED '+target.key);
  const before=await inspectPublic(target.key,target.title);
  if(!before.exists) return 'already_removed';
  let last='';
  for(let attempt=1;attempt<=3;attempt++){
    try{
      const del=await openDeleteFromExactRow(page,target.key);
      await clickDeleteAndConfirm(page,target.key,del);
      for(let verify=1;verify<=8;verify++){
        const after=await inspectPublic(target.key,target.title);
        if(!after.exists) return 'deleted_verified';
        await sleep(700*verify);
      }
      last='STILL_PUBLIC';
    }catch(e){last=String(e&&e.message||e); log('DELETE_ATTEMPT_FAILED',{key:target.key,attempt,error:last});}
    await sleep(1200*attempt);
  }
  throw new Error('DELETE_FAILED '+target.key+' '+last);
}

function keyFromHref(href){
  const m=String(href||'').match(/\/(n[0-9a-z]{8,})(?:\/|\?|$)/i);
  return m?m[1]:null;
}

async function findFirstNonKeepManageDelete(page){
  await page.goto('https://note.com/notes',{waitUntil:'domcontentloaded',timeout:30000});
  await sleep(1400);
  let lastHeight=0,stable=0;
  for(let round=0;round<50;round++){
    const anchors=page.locator('a[href]');
    const n=await anchors.count().catch(()=>0);
    for(let i=0;i<n;i++){
      const a=anchors.nth(i);
      if(!(await a.isVisible({timeout:100}).catch(()=>false))) continue;
      const href=await a.getAttribute('href').catch(()=>null);
      const key=keyFromHref(href);
      if(!key||KEEP_KEYS.has(key)) continue;
      let row=a;
      for(let d=1;d<=14;d++){
        row=row.locator('xpath=..');
        let menu=await firstVisible([
          row.getByRole('button',{name:/その他|メニュー|記事メニュー|オプション/}),
          row.locator('button[aria-label*="その他"],button[aria-label*="メニュー"],button[title*="その他"],button[title*="メニュー"]')
        ],160);
        if(!menu) continue;
        await menu.click(); await sleep(250);
        const del=await findDeleteItem(page);
        if(del) return {key,del};
        await page.keyboard.press('Escape').catch(()=>{});
      }
    }
    const h=await page.evaluate(()=>document.documentElement.scrollHeight).catch(()=>0);
    stable=h===lastHeight?stable+1:0; lastHeight=h;
    if(stable>=4) break;
    await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight)).catch(()=>{});
    await sleep(500);
  }
  return null;
}

async function cleanupManageExtras(page,state){
  let removed=0;
  for(let round=1;round<=200;round++){
    const found=await findFirstNonKeepManageDelete(page);
    if(!found) break;
    if(KEEP_KEYS.has(found.key)) throw new Error('KEEP_KEY_MANAGE_BLOCKED '+found.key);
    await clickDeleteAndConfirm(page,found.key,found.del);
    removed++;
    state.manageExtrasDeleted=(state.manageExtrasDeleted||0)+1;
    state.updatedAt=new Date().toISOString(); writeJson(STATE_PATH,state);
    log('MANAGE_EXTRA_DELETED',{round,key:found.key,total:removed});
  }
  return removed;
}

async function main(){
  fs.writeFileSync(LOG_PATH,'=== FIXED8 '+new Date().toISOString()+' ===\n','utf8');
  const cfg=readJson(CONFIG_PATH,{});
  const profileDir=path.resolve(__dirname,cfg.browserProfileDir||'./note_chrome_profile');
  const current=await fetchPublished();
  for(const k of KEEP){
    const matches=current.filter(x=>x.key===k.key&&x.title===k.title);
    if(matches.length!==1) throw new Error('KEEP_PRECHECK_FAILED '+k.key+' count='+matches.length);
    const v=await inspectPublic(k.key,k.title);
    if(!v.exists||!v.titleOk) throw new Error('KEEP_DIRECT_VERIFY_FAILED '+k.key);
  }
  const targets=current.filter(x=>!KEEP_KEYS.has(x.key));
  writeJson(BACKUP_PATH,{capturedAt:new Date().toISOString(),keep:KEEP,publicBefore:current,targets});
  const state=readJson(STATE_PATH,{version:1,results:{},startedAt:new Date().toISOString()});
  log('FIXED8_START',{publicCount:current.length,targetCount:targets.length,keep:KEEP.map(x=>x.key)});

  const context=await chromium.launchPersistentContext(profileDir,{channel:'chrome',headless:cfg.headlessAutomation??cfg.headless??true,viewport:{width:1440,height:1000}});
  const page=context.pages()[0]||await context.newPage();
  try{
    for(let i=0;i<targets.length;i++){
      const t=targets[i];
      const prior=state.results[t.key];
      if(prior&&['deleted_verified','already_removed'].includes(prior.status)) continue;
      try{
        const status=await deletePublishedTarget(page,t);
        state.results[t.key]={status,title:t.title,at:new Date().toISOString()};
        log('PUBLIC_DELETE_PROGRESS',{index:i+1,total:targets.length,key:t.key,status,title:t.title});
      }catch(e){
        state.results[t.key]={status:'failed',title:t.title,error:String(e&&e.message||e),at:new Date().toISOString()};
        log('PUBLIC_DELETE_FAILED',{index:i+1,total:targets.length,key:t.key,error:String(e&&e.stack||e)});
      }
      state.updatedAt=new Date().toISOString(); writeJson(STATE_PATH,state);
      if((i+1)%20===0) await sleep(1200);
    }

    const failed=Object.entries(state.results).filter(([k,v])=>!KEEP_KEYS.has(k)&&v.status==='failed');
    if(failed.length) throw new Error('PUBLIC_DELETE_FAILURES '+failed.length+' first='+failed.slice(0,5).map(([k,v])=>k+':'+v.error).join(' | '));

    const extrasRemoved=await cleanupManageExtras(page,state);
    log('MANAGE_EXTRA_CLEANUP_DONE',{extrasRemoved});

    const finalPublic=await fetchPublished();
    const finalKeys=new Set(finalPublic.map(x=>x.key));
    const extras=finalPublic.filter(x=>!KEEP_KEYS.has(x.key));
    const missing=KEEP.filter(x=>!finalKeys.has(x.key));
    if(extras.length||missing.length) throw new Error('FINAL_PUBLIC_MISMATCH extras='+extras.length+' missing='+missing.map(x=>x.key).join(','));

    for(const k of KEEP){
      const v=await inspectPublic(k.key,k.title);
      if(!v.exists||!v.titleOk) throw new Error('KEEP_POSTCHECK_FAILED '+k.key);
    }
    state.status='completed';
    state.completedAt=new Date().toISOString();
    state.finalPublic=finalPublic;
    writeJson(STATE_PATH,state);
    log('FIXED8_CLEANUP_COMPLETED',{finalPublicCount:finalPublic.length,manageExtrasDeleted:state.manageExtrasDeleted||0});
  } finally {await context.close().catch(()=>{});}
}

main().catch(e=>{log('FIXED8_FATAL',e&&e.stack||String(e));process.exitCode=1;});
