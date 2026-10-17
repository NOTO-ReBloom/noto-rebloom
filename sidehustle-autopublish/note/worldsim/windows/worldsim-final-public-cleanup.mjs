import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ACCOUNT = 'royal_lion645';
const CONFIG_PATH = path.join(__dirname, 'config.json');
const LOG_DIR = path.join(__dirname, 'logs');
const LOG_PATH = path.join(LOG_DIR, 'worldsim_final_public_cleanup.log');
const BACKUP_PATH = path.join(LOG_DIR, 'worldsim_final_public_backup.json');
const STATE_PATH = path.join(LOG_DIR, 'worldsim_final_public_cleanup_state.json');

const KEEP = [
  {key:'n0fe222a4c273', title:'3つの国を同じ世界に置きました。まだ、互いの存在を知りません'},
  {key:'n158e9b7da82a', title:'港は木を欲しがった。山は4票で反対した｜アルカ、最初の7日'},
  {key:'n992001bc5844', title:'賛成は6、反対2。それでも灌漑整備は否決された｜ミレア、最初の7日'},
  {key:'nff17a64062f0', title:'鉱山を2日止める。6対3で安全点検が通った｜ヴァルド、最初の7日'}
];
const KEEP_KEYS = new Set(KEEP.map(x => x.key));
const sleep = ms => new Promise(r => setTimeout(r, ms));

fs.mkdirSync(LOG_DIR, {recursive:true});
function norm(v){ return String(v||'').replace(/\s+/g,' ').trim(); }
function log(...xs){
  const line='['+new Date().toISOString()+'] '+xs.map(x=>typeof x==='string'?x:JSON.stringify(x)).join(' ');
  console.log(line);
  fs.appendFileSync(LOG_PATH,line+'\n','utf8');
}
function readJson(file,fallback={}){
  try{return JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));}catch{return fallback;}
}
function writeJson(file,obj){fs.writeFileSync(file,JSON.stringify(obj,null,2)+'\n','utf8');}

async function fetchJsonStrict(url,label,attempts=10){
  let last='unknown';
  for(let i=1;i<=attempts;i++){
    try{
      const r=await fetch(url,{headers:{
        'accept':'application/json,text/plain,*/*',
        'cache-control':'no-cache',
        'user-agent':'worldsim-final-cleanup/1.0'
      }});
      const text=await r.text();
      if(!r.ok) last='HTTP_'+r.status+' '+text.slice(0,120);
      else if(!text.trim()) last='EMPTY_RESPONSE';
      else {
        try{return JSON.parse(text);}
        catch(e){last='INVALID_JSON '+String(e&&e.message||e);}
      }
    }catch(e){last='FETCH_ERROR '+String(e&&e.message||e);}
    if(i<attempts) await sleep(Math.min(6000,700*i));
  }
  throw new Error(label+'_FAILED '+last);
}

async function inventory(){
  const out=[], seen=new Set();
  let ended=false;
  for(let page=1;page<=100;page++){
    const url='https://note.com/api/v2/creators/'+ACCOUNT+'/contents?kind=note&disabled_pinned=true&page='+page+'&audit='+Date.now()+'-'+page;
    const obj=await fetchJsonStrict(url,'INVENTORY_PAGE_'+page,10);
    const d=obj.data||{};
    const xs=Array.isArray(d.contents)?d.contents:[];
    for(const x of xs){
      if(!x||x.status!=='published'||!x.key||seen.has(x.key)) continue;
      seen.add(x.key);
      out.push({key:x.key,title:norm(x.name),status:x.status,price:Number(x.price||0),url:'https://note.com/'+ACCOUNT+'/n/'+x.key});
    }
    if(d.isLastPage===true||xs.length===0){ended=true;break;}
  }
  if(!ended) throw new Error('INVENTORY_DID_NOT_REACH_LAST_PAGE');
  return out;
}

