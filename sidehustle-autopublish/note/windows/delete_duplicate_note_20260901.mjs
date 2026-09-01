import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, 'config.json');
const PLAN_PATH = path.join(__dirname, 'note_duplicate_cleanup_plan_20260901.json');
const LOG_DIR = path.join(__dirname, 'logs');
const LOG_PATH = path.join(LOG_DIR, 'delete_duplicate_note_20260901.log');
const ACCOUNT = 'royal_lion645';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

fs.mkdirSync(LOG_DIR, { recursive: true });

function normalize(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function log(...values) {
  const line = `[${new Date().toISOString()}] ${values.map(value => typeof value === 'string' ? value : JSON.stringify(value)).join(' ')}`;
  console.log(line);
  fs.appendFileSync(LOG_PATH, `${line}\n`);
}

function readJson(file, fallback = {}) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
  } catch {
    return fallback;
  }
}

const config = readJson(CONFIG_PATH);
const plan = readJson(PLAN_PATH);
const profileDir = path.resolve(__dirname, config.browserProfileDir || './note_chrome_profile');
const headless = config.headlessAutomation ?? config.headless ?? true;
const slowMo = Number(config.slowMoMs || 0);

function publicUrl(key) {
  return `https://note.com/${ACCOUNT}/n/${key}`;
}

async function firstVisible(candidates, timeout = 700) {
  for (const candidate of candidates) {
    try {
      const locator = candidate.first();
      if (await locator.isVisible({ timeout })) return locator;
    } catch {}
  }
  return null;
}

