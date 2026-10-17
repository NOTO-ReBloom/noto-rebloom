import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const ACCOUNT='royal_lion645';
const CONFIG_PATH=path.join(__dirname,'config.json');
const LOG_DIR=path.join(__dirname,'logs');
const LOG_PATH=path.join(LOG_DIR,'worldsim_finalize2_cleanup.log');
const BACKUP_PATH=path.join(LOG_DIR,'worldsim_finalize2_public_backup.json');
const KEEP=[
  {key:'n0fe222a4c273',title:'3つの国を同じ世界に置きました。まだ、互いの存在を知りません'},
  {key:'n158e9b7da82a',title:'港は木を欲しがった。山は4票で反対した｜アルカ、最初の7日'},
  {key:'n992001bc5844',title:'賛成は6、反対2。それでも灌漑整備は否決された｜ミレア、最初の7日'},
  {key:'nff17a64062f0',title:'鉱山を2日止める。6対3で安全点検が通った｜ヴァルド、最初の7日'}
];
const KEEP_KEYS=new Set(KEEP.map(x=>x.key));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
fs.mkdirSync(LOG_DIR,{recursive:true});

function norm(v){return String(v||'').replace(/\s+/g,' ').trim();}
function log(...xs){const line='['+new Date().toISOString()+'] '+xs.map(x=>typeof x==='string'?x:JSON.stringify(x)).join(' ');console.log(line);fs.appendFileSync(LOG_PATH,line+'\n','utf8');}
function readJson(p,f={}){try{return JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));}catch{return f;}}
function writeJson(p,o){fs.writeFileSync(p,JSON.stringify(o,null,2)+'\n','utf8');}

async function fetchJson(url,label,attempts=10){
  let last='unknown';
  for(let i=1;i<=attempts;i++){
    try{
      const r=await fetch(url,{headers:{'accept':'application/json,text/plain,*/*','cache-control':'no-cache','user-agent':'worldsim-finalize2/1.0'}});
      const t=await r.text();
      if(!r.ok) last='HTTP_'+r.status;
      else if(!t.trim()) last='EMPTY_RESPONSE';
      else {try{return JSON.parse(t);}catch(e){last='INVALID_JSON '+String(e&&e.message||e);}}
    }catch(e){last=String(e&&e.message||e);}
    if(i<attempts) await sleep(Math.min(5000,700*i));
  }
  throw new Error(label+' '+last);
}

async function inventory(){
  const out=[],seen=new Set();
  let ended=false;
  for(let page=1;page<=100;page++){
    const u='https://note.com/api/v2/creators/'+ACCOUNT+'/contents?kind=note&disabled_pinned=true&page='+page+'&audit='+Date.now()+'-'+page;
    const o=await fetchJson(u,'PUBLIC_PAGE_'+page,10);
    const d=o.data||{},xs=Array.isArray(d.contents)?d.contents:[];
    for(const x of xs){
      if(!x||x.status!=='published'||!x.key||seen.has(x.key)) continue;
      seen.add(x.key);
      out.push({key:x.key,title:norm(x.name),url:'https://note.com/'+ACCOUNT+'/n/'+x.key,price:Number(x.price||0)});
    }
    if(d.isLastPage===true||xs.length===0){ended=true;break;}
  }
  if(!ended) throw new Error('INVENTORY_NOT_COMPLETE');
  return out;
}

function assertKeep(items,stage){
  for(const k of KEEP){
    const hits=items.filter(x=>x.key===k.key);
    if(hits.length!==1) throw new Error(stage+'_KEEP_COUNT '+k.key+' '+hits.length);
    if(hits[0].title!==k.title) throw new Error(stage+'_KEEP_TITLE '+k.key+' got='+hits[0].title);
  }
}

async function stableInventory(){
  const a=await inventory(); await sleep(900); const b=await inventory();
  const ak=a.map(x=>x.key).sort().join(','),bk=b.map(x=>x.key).sort().join(',');
  if(ak!==bk) throw new Error('PUBLIC_INVENTORY_UNSTABLE '+a.length+' '+b.length);
  assertKeep(b,'STABLE');
  return b;
}

