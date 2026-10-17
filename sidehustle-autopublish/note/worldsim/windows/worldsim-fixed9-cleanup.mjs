import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ACCOUNT = 'royal_lion645';
const CONFIG_PATH = path.join(__dirname,'config.json');
const LOG_DIR = path.join(__dirname,'logs');
const LOG_PATH = path.join(LOG_DIR,'worldsim_fixed9_cleanup.log');
const BACKUP_PATH = path.join(LOG_DIR,'worldsim_fixed9_inventory.json');
const STATE_PATH = path.join(LOG_DIR,'worldsim_fixed9_state.json');
const KEEP = [
  {key:'n7cd373fc8c20',title:'3つの国を同じ世界に置きました。まだ、互いの存在を知りません'},
  {key:'nad366a73d9c1',title:'港は木を欲しがった。山は4票で反対した｜アルカ、最初の7日'},
  {key:'na29741584097',title:'賛成は6、反対2。それでも灌漑整備は否決された｜ミレア、最初の7日'},
  {key:'nf4ab129b1b02',title:'鉱山を2日止める。6対3で安全点検が通った｜ヴァルド、最初の7日'}
];
const KEEP_KEYS = new Set(KEEP.map(x=>x.key));
const sleep = ms => new Promise(r=>setTimeout(r,ms));
fs.mkdirSync(LOG_DIR,{recursive:true});