async function inspectPublic(browser, key, title) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  try {
    const response = await page.goto(`${publicUrl(key)}?verify=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1400);
    const body = normalize(await page.locator('body').innerText().catch(() => ''));
    const status = response?.status() || 0;
    const titleOk = body.includes(normalize(title));
    const missing = /お探しのページが見つかりません|ページが見つかりません|この記事は公開されていません/.test(body);
    return { key, status, titleOk, missing, publicExact: status === 200 && titleOk && !missing };
  } finally {
    await page.close();
  }
}

async function findVisibleTargetAnchor(page, key) {
  const candidate = page.locator(`a[href*="${key}"]`);
  const count = await candidate.count().catch(() => 0);
  for (let index = 0; index < count; index++) {
    if (await candidate.nth(index).isVisible({ timeout: 250 }).catch(() => false)) return candidate.nth(index);
  }
  return null;
}

async function openArticleListTarget(page, key) {
  const urls = ['https://note.com/notes', 'https://note.com/notes?status=published'];
  for (const url of urls) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2200);
    if (/login/.test(page.url())) throw new Error('NOTE_LOGIN_REQUIRED');
    let stableRounds = 0;
    let lastHeight = 0;
    for (let round = 0; round < 24; round++) {
      const anchor = await findVisibleTargetAnchor(page, key);
      if (anchor) return anchor;
      const height = await page.evaluate(() => document.documentElement.scrollHeight).catch(() => 0);
      if (height === lastHeight) stableRounds += 1;
      else stableRounds = 0;
      lastHeight = height;
      if (stableRounds >= 3) break;
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)).catch(() => {});
      await page.waitForTimeout(900);
    }
  }
  return null;
}

async function findDeleteItem(page) {
  return firstVisible([
    page.getByRole('menuitem', { name: /記事を削除|削除/ }),
    page.getByText('記事を削除', { exact: true }),
    page.getByText('削除する', { exact: true }),
    page.getByText('削除', { exact: true }),
    page.locator('[role="menuitem"]').filter({ hasText: /削除/ }),
  ], 600);
}

async function openDeleteFromExactRow(page, key, title) {
  const anchor = await openArticleListTarget(page, key);
  if (!anchor) throw new Error(`ARTICLE_LIST_TARGET_LINK_NOT_FOUND ${key}`);
  await anchor.scrollIntoViewIfNeeded();
  const href = await anchor.getAttribute('href');
  log('ARTICLE_LIST_TARGET_LINK_CONFIRMED', { key, href });
  let row = anchor;
  for (let depth = 1; depth <= 12; depth++) {
    row = row.locator('xpath=..');
    const rowText = normalize(await row.innerText().catch(() => ''));
    if (!rowText.includes(normalize(title))) continue;
    let menuButton = await firstVisible([
      row.getByRole('button', { name: /その他|メニュー|記事メニュー|オプション/ }),
      row.locator('button[aria-label*="その他"],button[aria-label*="メニュー"],button[title*="その他"],button[title*="メニュー"]'),
    ], 250);
    if (!menuButton) {
      const buttons = await row.locator('button').evaluateAll(elements => elements.map((button, index) => {
        const rect = button.getBoundingClientRect();
        return {index, visible: rect.width > 0 && rect.height > 0, x: rect.x, text: String(button.textContent || '').replace(/\s+/g, ' ').trim(), aria: button.getAttribute('aria-label') || '', title: button.getAttribute('title') || ''};
      }).filter(button => button.visible).sort((a, b) => b.x - a.x)).catch(() => []);
      log('ARTICLE_LIST_ROW_BUTTONS', { key, depth, buttons: buttons.slice(0, 12) });
      const selected = buttons.find(button => !/編集|表示|プレビュー|閉じる|キャンセル/.test(`${button.text} ${button.aria} ${button.title}`));
      if (selected) menuButton = row.locator('button').nth(selected.index);
    }
    if (!menuButton) continue;
    await menuButton.click();
    await page.waitForTimeout(450);
    const deleteItem = await findDeleteItem(page);
    if (deleteItem) return deleteItem;
    const menuText = normalize(await page.locator('body').innerText().catch(() => '')).slice(-1400);
    log('ARTICLE_LIST_MENU_NO_DELETE', { key, depth, menuText });
    await page.keyboard.press('Escape').catch(() => {});
  }
  throw new Error(`DELETE_MENU_ITEM_NOT_FOUND ${key}`);
}

async function confirmExactDelete(page, key) {
  if (!/note\.com\/notes/.test(page.url())) throw new Error(`ARTICLE_LIST_CHANGED_BEFORE_CONFIRM ${page.url()}`);
  const duplicateLinks = await page.locator(`a[href*="${key}"]`).count().catch(() => 0);
  if (duplicateLinks < 1) throw new Error(`TARGET_LINK_MISSING_BEFORE_CONFIRM ${key}`);
  const dialog = await firstVisible([page.getByRole('dialog'), page.locator('[role="alertdialog"]')], 1600);
  const scope = dialog || page;
  const confirm = await firstVisible([
    scope.getByRole('button', { name: /削除する/ }),
    scope.getByRole('button', { name: /^削除$/ }),
    scope.getByText('削除する', { exact: true }),
    scope.getByText('削除', { exact: true }),
  ], 1300);
  if (!confirm) throw new Error(`DELETE_CONFIRM_BUTTON_NOT_FOUND ${key}`);
  log('DELETE_CONFIRM_READY', { key, label: normalize(await confirm.innerText().catch(() => '')) });
  await confirm.click();
  await page.waitForTimeout(2500);
}

async function verifyRemoval(verifier, group, target) {
  let duplicate = null;
  for (let round = 1; round <= 10; round++) {
    duplicate = await inspectPublic(verifier, target.key, group.title);
    log('DELETE_PROPAGATION_CHECK', { round, duplicate });
    if (!duplicate.publicExact) break;
    await sleep(3500);
  }
  const keeper = await inspectPublic(verifier, group.keep.key, group.title);
  if (duplicate?.publicExact) throw new Error(`DUPLICATE_STILL_PUBLIC ${target.key}`);
  if (!keeper.publicExact) throw new Error(`KEEPER_POSTCHECK_FAILED ${group.keep.key}`);
}

async function fetchPublishedItems() {
  const pages = [];
  for (let start = 1; start <= 30; start += 6) {
    const requests = [];
    for (let page = start; page < start + 6 && page <= 30; page++) {
      const url = `https://note.com/api/v2/creators/${ACCOUNT}/contents?kind=note&disabled_pinned=true&page=${page}&audit=${Date.now()}-${page}`;
      requests.push(fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (compatible; duplicate-cleanup-audit/1.0)', 'cache-control': 'no-cache' } }).then(async response => {
        if (!response.ok) throw new Error(`AUDIT_HTTP_${response.status}_PAGE_${page}`);
        return { page, object: await response.json() };
      }));
    }
    pages.push(...await Promise.all(requests));
  }
  const items = [];
  for (const { object } of pages.sort((a, b) => a.page - b.page)) {
    const data = object.data || {};
    const contents = data.contents || [];
    items.push(...contents.filter(item => item?.status === 'published'));
    if (data.isLastPage || contents.length === 0) break;
  }
  return items;
}

async function auditRemainingDuplicates() {
  const items = await fetchPublishedItems();
  const groups = new Map();
  for (const item of items) {
    const title = normalize(item.name);
    if (!title) continue;
    if (!groups.has(title)) groups.set(title, []);
    groups.get(title).push(item.key);
  }
  return [...groups.entries()].filter(([, keys]) => keys.length > 1).map(([title, keys]) => ({ title, keys }));
}