async function inspectPublic(key,title){
  for(let i=1;i<=8;i++){
    try{
      const r=await fetch('https://note.com/'+ACCOUNT+'/n/'+key+'?v='+Date.now()+'-'+i,{headers:{'cache-control':'no-cache','user-agent':'worldsim-finalize2-verify/1.0'}});
      const html=await r.text();
      const missing=!r.ok||/お探しのページが見つかりません|ページが見つかりません|この記事は公開されていません/.test(html);
      return {exists:!missing,titleOk:html.includes(title),status:r.status};
    }catch(e){
      if(i===8)return {exists:false,titleOk:false,status:0,error:String(e&&e.message||e)};
      await sleep(500*i);
    }
  }
}

async function firstVisible(cands,timeout=600){
  for(const c of cands){try{const l=c.first();if(await l.isVisible({timeout}))return l;}catch{}}
  return null;
}

async function findAnchor(page,key){
  const c=page.locator('a[href*="'+key+'"]');
  const n=await c.count().catch(()=>0);
  for(let i=0;i<n;i++){
    if(await c.nth(i).isVisible({timeout:200}).catch(()=>false)) return c.nth(i);
  }
  return null;
}

async function openTargetRow(page,target){
  for(const u of ['https://note.com/notes?status=published','https://note.com/notes']){
    await page.goto(u,{waitUntil:'domcontentloaded',timeout:30000});
    await sleep(1200);
    if(/login|sign_in/.test(page.url())) throw new Error('NOTE_LOGIN_REQUIRED');
    let last=0,stable=0;
    for(let round=0;round<45;round++){
      const a=await findAnchor(page,target.key);
      if(a){
        await a.scrollIntoViewIfNeeded();
        let row=a;
        for(let depth=1;depth<=14;depth++){
          row=row.locator('xpath=..');
          const txt=norm(await row.innerText().catch(()=>''));
          if(!txt.includes(target.title)) continue;
          return {anchor:a,row,depth};
        }
        throw new Error('TARGET_ROW_TITLE_MISMATCH '+target.key);
      }
      const h=await page.evaluate(()=>document.documentElement.scrollHeight).catch(()=>0);
      stable=h===last?stable+1:0;last=h;
      if(stable>=4)break;
      await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight)).catch(()=>{});
      await sleep(500);
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
  ],700);
}

async function openDeleteFromExactRow(page,target){
  if(KEEP_KEYS.has(target.key)) throw new Error('PROTECTED_KEY_BLOCKED '+target.key);
  const hit=await openTargetRow(page,target);
  if(!hit) throw new Error('TARGET_ROW_NOT_FOUND '+target.key);
  const {row}=hit;

  let menu=await firstVisible([
    row.getByRole('button',{name:/その他|メニュー|記事メニュー|オプション/}),
    row.locator('button[aria-label*="その他"],button[aria-label*="メニュー"],button[title*="その他"],button[title*="メニュー"]')
  ],500);

  if(!menu){
    const buttons=await row.locator('button').evaluateAll(es=>es.map((e,index)=>{
      const r=e.getBoundingClientRect();
      return {index,visible:r.width>0&&r.height>0,x:r.x,label:(String(e.textContent||'')+' '+String(e.getAttribute('aria-label')||'')+' '+String(e.getAttribute('title')||'')).replace(/\s+/g,' ').trim()};
    }).filter(x=>x.visible).sort((a,b)=>b.x-a.x)).catch(()=>[]);
    const selected=buttons.find(b=>!/編集|表示|プレビュー|閉じる|キャンセル/.test(b.label));
    if(selected) menu=row.locator('button').nth(selected.index);
  }
  if(!menu) throw new Error('ROW_MENU_NOT_FOUND '+target.key);

  await menu.click({timeout:8000});
  await sleep(350);
  const del=await findDeleteItem(page);
  if(!del) throw new Error('ROW_DELETE_ITEM_NOT_FOUND '+target.key);
  return del;
}

