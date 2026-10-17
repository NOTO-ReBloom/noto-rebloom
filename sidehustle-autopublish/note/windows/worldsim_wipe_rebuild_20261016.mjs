import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, 'config.json');
const LOG_DIR = path.join(__dirname, 'logs');
const LOG_PATH = path.join(LOG_DIR, 'worldsim_wipe_rebuild_20261016.log');
const BACKUP_PATH = path.join(LOG_DIR, 'worldsim_pre_wipe_backup_20261016.json');
const RECEIPT_PATH = path.join(LOG_DIR, 'worldsim_wipe_rebuild_20261016_receipt.json');
const ACCOUNT = 'royal_lion645';
const RAW = 'https://raw.githubusercontent.com/NOTO-ReBloom/noto-rebloom/main/';
const QUEUE_REL = 'sidehustle-autopublish/note/worldsim/publication_queue.json';
const REQUEST_REL = 'sidehustle-autopublish/note/worldsim/rebuild_request.json';
let KEEP_TITLES = [];
const BRAND_NAME = 'AI世界観測所';
const BRAND_BIO = '5,451人から始まった3つの架空社会を7日ずつ観測。家族・仕事・価値観・人間関係から歴史が進みます。筋書きなし。起きたことだけ記録します。';
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

function normalize(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

async function fetchJsonResponse(url,label,headers={},attempts=8){
  let last='unknown';
  for(let i=1;i<=attempts;i++){
    try{
      const res=await fetch(url,{headers:{'accept':'application/json,text/plain,*/*','cache-control':'no-cache',...headers}});
      const text=await res.text();
      if(!res.ok) last='HTTP_'+res.status+' '+text.slice(0,160);
      else if(!text.trim()) last='EMPTY_RESPONSE';
      else{
        try{return JSON.parse(text);}
        catch(e){last='INVALID_JSON '+String(e&&e.message||e)+' body='+text.slice(0,160);}
      }
    }catch(e){
      last='FETCH_ERROR '+String(e&&e.message||e);
    }
    if(i<attempts) await sleep(Math.min(6000,800*i));
  }
  throw new Error(label+'_FAILED '+last);
}
async function fetchRemoteJson(rel){
  return await fetchJsonResponse(
    RAW+rel+'?t='+Date.now(),
    'REMOTE_CONFIG '+rel,
    {'user-agent':'worldsim-wipe/2.1'},
    6
  );
}
async function loadCanonicalLaunchConfig(){
  const [queue,request]=await Promise.all([fetchRemoteJson(QUEUE_REL),fetchRemoteJson(REQUEST_REL)]);
  const ids=Array.isArray(request.launchIds)?request.launchIds:[];
  if(ids.length!==4)throw new Error('CANONICAL_LAUNCH_ID_COUNT_'+ids.length);
  const entries=ids.map(id=>(queue.entries||[]).find(e=>e.id===id));
  if(entries.some(x=>!x))throw new Error('CANONICAL_LAUNCH_ENTRY_MISSING');
  const titles=entries.map(x=>normalize(x.title));
  if(new Set(titles).size!==4||titles.some(x=>!x))throw new Error('CANONICAL_LAUNCH_TITLES_INVALID');
  return{ids,titles,entries,requestId:request.requestId};
}

async function ensureAuth(page) {
  await page.goto('https://note.com/notes', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(1200);
  if (/login|sign_in|accounts\.note\.com/i.test(page.url())) throw new Error('HUMAN_AUTH_REQUIRED');
}

async function fetchPublic() {
  const all = [];
  for (let p = 1; p <= 100; p++) {
    const u = 'https://note.com/api/v2/creators/' + ACCOUNT + '/contents?kind=note&disabled_pinned=true&page=' + p + '&audit=' + Date.now();
    const o = await fetchJsonResponse(
      u,
      'NOTE_PUBLIC_PAGE_' + p,
      { 'user-agent':'worldsim-rebuild/1.1', 'referer':'https://note.com/' + ACCOUNT },
      10
    );
    const d = o.data || {};
    const items = Array.isArray(d.contents) ? d.contents : [];
    for (const x of items) {
      all.push({
        key: x.key,
        title: normalize(x.name),
        status: x.status,
        publishAt: x.publishAt || x.publish_at || null,
        price: x.price == null ? null : x.price,
        likes: x.likeCount == null ? null : x.likeCount,
        url: 'https://note.com/' + ACCOUNT + '/n/' + x.key
      });
    }
    if (d.isLastPage || items.length === 0) break;
  }
  return all;
}

function verifyLaunchSet(items) {
  const matches = {};
  for (const t of KEEP_TITLES) matches[t] = items.filter(x => x.title === t);
  for (const t of KEEP_TITLES) {
    if (matches[t].length !== 1) throw new Error('LAUNCH_SET_NOT_READY ' + t + ' count=' + matches[t].length);
  }
  return new Set(KEEP_TITLES.map(t => matches[t][0].key));
}

async function updateProfile(page) {
  await page.goto('https://note.com/' + ACCOUNT + '?profile=' + Date.now(), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(1000);
  let edit = page.getByRole('button', { name: /プロフィールを編集/ }).first();
  if (!(await edit.count())) edit = page.getByText('プロフィールを編集', { exact: false }).first();
  if (!(await edit.count())) throw new Error('PROFILE_EDIT_BUTTON_NOT_FOUND');
  await edit.click();
  await sleep(700);

  const fields = await page.locator('input,textarea').evaluateAll(els => els.map((e, i) => ({
    i, tag: e.tagName, name: e.getAttribute('name'), placeholder: e.getAttribute('placeholder'),
    aria: e.getAttribute('aria-label'), value: e.value
  })).slice(0, 30)).catch(() => []);
  log('PROFILE_FIELDS', fields);

  const nameSelectors = [
    'input[name="nickname"]',
    'input[placeholder*="ニックネーム"]',
    'input[placeholder*="名前"]',
    'input[aria-label*="ニックネーム"]',
    'input[aria-label*="名前"]'
  ];
  const bioSelectors = [
    'textarea[name="profile"]',
    'textarea[name="bio"]',
    'textarea[placeholder*="自己紹介"]',
    'textarea[placeholder*="プロフィール"]',
    'textarea[aria-label*="自己紹介"]',
    'textarea[aria-label*="プロフィール"]'
  ];

  let nameField = null;
  let bioField = null;
  for (const s of nameSelectors) {
    const l = page.locator(s).first();
    if (await l.count()) { nameField = l; break; }
  }
  for (const s of bioSelectors) {
    const l = page.locator(s).first();
    if (await l.count()) { bioField = l; break; }
  }

  if (!nameField) {
    const ins = page.locator('input');
    const count = await ins.count();
    for (let i = 0; i < count; i++) {
      const v = await ins.nth(i).inputValue().catch(() => '');
      if (/ノウハウ共有|おぢさん|おじさん/.test(v)) { nameField = ins.nth(i); break; }
    }
  }
  if (!bioField) {
    const tas = page.locator('textarea');
    if ((await tas.count()) === 1) bioField = tas.first();
  }

  if (!nameField || !bioField) throw new Error('PROFILE_FIELDS_AMBIGUOUS');

  await nameField.fill(BRAND_NAME);
  await bioField.fill(BRAND_BIO);

  const dialog = page.getByRole('dialog').first();
  const root = await dialog.count() ? dialog : page;
  const buttons = [
    root.getByRole('button', { name: /保存する|保存|更新する|更新/, exact: true }).first(),
    root.locator('button[type="submit"]').first()
  ];
  let saved = false;
  for (const b of buttons) {
    if (await b.count() && !(await b.isDisabled().catch(() => false))) {
      await b.click();
      saved = true;
      break;
    }
  }
  if (!saved) throw new Error('PROFILE_SAVE_NOT_FOUND');
  await sleep(1500);

  await page.goto('https://note.com/' + ACCOUNT + '?verify=' + Date.now(), { waitUntil: 'domcontentloaded', timeout: 30000 });
  const body = normalize(await page.locator('body').innerText().catch(() => ''));
  if (!body.includes(BRAND_NAME) || !body.includes('5,451人から始まった')) throw new Error('PROFILE_VERIFY_FAILED');
  log('PROFILE_UPDATED');
}

async function loadManage(page) {
  let payload = null;
  const handler = async response => {
    if (response.url().includes('/api/v2/note_list/contents')) {
      try { payload = await response.json(); } catch {}
    }
  };
  page.on('response', handler);
  await page.goto('https://note.com/notes?wipe=' + Date.now(), { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await sleep(400);
  page.off('response', handler);
  if (payload && payload.data && Array.isArray(payload.data.notes)) return payload.data.notes;

  const rows = page.locator('.o-articleList__item');
  const count = await rows.count();
  const out = [];
  for (let i = 0; i < count; i++) {
    const h = normalize(await rows.nth(i).locator('.o-articleList__heading').innerText().catch(() => ''));
    if (h) out.push({ key: null, name: h, noteDraft: { name: h }, _domIndex: i });
  }
  return out;
}

async function findRow(page, title, domIndex) {
  const rows = page.locator('.o-articleList__item');
  const count = await rows.count();
  if (domIndex != null && domIndex < count) return rows.nth(domIndex);
  for (let i = 0; i < count; i++) {
    const h = normalize(await rows.nth(i).locator('.o-articleList__heading').innerText().catch(() => ''));
    if (h === title) return rows.nth(i);
  }
  const text = page.getByText(title, { exact: true }).first();
  if (await text.count()) {
    let cur = text;
    for (let d = 0; d < 10; d++) {
      cur = cur.locator('xpath=..');
      if ((await cur.locator('button').count()) > 0) return cur;
    }
  }
  throw new Error('ROW_NOT_FOUND ' + title);
}

async function deleteCurrent(page, candidate) {
  const row = await findRow(page, candidate.title, candidate.domIndex);
  let menu = row.getByRole('button', { name: /その他|メニュー|オプション|記事メニュー/ }).first();
  if (!(await menu.count())) {
    const bs = row.locator('button');
    const count = await bs.count();
    let best = -1;
    let bestX = -1;
    for (let i = 0; i < count; i++) {
      const box = await bs.nth(i).boundingBox().catch(() => null);
      if (box && box.width > 0 && box.height > 0 && box.x > bestX) { best = i; bestX = box.x; }
    }
    if (best >= 0) menu = bs.nth(best);
  }
  if (!(await menu.count())) throw new Error('MENU_NOT_FOUND ' + candidate.title);

  await menu.click();
  await sleep(300);
  let del = page.getByRole('menuitem', { name: /記事を削除|削除/ }).first();
  if (!(await del.count())) del = page.getByText('記事を削除', { exact: true }).first();
  if (!(await del.count())) del = page.getByText('削除する', { exact: true }).first();
  if (!(await del.count())) del = page.getByText('削除', { exact: true }).first();
  if (!(await del.count())) throw new Error('DELETE_ITEM_NOT_FOUND ' + candidate.title);

  let nativeAccepted = false;
  const nativeHandler = async dialog => {
    const msg = normalize(dialog.message());
    log('DELETE_NATIVE_DIALOG', msg);
    if (/削除|delete/i.test(msg)) { await dialog.accept(); nativeAccepted = true; }
    else await dialog.dismiss();
  };
  page.once('dialog', nativeHandler);
  await del.click();
  await sleep(500);

  if (!nativeAccepted) {
    const dialog = page.getByRole('dialog').first();
    const root = await dialog.count() ? dialog : page;
    const patterns = [/削除する/, /記事を削除/, /完全に削除/, /^削除$/, /^OK$/, /^はい$/];
    let confirmed = false;
    for (let round = 0; round < 8 && !confirmed; round++) {
      for (const p of patterns) {
        const b = root.getByRole('button', { name: p }).first();
        if (await b.count()) {
          const txt = normalize(await b.innerText().catch(() => ''));
          if (!/削除しない|キャンセル/.test(txt) && !(await b.isDisabled().catch(() => false))) {
            await b.click();
            confirmed = true;
            break;
          }
        }
      }
      if (!confirmed && !nativeAccepted) await sleep(300);
    }
    if (!confirmed && !nativeAccepted) {
      page.off('dialog', nativeHandler);
      throw new Error('DELETE_CONFIRM_NOT_FOUND ' + candidate.title);
    }
  }
  page.off('dialog', nativeHandler);
  await sleep(900);
}

async function wipe(page, keepKeys, backup) {
  let deleted = 0;
  for (let round = 1; round <= 1500; round++) {
    const notes = await loadManage(page);
    if (!notes.length) break;
    let candidate = null;
    for (let i = 0; i < notes.length; i++) {
      const x = notes[i];
      const key = x.key || null;
      const title = normalize((x.noteDraft && x.noteDraft.name) || x.name || '');
      if (!title) continue;
      if (key && keepKeys.has(key)) continue;
      if (!key && KEEP_TITLES.includes(title)) continue;
      candidate = { key, title, status: x.status || null, domIndex: x._domIndex == null ? null : x._domIndex };
      break;
    }
    if (!candidate) break;
    backup.deleted.push(Object.assign({ deletedAt: new Date().toISOString() }, candidate));
    fs.writeFileSync(BACKUP_PATH, JSON.stringify(backup, null, 2), 'utf8');
    log('DELETE_TARGET', { round, candidate });
    await deleteCurrent(page, candidate);
    deleted++;
  }
  return deleted;
}

async function main() {
  fs.writeFileSync(LOG_PATH, '=== WORLDSIM REBUILD ' + new Date().toISOString() + ' ===\n', 'utf8');
  const cfg = readJson(CONFIG_PATH, {});
  const profileDir = path.resolve(__dirname, cfg.browserProfileDir || './note_chrome_profile');
  const context = await chromium.launchPersistentContext(profileDir, {
    channel: 'chrome',
    headless: cfg.headlessAutomation ?? cfg.headless ?? true,
    viewport: { width: 1440, height: 1000 }
  });
  const page = context.pages()[0] || await context.newPage();
  const receipt = { requestId: null, status: 'started', startedAt: new Date().toISOString() };

  try {
    await ensureAuth(page);
    const launchCfg=await loadCanonicalLaunchConfig();
    receipt.requestId=launchCfg.requestId;
    KEEP_TITLES=launchCfg.titles;
    log('CANONICAL_LAUNCH_CONFIG',{requestId:launchCfg.requestId,titles:KEEP_TITLES});

    const initial = await fetchPublic();
    const keepKeys = verifyLaunchSet(initial);
    log('LAUNCH_SET_VERIFIED', { keepKeys: Array.from(keepKeys), publicBefore: initial.length });

    const backup = {
      requestId: receipt.requestId,
      capturedAt: new Date().toISOString(),
      publicBefore: initial,
      keepTitles: KEEP_TITLES,
      keepKeys: Array.from(keepKeys),
      deleted: []
    };
    fs.writeFileSync(BACKUP_PATH, JSON.stringify(backup, null, 2), 'utf8');

    await updateProfile(page);
    receipt.profileUpdated = true;
    fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2), 'utf8');

    receipt.deletedCount = await wipe(page, keepKeys, backup);
    fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2), 'utf8');

    const finalPublic = await fetchPublic();
    const extras = finalPublic.filter(x => !keepKeys.has(x.key));
    const missing = Array.from(keepKeys).filter(k => !finalPublic.some(x => x.key === k));
    if (extras.length || missing.length) {
      throw new Error('FINAL_SET_MISMATCH extras=' + JSON.stringify(extras.slice(0, 10)) + ' missing=' + JSON.stringify(missing));
    }

    // Reader-visible verification is not enough: drafts/private remnants must also be gone.
    const finalManage = await loadManage(page);
    const manageExtras = [];
    for (const x of finalManage) {
      const key = x.key || null;
      const title = normalize((x.noteDraft && x.noteDraft.name) || x.name || '');
      if (!title) continue;
      if (key && keepKeys.has(key)) continue;
      if (!key && KEEP_TITLES.includes(title)) continue;
      manageExtras.push({ key, title, status: x.status || null });
    }
    if (manageExtras.length) {
      throw new Error('FINAL_MANAGE_SET_MISMATCH extras=' + JSON.stringify(manageExtras.slice(0, 20)));
    }
    receipt.finalManageVerified = true;
    receipt.finalManageVisibleCount = finalManage.length;

    receipt.status = 'completed';
    receipt.completedAt = new Date().toISOString();
    receipt.finalPublic = finalPublic;
    receipt.backupPath = BACKUP_PATH;
    fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2), 'utf8');
    log('REBUILD_COMPLETED', receipt);
  } catch (error) {
    receipt.status = 'failed';
    receipt.failedAt = new Date().toISOString();
    receipt.error = error && (error.stack || error.message) || String(error);
    fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2), 'utf8');
    log('REBUILD_FAILED', receipt.error);
    process.exitCode = 1;
  } finally {
    await context.close().catch(() => {});
  }
}

main();