async function main() {
  const groups = Array.isArray(plan.groups) ? plan.groups : [];
  const targets = groups.flatMap(group => (group.delete || []).map(target => ({ group, target })));
  const expectedGroups = Number(plan.duplicateTitleGroups);
  const expectedTargets = Number(plan.duplicatePagesToDelete);
  if (plan.account !== ACCOUNT || !Number.isInteger(expectedGroups) || !Number.isInteger(expectedTargets) || expectedGroups < 1 || expectedTargets < 1 || groups.length !== expectedGroups || targets.length !== expectedTargets) {
    throw new Error(`CLEANUP_PLAN_CONTRACT_FAILED groups=${groups.length}/${expectedGroups} targets=${targets.length}/${expectedTargets}`);
  }
  const deleteKeys = new Set();
  for (const { group, target } of targets) {
    for (const key of [group.keep?.key, target.key]) if (!/^n[0-9a-z]+$/i.test(key || '')) throw new Error(`CLEANUP_PLAN_KEY_FAILED ${key}`);
    if (group.keep.key === target.key || deleteKeys.has(target.key)) throw new Error(`CLEANUP_PLAN_DUPLICATE_KEY ${target.key}`);
    deleteKeys.add(target.key);
  }
  log('DELETE_ALL_DUPLICATES_START', { groups: groups.length, targets: targets.length, profileDir });
  const verifier = await chromium.launch({ channel: 'chrome', headless: true });
  fs.mkdirSync(profileDir, { recursive: true });
  const context = await chromium.launchPersistentContext(profileDir, { channel: 'chrome', headless: Boolean(headless), slowMo, viewport: { width: 1440, height: 1000 } });
  const page = context.pages()[0] || await context.newPage();
  const results = [];
  try {
    for (let index = 0; index < targets.length; index++) {
      const { group, target } = targets[index];
      log('TARGET_START', { index: index + 1, total: targets.length, title: group.title, keep: group.keep.key, delete: target.key });
      try {
        const keeperBefore = await inspectPublic(verifier, group.keep.key, group.title);
        const duplicateBefore = await inspectPublic(verifier, target.key, group.title);
        log('TARGET_PRECHECK', { keeper: keeperBefore, duplicate: duplicateBefore });
        if (!keeperBefore.publicExact) throw new Error(`KEEPER_PRECHECK_FAILED ${group.keep.key}`);
        if (!duplicateBefore.publicExact) { results.push({ key: target.key, status: 'already_removed' }); log('TARGET_ALREADY_REMOVED', target.key); continue; }
        const deleteItem = await openDeleteFromExactRow(page, target.key, group.title);
        log('DELETE_MENU_ITEM_FOUND', { key: target.key, label: normalize(await deleteItem.innerText().catch(() => '')) });
        await deleteItem.click();
        await page.waitForTimeout(650);
        await confirmExactDelete(page, target.key);
        await verifyRemoval(verifier, group, target);
        results.push({ key: target.key, status: 'deleted_verified' });
        log('TARGET_DELETE_SUCCESS_VERIFIED', { keep: group.keep.key, deleted: target.key });
      } catch (error) {
        results.push({ key: target.key, status: 'failed', error: error?.message || String(error) });
        log('TARGET_DELETE_FAILED', { key: target.key, error: error?.stack || error?.message || String(error) });
        await page.screenshot({ path: path.join(LOG_DIR, `delete_duplicate_failed_${target.key}.png`), fullPage: true }).catch(() => {});
      }
    }
  } finally {
    await context.close().catch(() => {});
    await verifier.close().catch(() => {});
  }
  const deleted = results.filter(result => result.status === 'deleted_verified').length;
  const alreadyRemoved = results.filter(result => result.status === 'already_removed').length;
  const failed = results.filter(result => result.status === 'failed').length;
  let remaining = [];
  for (let round = 1; round <= 3; round++) {
    remaining = await auditRemainingDuplicates();
    log('FINAL_DUPLICATE_AUDIT', { round, duplicateGroups: remaining.length, groups: remaining });
    if (remaining.length === 0) break;
    await sleep(10000);
  }
  log('DELETE_ALL_DUPLICATES_DONE', { deleted, alreadyRemoved, failed, remainingDuplicateGroups: remaining.length, results });
  if (failed > 0 || remaining.length > 0) process.exitCode = 1;
}

main().catch(error => {
  log('DELETE_ALL_DUPLICATES_FATAL', error?.stack || error?.message || String(error));
  process.exitCode = 1;
});