function norm(v){return String(v||'').replace(/\s+/g,' ').trim();}
function log(...xs){const s='['+new Date().toISOString()+'] '+xs.map(x=>typeof x==='string'?x:JSON.stringify(x)).join(' ');console.log(s);fs.appendFileSync(LOG_PATH,s+'\n','utf8');}
function readJson(p,f={}){try{return JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));}catch{return f;}}
function writeJson(p,o){fs.writeFileSync(p,JSON.stringify(o,null,2)+'\n','utf8');}
function pubUrl(k){return 'https://note.com/'+ACCOUNT+'/n/'+k;}
function editorUrl(k){return 'https://editor.note.com/notes/'+k+'/edit/';}
function keyFromText(s){const m=String(s||'').match(/(?:\/notes\/|\/n\/)(n[0-9a-z]{8,})(?:\/|\?|#|$)/i);return m?m[1]:null;}

async function fetchJson(url,label,attempts=8){
  let last='unknown';
  for(let i=1;i<=attempts;i++){
    try{
      const r=await fetch(url,{headers:{'accept':'application/json,text/plain,*/*','cache-control':'no-cache','user-agent':'worldsim-fixed9/1.0'}});
      const t=await r.text();
      if(!r.ok) last='HTTP_'+r.status;
      else if(!t.trim()) last='EMPTY';
      else {try{return JSON.parse(t);}catch(e){last='INVALID_JSON '+String(e.message||e);}}
    }catch(e){last=String(e&&e.message||e);}
    if(i<attempts) await sleep(Math.min(4000,600*i));
  }
  throw new Error(label+' '+last);
}

async function fetchPublished(){
  const out=[];
  for(let p=1;p<=120;p++){
    let o;
    try{o=await fetchJson('https://note.com/api/v2/creators/'+ACCOUNT+'/contents?kind=note&disabled_pinned=true&page='+p+'&audit='+Date.now()+'-'+p,'PUBLIC_PAGE_'+p,8);}
    catch(e){
      if(p>1 && / EMPTY$/.test(String(e.message||e))){log('PUBLIC_LIST_EMPTY_END',{page:p,count:out.length});break;}
      throw e;
    }
    const d=o.data||{}, xs=Array.isArray(d.contents)?d.contents:[];
    for(const x of xs) if(x&&x.status==='published') out.push({key:x.key,title:norm(x.name),url:pubUrl(x.key),price:x.price??null});
    if(d.isLastPage||xs.length===0) break;
  }
  return out;
}

async function publicExists(key,title=''){
  for(let i=1;i<=5;i++){
    try{
      const r=await fetch(pubUrl(key)+'?v='+Date.now()+'-'+i,{headers:{'cache-control':'no-cache','user-agent':'worldsim-fixed9-verify/1.0'}});
      const h=await r.text();
      const missing=!r.ok||/お探しのページが見つかりません|ページが見つかりません|この記事は公開されていません/.test(h);
      return {exists:!missing,titleOk:!title||h.includes(title),status:r.status};
    }catch(e){if(i===5)return {exists:false,titleOk:false,status:0,error:String(e&&e.message||e)};await sleep(500*i);}
  }
}

async function firstVisible(cands,timeout=500){
  for(const c of cands){try{const l=c.first();if(await l.isVisible({timeout}))return l;}catch{}}
  return null;
}

async function confirmDelete(page,key){
  let native=false;
  const handler=async d=>{const m=norm(d.message()); if(/削除|delete/i.test(m)){await d.accept();native=true;}else await d.dismiss();};
  page.once('dialog',handler);
  try{
    for(let r=1;r<=14;r++){
      if(native){await sleep(900);return true;}
      const dialog=await firstVisible([page.getByRole('dialog'),page.locator('[role="alertdialog"]')],180);
      const root=dialog||page;
      const b=await firstVisible([
        root.getByRole('button',{name:/^(削除する|記事を削除|完全に削除|削除|はい|OK)$/}),
        root.locator('button').filter({hasText:/^(削除する|記事を削除|完全に削除)$/}),
        root.locator('input[type="submit"][value*="削除"],input[type="button"][value*="削除"]')
      ],220);
      if(b && await b.isEnabled().catch(()=>true)){await b.click({timeout:5000});await sleep(900);return true;}
      await sleep(300);
    }
  }finally{page.off('dialog',handler);}
  return false;
}

async function deleteByEditor(page,key){
  if(KEEP_KEYS.has(key)) throw new Error('KEEP_DELETE_BLOCKED '+key);
  await page.goto(editorUrl(key),{waitUntil:'domcontentloaded',timeout:30000});
  await sleep(900);
  const body=norm(await page.locator('body').innerText().catch(()=>''));
  if(/ページが見つかりません|記事が見つかりません|存在しません/.test(body)) return 'already_removed';

  const menu=await firstVisible([
    page.getByRole('button',{name:/その他|メニュー|オプション/}),
    page.locator('button[aria-label*="その他"],button[aria-label*="メニュー"],button[title*="その他"],button[title*="メニュー"]')
  ],700);
  if(!menu) throw new Error('EDITOR_MENU_NOT_FOUND '+key);
  await menu.click({timeout:7000}); await sleep(350);

  const del=await firstVisible([
    page.getByRole('menuitem',{name:/記事を削除|削除/}),
    page.getByText('記事を削除',{exact:true}),
    page.getByText('削除する',{exact:true}),
    page.locator('[role="menuitem"]').filter({hasText:/削除/})
  ],700);
  if(!del) throw new Error('EDITOR_DELETE_NOT_FOUND '+key);

  let nativeAccepted=false;
  const nativeHandler=async d=>{const m=norm(d.message());if(/削除|delete/i.test(m)){await d.accept();nativeAccepted=true;}else await d.dismiss();};
  page.once('dialog',nativeHandler);
  try{
    await del.click({timeout:7000}); await sleep(500);
    if(nativeAccepted){await sleep(900);return 'deleted';}
    const ok=await confirmDelete(page,key);
    if(!ok&&!nativeAccepted) throw new Error('EDITOR_DELETE_CONFIRM_NOT_FOUND '+key);
    return 'deleted';
  }finally{page.off('dialog',nativeHandler);}
}

function collectKeysDeep(v,out){
  if(v==null)return;
  if(typeof v==='string'){
    const k=keyFromText(v); if(k) out.add(k);
    if(/^n[0-9a-z]{8,}$/i.test(v)) out.add(v);
    return;
  }
  if(Array.isArray(v)){for(const x of v)collectKeysDeep(x,out);return;}
  if(typeof v==='object'){
    for(const [k,val] of Object.entries(v)){
      if((k==='key'||k==='noteKey'||k==='note_key'||k==='id')&&typeof val==='string'&&/^n[0-9a-z]{8,}$/i.test(val))out.add(val);
      collectKeysDeep(val,out);
    }
  }
}

async function collectManageKeys(page){
  const keys=new Set();
  const onResponse=async resp=>{
    if(!/\/api\/v2\/note_list\/contents|\/api\/.*notes/i.test(resp.url()))return;
    try{const obj=await resp.json();collectKeysDeep(obj,keys);}catch{}
  };
  page.on('response',onResponse);
  try{
    for(const u of ['https://note.com/notes','https://note.com/notes?status=published','https://note.com/notes?status=draft']){
      await page.goto(u,{waitUntil:'domcontentloaded',timeout:30000}); await sleep(1000);
      let last=0,stable=0;
      for(let round=0;round<45;round++){
        const hrefs=await page.locator('a[href]').evaluateAll(as=>as.map(a=>a.href)).catch(()=>[]);
        for(const h of hrefs){const k=keyFromText(h);if(k)keys.add(k);}
        const h=await page.evaluate(()=>document.documentElement.scrollHeight).catch(()=>0);
        stable=h===last?stable+1:0; last=h;
        if(stable>=5)break;
        await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight)).catch(()=>{});
        await sleep(450);
      }
    }
  }finally{page.off('response',onResponse);}
  return keys;
}

async function main(){
  fs.writeFileSync(LOG_PATH,'=== FIXED9 '+new Date().toISOString()+' ===\n','utf8');
  const cfg=readJson(CONFIG_PATH,{});
  const profileDir=path.resolve(__dirname,cfg.browserProfileDir||'./note_chrome_profile');
  const state=readJson(STATE_PATH,{version:1,results:{},startedAt:new Date().toISOString()});

  const publicBefore=await fetchPublished();
  for(const k of KEEP){
    const v=await publicExists(k.key,k.title);
    if(!v.exists||!v.titleOk)throw new Error('KEEP_PRECHECK_FAILED '+k.key);
  }
  const publicExtras=publicBefore.filter(x=>!KEEP_KEYS.has(x.key));
  log('PUBLIC_AUDIT',{count:publicBefore.length,extras:publicExtras.length,keep:KEEP.map(x=>x.key)});

  const context=await chromium.launchPersistentContext(profileDir,{channel:'chrome',headless:cfg.headlessAutomation??cfg.headless??true,viewport:{width:1440,height:1000}});
  const page=context.pages()[0]||await context.newPage();
  try{
    for(let i=0;i<publicExtras.length;i++){
      const t=publicExtras[i];
      if(KEEP_KEYS.has(t.key))continue;
      const now=await publicExists(t.key,t.title);
      if(!now.exists){state.results[t.key]={status:'already_removed',kind:'public',at:new Date().toISOString()};continue;}
      try{
        const s=await deleteByEditor(page,t.key);
        for(let j=1;j<=8;j++){
          const chk=await publicExists(t.key,t.title);
          if(!chk.exists)break;
          if(j===8)throw new Error('PUBLIC_STILL_EXISTS '+t.key);
          await sleep(500*j);
        }
        state.results[t.key]={status:s,kind:'public',at:new Date().toISOString()};
        log('PUBLIC_EXTRA_DELETED',{index:i+1,total:publicExtras.length,key:t.key,title:t.title});
      }catch(e){
        state.results[t.key]={status:'failed',kind:'public',error:String(e&&e.message||e),at:new Date().toISOString()};
        writeJson(STATE_PATH,state);
        throw e;
      }
      if((i+1)%10===0)writeJson(STATE_PATH,state);
    }

    const pubAfter=await fetchPublished();
    const stillPublic=pubAfter.filter(x=>!KEEP_KEYS.has(x.key));
    if(stillPublic.length)throw new Error('PUBLIC_EXTRAS_REMAIN '+stillPublic.length+' first='+stillPublic.slice(0,5).map(x=>x.key).join(','));
    log('PUBLIC_CLEAN',{count:pubAfter.length});

    let pass=0;
    while(pass<8){
      pass++;
      const keys=await collectManageKeys(page);
      const extras=[...keys].filter(k=>!KEEP_KEYS.has(k));
      log('MANAGE_AUDIT',{pass,discovered:keys.size,extras:extras.length});
      if(pass===1)writeJson(BACKUP_PATH,{capturedAt:new Date().toISOString(),publicBefore,manageKeys:[...keys],keep:KEEP});
      if(!extras.length)break;
      let progress=0;
      for(let i=0;i<extras.length;i++){
        const key=extras[i];
        if(KEEP_KEYS.has(key))continue;
        try{
          const s=await deleteByEditor(page,key);
          state.results[key]={status:s,kind:'manage',at:new Date().toISOString()};
          progress++;
          log('MANAGE_EXTRA_DELETED',{pass,index:i+1,total:extras.length,key});
        }catch(e){
          const msg=String(e&&e.message||e);
          if(/EDITOR_MENU_NOT_FOUND|EDITOR_DELETE_NOT_FOUND/.test(msg)){
            state.results[key]={status:'not_editable_or_already_removed',kind:'manage',error:msg,at:new Date().toISOString()};
            log('MANAGE_EXTRA_SKIPPED',{key,error:msg});
          }else{
            state.results[key]={status:'failed',kind:'manage',error:msg,at:new Date().toISOString()};
            writeJson(STATE_PATH,state);
            throw e;
          }
        }
        if((i+1)%10===0)writeJson(STATE_PATH,state);
      }
      writeJson(STATE_PATH,state);
      if(progress===0)break;
    }

    const finalPublic=await fetchPublished();
    const finalExtras=finalPublic.filter(x=>!KEEP_KEYS.has(x.key));
    const missing=KEEP.filter(k=>!finalPublic.some(x=>x.key===k.key));
    if(finalExtras.length||missing.length)throw new Error('FINAL_PUBLIC_MISMATCH extras='+finalExtras.length+' missing='+missing.map(x=>x.key).join(','));
    for(const k of KEEP){const v=await publicExists(k.key,k.title);if(!v.exists||!v.titleOk)throw new Error('KEEP_POSTCHECK_FAILED '+k.key);}

    const finalManage=await collectManageKeys(page);
    const finalManageExtras=[...finalManage].filter(k=>!KEEP_KEYS.has(k));
    if(finalManageExtras.length)throw new Error('FINAL_MANAGE_EXTRAS_REMAIN '+finalManageExtras.length+' first='+finalManageExtras.slice(0,10).join(','));

    state.status='completed';state.completedAt=new Date().toISOString();state.finalPublic=finalPublic;writeJson(STATE_PATH,state);
    log('FIXED9_COMPLETED',{publicCount:finalPublic.length,manageCount:finalManage.size});
  }finally{await context.close().catch(()=>{});}
}
main().catch(e=>{log('FIXED9_FATAL',e&&e.stack||String(e));process.exitCode=1;});