function assertKeep(items,stage){
  for(const keep of KEEP){
    const hit=items.filter(x=>x.key===keep.key);
    if(hit.length!==1) throw new Error(stage+'_KEEP_KEY_'+keep.key+'_COUNT_'+hit.length);
    if(hit[0].title!==keep.title) throw new Error(stage+'_KEEP_TITLE_MISMATCH_'+keep.key+' got='+hit[0].title);
  }
}

async function stableInventory(){
  const a=await inventory();
  await sleep(1200);
  const b=await inventory();
  const ak=a.map(x=>x.key).sort().join(',');
  const bk=b.map(x=>x.key).sort().join(',');
  if(ak!==bk) throw new Error('INVENTORY_NOT_STABLE first='+a.length+' second='+b.length);
  assertKeep(b,'STABLE');
  return b;
}

async function firstVisible(candidates,timeout=700){
  for(const c of candidates){
    try{const x=c.first();if(await x.isVisible({timeout}))return x;}catch{}
  }
  return null;
}

async function articleGone(key,title){
  for(let i=1;i<=10;i++){
    try{
      const r=await fetch('https://note.com/'+ACCOUNT+'/n/'+key+'?cleanupVerify='+Date.now()+'-'+i,{
        headers:{'cache-control':'no-cache','user-agent':'worldsim-final-cleanup-verify/1.0'}
      });
      const html=await r.text();
      const missing=!r.ok||/お探しのページが見つかりません|ページが見つかりません|この記事は公開されていません/.test(html);
      if(missing) return true;
      if(!html.includes(title) && /note（ノート）/.test(html)) return true;
    }catch{}
    await sleep(800*i);
  }
  return false;
}

async function deleteExact(page,target){
  if(KEEP_KEYS.has(target.key)) throw new Error('PROTECTED_KEY_BLOCKED '+target.key);

  await page.goto('https://editor.note.com/notes/'+target.key+'/edit/',{
    waitUntil:'domcontentloaded',timeout:30000
  });
  await sleep(1000);

  if(/login|sign_in|accounts\.note\.com/i.test(page.url())) throw new Error('NOTE_LOGIN_REQUIRED');

  const body=norm(await page.locator('body').innerText().catch(()=>''));
  if(/ページが見つかりません|記事が見つかりません|存在しません/.test(body)) return 'already_removed';

  const menu=await firstVisible([
    page.getByRole('button',{name:/その他|メニュー|オプション/}),
    page.locator('button[aria-label*="その他"],button[aria-label*="メニュー"],button[title*="その他"],button[title*="メニュー"]')
  ],900);
  if(!menu) throw new Error('EDITOR_MENU_NOT_FOUND '+target.key);

  await menu.click({timeout:8000});
  await sleep(350);

  const del=await firstVisible([
    page.getByRole('menuitem',{name:/記事を削除|削除/}),
    page.getByText('記事を削除',{exact:true}),
    page.getByText('削除する',{exact:true}),
    page.locator('[role="menuitem"]').filter({hasText:/削除/})
  ],900);
  if(!del) throw new Error('DELETE_ITEM_NOT_FOUND '+target.key);

  let nativeAccepted=false;
  let nativeError=null;
  const nativeHandler=async dialog=>{
    try{
      const msg=norm(dialog.message());
      if(/削除|delete/i.test(msg)){await dialog.accept();nativeAccepted=true;}
      else await dialog.dismiss();
    }catch(e){nativeError=e;}
  };
  page.once('dialog',nativeHandler);
  try{
    await del.click({timeout:8000});
    await sleep(600);
    if(nativeError) throw nativeError;
    if(!nativeAccepted){
      const dialog=await firstVisible([page.getByRole('dialog'),page.locator('[role="alertdialog"]')],500);
      const root=dialog||page;
      const confirm=await firstVisible([
        root.getByRole('button',{name:/^(削除する|記事を削除|完全に削除|削除|はい|OK)$/}),
        root.locator('button').filter({hasText:/^(削除する|記事を削除|完全に削除)$/}),
        root.locator('input[type="submit"][value*="削除"],input[type="button"][value*="削除"]')
      ],700);
      if(!confirm) throw new Error('DELETE_CONFIRM_NOT_FOUND '+target.key);
      await confirm.click({timeout:8000});
    }
  }finally{
    page.off('dialog',nativeHandler);
  }

  if(!(await articleGone(target.key,target.title))) throw new Error('DELETE_NOT_VERIFIED '+target.key);
  return 'deleted_verified';
}

