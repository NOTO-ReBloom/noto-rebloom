import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DUPLICATE_KEY = 'n87015acc50ff';
const KEEPER_KEY = 'n279e2c77b7b1';
const EXPECTED_TITLE = '卒論面談の前日に用意したい4つのメモ｜相談したのに進まないを防ぐ';
const ACCOUNT = 'royal_lion645';
const DUPLICATE_PUBLIC_URL = `https://note.com/${ACCOUNT}/n/${DUPLICATE_KEY}`;
const KEEPER_PUBLIC_URL = `https://note.com/${ACCOUNT}/n/${KEEPER_KEY}`;
const DUPLICATE_EDITOR_URL = `https://editor.note.com/notes/${DUPLICATE_KEY}/edit/`;
const CONFIG_PATH = path.join(__dirname, 'config.json');
const LOG_DIR = path.join(__dirname, 'logs');
const LOG_PATH = path.join(LOG_DIR, 'delete_duplicate_note_20260828.log');

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
const profileDir = path.resolve(__dirname, config.browserProfileDir || './note_chrome_profile');
const headless = config.headlessAutomation ?? config.headless ?? true;
const slowMo = Number(config.slowMoMs || 0);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function firstVisible(candidates, timeout = 700) {
  for (const candidate of candidates) {
    try {
      const locator = candidate.first();
      if (await locator.isVisible({ timeout })) return locator;
    } catch {}
  }
  return null;
}