async function confirmDelete(page,key,del){
  if(KEEP_KEYS.has(key)) throw new Error('PROTECTED_CONFIRM_BLOCKED '+key);
  let nativeAccepted=false;
  const handler=async dialog=>{
    const m=norm(dialog.message());
    if(/削除|delete/i.test(m)){await dialog.accept();nativeAccepted=true;} else await dialog.dismiss();
  };
  page.once('dialog',handler);
  try{
    await del.click({timeout:8000});await sleep(500);
    for(let round=1;round<=12;round++){
      if(nativeAccepted){await sleep(900);return;}
      const dialog=await firstVisible([page.getByRole('dialog'),page.locator('[role="alertdialog"]')],250);
      const root=dialog||page;
      const b=await firstVisible([
        root.getByRole('button',{name:/^(削除する|記事を削除|完全に削除|削除|はい|OK)$/}),
        root.locator('button').filter({hasText:/^(削除する|記事を削除|完全に削除)$/}),
        root.locator('input[type="submit"][value*="削除"],input[type="button"][value*="削除"]')
      ],350);
      if(b&&await b.isEnabled().catch(()=>true)){await b.click({timeout:8000});await sleep(900);return;}
      await sleep(350);
    }
  }finally{page.off('dialog',handler);}
  throw new Error('DELETE_CONFIRM_NOT_FOUND '+key);
}

async function deleteTarget(page,target){
  if(KEEP_KEYS.has(target.key)) throw new Error('PROTECTED_TARGET_BLOCKED '+target.key);
  const before=await inspectPublic(target.key,target.title);
  if(!before.exists) return 'already_removed';
  if(!before.titleOk) throw new Error('PUBLIC_TITLE_MISMATCH '+target.key);

  const del=await openDeleteFromExactRow(page,target);
  await confirmDelete(page,target.key,del);

  for(let i=1;i<=10;i++){
    const after=await inspectPublic(target.key,target.title);
    if(!after.exists) return 'deleted_verified';
    await sleep(700*i);
  }
  throw new Error('DELETE_NOT_VERIFIED '+target.key);
}

async function main(){
  fs.writeFileSync(LOG_PATH,'=== FINALIZE2 '+new Date().toISOString()+' ===\n','utf8');
  const cfg=readJson(CONFIG_PATH,{});
  const profileDir=path.resolve(__dirname,cfg.browserProfileDir||'./note_chrome_profile');

  const before=await stableInventory();
  assertKeep(before,'BEFORE');
  const targets=before.filter(x=>!KEEP_KEYS.has(x.key));
  writeJson(BACKUP_PATH,{capturedAt:new Date().toISOString(),keep:KEEP,publicBefore:before,targets});
  log('FINALIZE2_PLAN',{publicCount:before.length,keepCount:KEEP.length,deleteCount:targets.length});

  const context=await chromium.launchPersistentContext(profileDir,{channel:'chrome',headless:cfg.headlessAutomation??cfg.headless??true,viewport:{width:1440,height:1000}});
  const page=context.pages()[0]||await context.newPage();
  try{
    for(let i=0;i<targets.length;i++){
      const t=targets[i];
      log('DELETE_START',{index:i+1,total:targets.length,key:t.key,title:t.title});
      const status=await deleteTarget(page,t);
      log('DELETE_OK',{index:i+1,total:targets.length,key:t.key,status});
      if((i+1)%8===0) await sleep(800);
    }
  }finally{await context.close().catch(()=>{});}

  const after=await stableInventory();
  assertKeep(after,'AFTER');
  const extras=after.filter(x=>!KEEP_KEYS.has(x.key));
  if(extras.length) throw new Error('FINAL_EXTRAS_REMAIN '+extras.length+' '+extras.slice(0,10).map(x=>x.key).join(','));
  if(after.length!==4) throw new Error('FINAL_COUNT_'+after.length);

  for(const k of KEEP){
    const v=await inspectPublic(k.key,k.title);
    if(!v.exists||!v.titleOk) throw new Error('KEEP_POSTCHECK_FAILED '+k.key);
  }

  log('FINALIZE2_PUBLIC_CLEANUP_COMPLETED',{publicCount:after.length,keys:after.map(x=>x.key)});
}
main().catch(e=>{log('FINALIZE2_FATAL',e&&e.stack||String(e));process.exitCode=1;});