async function main(){
  fs.writeFileSync(LOG_PATH,'=== FINAL PUBLIC CLEANUP '+new Date().toISOString()+' ===\n','utf8');

  const cfg=readJson(CONFIG_PATH,{});
  const profileDir=path.resolve(__dirname,cfg.browserProfileDir||'./note_chrome_profile');

  const before=await stableInventory();
  assertKeep(before,'BEFORE');
  const targets=before.filter(x=>!KEEP_KEYS.has(x.key));
  writeJson(BACKUP_PATH,{capturedAt:new Date().toISOString(),account:ACCOUNT,keep:KEEP,publicBefore:before,targets});
  log('FINAL_CLEANUP_PLAN',{publicCount:before.length,keepCount:KEEP.length,deleteCount:targets.length});

  const state=readJson(STATE_PATH,{version:1,results:{},startedAt:new Date().toISOString()});
  const context=await chromium.launchPersistentContext(profileDir,{
    channel:'chrome',
    headless:cfg.headlessAutomation??cfg.headless??true,
    viewport:{width:1440,height:1000}
  });
  const page=context.pages()[0]||await context.newPage();

  try{
    for(let i=0;i<targets.length;i++){
      const t=targets[i];
      if(KEEP_KEYS.has(t.key)) throw new Error('INTERNAL_PROTECTED_TARGET '+t.key);
      if(state.results[t.key]?.status==='deleted_verified'||state.results[t.key]?.status==='already_removed') continue;

      log('DELETE_START',{index:i+1,total:targets.length,key:t.key,title:t.title});
      try{
        const status=await deleteExact(page,t);
        state.results[t.key]={status,title:t.title,at:new Date().toISOString()};
        state.updatedAt=new Date().toISOString();
        writeJson(STATE_PATH,state);
        log('DELETE_OK',{index:i+1,total:targets.length,key:t.key,status});
      }catch(e){
        state.results[t.key]={status:'failed',title:t.title,error:String(e&&e.message||e),at:new Date().toISOString()};
        state.updatedAt=new Date().toISOString();
        writeJson(STATE_PATH,state);
        await page.screenshot({path:path.join(LOG_DIR,'worldsim_final_cleanup_failed_'+t.key+'.png'),fullPage:true}).catch(()=>{});
        throw e;
      }
    }
  }finally{
    await context.close().catch(()=>{});
  }

  const after=await stableInventory();
  assertKeep(after,'AFTER');
  const extras=after.filter(x=>!KEEP_KEYS.has(x.key));
  if(extras.length) throw new Error('FINAL_EXTRAS_REMAIN '+extras.length+' '+extras.slice(0,8).map(x=>x.key).join(','));
  if(after.length!==4) throw new Error('FINAL_PUBLIC_COUNT_'+after.length);

  const profileRes=await fetch('https://note.com/'+ACCOUNT+'?finalVerify='+Date.now(),{
    headers:{'cache-control':'no-cache','user-agent':'worldsim-final-cleanup/1.0'}
  });
  const profileHtml=await profileRes.text();
  if(!profileRes.ok||!profileHtml.includes('AI世界観測所')||!profileHtml.includes('5,451人から始まった')){
    throw new Error('PROFILE_FINAL_VERIFY_FAILED');
  }

  state.status='completed';
  state.completedAt=new Date().toISOString();
  state.finalPublic=after;
  writeJson(STATE_PATH,state);
  log('FINAL_PUBLIC_CLEANUP_COMPLETED',{publicCount:after.length,keep:after.map(x=>x.key)});
}

main().catch(e=>{log('FINAL_PUBLIC_CLEANUP_FATAL',e&&e.stack||String(e));process.exitCode=1;});