async function inspectPublic(browser, url) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  try {
    const separator = url.includes('?') ? '&' : '?';
    const response = await page.goto(`${url}${separator}verify=${Date.now()}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await page.waitForTimeout(1800);
    const body = normalize(await page.locator('body').innerText().catch(() => ''));
    const status = response?.status() || 0;
    const titleOk = body.includes(normalize(EXPECTED_TITLE));
    const missing = /お探しのページが見つかりません|ページが見つかりません|この記事は公開されていません/.test(body);
    return { url, status, titleOk, missing, publicExact: status === 200 && titleOk && !missing };
  } finally {
    await page.close();
  }
}

async function findDeleteItem(page) {
  return firstVisible([
    page.getByRole('menuitem', { name: /記事を削除|削除/ }),
    page.getByText('記事を削除', { exact: true }),
    page.getByText('削除', { exact: true }),
    page.locator('[role="menuitem"]').filter({ hasText: /削除/ }),
  ], 450);
}

async function openDeleteMenu(page) {
  const namedMenus = [
    page.getByRole('button', { name: /その他|メニュー|記事メニュー|オプション/ }),
    page.locator('button[aria-label*="その他"],button[aria-label*="メニュー"],button[title*="その他"],button[title*="メニュー"]'),
    page.locator('[data-testid*="menu"] button,[data-testid*="more"] button'),
  ];

  for (const candidate of namedMenus) {
    const count = Math.min(await candidate.count().catch(() => 0), 8);
    for (let index = 0; index < count; index++) {
      const button = candidate.nth(index);
      try {
        if (!(await button.isVisible({ timeout: 350 }))) continue;
        await button.click();
        await page.waitForTimeout(450);
        const item = await findDeleteItem(page);
        if (item) return item;
        await page.keyboard.press('Escape').catch(() => {});
      } catch {}
    }
  }

  const topButtons = await page.locator('button').evaluateAll(buttons => buttons.map((button, index) => {
    const rect = button.getBoundingClientRect();
    return {
      index,
      visible: rect.width > 0 && rect.height > 0,
      x: rect.x,
      y: rect.y,
      text: (button.textContent || '').trim(),
      aria: button.getAttribute('aria-label') || '',
      title: button.getAttribute('title') || '',
    };
  }).filter(button => button.visible && button.y < 180)
    .sort((a, b) => b.x - a.x));
  log('TOP_BUTTON_DIAGNOSTIC', topButtons.slice(0, 20));

  for (const meta of topButtons) {
    if (/公開|投稿|保存|閉じる|戻る|キャンセル/.test(`${meta.text} ${meta.aria} ${meta.title}`)) continue;
    const button = page.locator('button').nth(meta.index);
    try {
      await button.click();
      await page.waitForTimeout(450);
      const item = await findDeleteItem(page);
      if (item) return item;
      await page.keyboard.press('Escape').catch(() => {});
    } catch {}
  }
  return null;
}

async function confirmDelete(page) {
  const dialog = await firstVisible([
    page.getByRole('dialog'),
    page.locator('[role="alertdialog"]'),
  ], 1500);
  const scope = dialog || page;
  const confirm = await firstVisible([
    scope.getByRole('button', { name: /削除する/ }),
    scope.getByRole('button', { name: /^削除$/ }),
    scope.getByText('削除する', { exact: true }),
    scope.getByText('削除', { exact: true }),
  ], 1200);
  if (!confirm) throw new Error('DELETE_CONFIRM_BUTTON_NOT_FOUND');
  if (!page.url().includes(DUPLICATE_KEY)) throw new Error(`TARGET_URL_CHANGED_BEFORE_CONFIRM ${page.url()}`);
  const label = normalize(await confirm.innerText().catch(() => ''));
  log('DELETE_CONFIRM_READY', { key: DUPLICATE_KEY, label });
  await confirm.click();
  await page.waitForTimeout(3000);
}

async function main() {
  log('DELETE_DUPLICATE_START', {
    duplicateKey: DUPLICATE_KEY,
    keeperKey: KEEPER_KEY,
    expectedTitle: EXPECTED_TITLE,
    profileDir,
  });

  const verifier = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const keeperBefore = await inspectPublic(verifier, KEEPER_PUBLIC_URL);
    const duplicateBefore = await inspectPublic(verifier, DUPLICATE_PUBLIC_URL);
    log('PRECHECK', { keeper: keeperBefore, duplicate: duplicateBefore });
    if (!keeperBefore.publicExact) throw new Error(`KEEPER_PRECHECK_FAILED ${JSON.stringify(keeperBefore)}`);
    if (!duplicateBefore.publicExact) {
      log('DUPLICATE_ALREADY_REMOVED', DUPLICATE_PUBLIC_URL);
      log('DELETE_DUPLICATE_SUCCESS_VERIFIED', { keeper: KEEPER_PUBLIC_URL, removed: DUPLICATE_PUBLIC_URL });
      return;
    }
  } finally {
    await verifier.close();
  }

  fs.mkdirSync(profileDir, { recursive: true });
  const context = await chromium.launchPersistentContext(profileDir, {
    channel: 'chrome',
    headless: Boolean(headless),
    slowMo,
    viewport: { width: 1440, height: 1000 },
  });
  try {
    const page = context.pages()[0] || await context.newPage();
    await page.goto(DUPLICATE_EDITOR_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2600);
    if (/login/.test(page.url())) throw new Error('NOTE_LOGIN_REQUIRED');
    if (!page.url().includes(DUPLICATE_KEY)) throw new Error(`TARGET_EDITOR_NOT_OPEN ${page.url()}`);

    const values = await page.locator('textarea,input').evaluateAll(elements => elements.map(element => element.value || '').filter(Boolean)).catch(() => []);
    const bodyText = normalize(await page.locator('body').innerText().catch(() => ''));
    if (![...values, bodyText].some(value => normalize(value).includes(normalize(EXPECTED_TITLE)))) {
      throw new Error('TARGET_TITLE_MISMATCH_ABORT');
    }
    log('TARGET_IDENTITY_CONFIRMED', { key: DUPLICATE_KEY, title: EXPECTED_TITLE });

    const deleteItem = await openDeleteMenu(page);
    if (!deleteItem) {
      await page.screenshot({ path: path.join(LOG_DIR, 'delete_duplicate_menu_not_found.png'), fullPage: true }).catch(() => {});
      throw new Error('DELETE_MENU_ITEM_NOT_FOUND');
    }
    const deleteLabel = normalize(await deleteItem.innerText().catch(() => ''));
    log('DELETE_MENU_ITEM_FOUND', { key: DUPLICATE_KEY, label: deleteLabel });
    await deleteItem.click();
    await page.waitForTimeout(700);
    await confirmDelete(page);
  } finally {
    await context.close().catch(() => {});
  }

  const finalVerifier = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    let duplicateAfter = null;
    for (let round = 1; round <= 12; round++) {
      duplicateAfter = await inspectPublic(finalVerifier, DUPLICATE_PUBLIC_URL);
      log('DELETE_PROPAGATION_CHECK', { round, duplicate: duplicateAfter });
      if (!duplicateAfter.publicExact) break;
      await sleep(5000);
    }
    const keeperAfter = await inspectPublic(finalVerifier, KEEPER_PUBLIC_URL);
    if (duplicateAfter?.publicExact) throw new Error(`DUPLICATE_STILL_PUBLIC ${JSON.stringify(duplicateAfter)}`);
    if (!keeperAfter.publicExact) throw new Error(`KEEPER_POSTCHECK_FAILED ${JSON.stringify(keeperAfter)}`);
    log('DELETE_DUPLICATE_SUCCESS_VERIFIED', { keeper: KEEPER_PUBLIC_URL, removed: DUPLICATE_PUBLIC_URL });
  } finally {
    await finalVerifier.close();
  }
}

main().catch(error => {
  log('DELETE_DUPLICATE_FAILED', error?.stack || error?.message || String(error));
  process.exitCode = 1;
});
