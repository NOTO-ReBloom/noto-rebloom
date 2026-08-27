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

async function menuDiagnostic(page, label) {
  const visibleText = await page.locator('[role="menu"],[role="listbox"],[data-radix-menu-content],body').evaluateAll(elements => elements.map(element => {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 ? String(element.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 900) : '';
  }).filter(Boolean)).catch(() => []);
  log(label, visibleText.slice(0, 8));
}

async function tryEditorDeleteMenu(page) {
  const button = await firstVisible([
    page.getByRole('button', { name: /^その他$/ }),
    page.locator('button[aria-label="その他"],button[title="その他"]'),
  ], 700);
  if (!button) return null;
  await button.click();
  await page.waitForTimeout(500);
  const item = await findDeleteItem(page);
  if (item) return item;
  await menuDiagnostic(page, 'EDITOR_MORE_MENU_NO_DELETE');
  await page.keyboard.press('Escape').catch(() => {});
  return null;
}

async function openArticleListDeleteMenu(page) {
  const listUrls = ['https://note.com/notes', 'https://note.com/notes?status=published'];
  let anchor = null;
  for (const url of listUrls) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2500);
    if (/login/.test(page.url())) throw new Error('NOTE_LOGIN_REQUIRED');
    const candidate = page.locator(`a[href*="${DUPLICATE_KEY}"]`);
    const count = await candidate.count().catch(() => 0);
    for (let index = 0; index < count; index++) {
      if (await candidate.nth(index).isVisible({ timeout: 350 }).catch(() => false)) {
        anchor = candidate.nth(index);
        break;
      }
    }
    if (anchor) break;
  }
  if (!anchor) {
    const matchingLinks = await page.locator('a').evaluateAll(links => links.map(link => ({
      href: link.getAttribute('href') || '',
      text: String(link.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 180),
    })).filter(link => link.text.includes('卒論面談の前日に用意したい4つのメモ｜相談したのに進まないを防ぐ')).slice(0, 20)).catch(() => []);
    log('ARTICLE_LIST_TARGET_LINK_NOT_FOUND', { key: DUPLICATE_KEY, matchingLinks });
    return null;
  }

  await anchor.scrollIntoViewIfNeeded();
  const href = await anchor.getAttribute('href');
  log('ARTICLE_LIST_TARGET_LINK_CONFIRMED', { key: DUPLICATE_KEY, href });
  let row = anchor;
  for (let depth = 1; depth <= 12; depth++) {
    row = row.locator('xpath=..');
    const rowText = normalize(await row.innerText().catch(() => ''));
    if (!rowText.includes(normalize(EXPECTED_TITLE))) continue;
    const namedMenu = await firstVisible([
      row.getByRole('button', { name: /その他|メニュー|記事メニュー|オプション/ }),
      row.locator('button[aria-label*="その他"],button[aria-label*="メニュー"],button[title*="その他"],button[title*="メニュー"]'),
    ], 250);
    let menuButton = namedMenu;
    if (!menuButton) {
      const buttons = await row.locator('button').evaluateAll(elements => elements.map((button, index) => {
        const rect = button.getBoundingClientRect();
        return {
          index,
          visible: rect.width > 0 && rect.height > 0,
          x: rect.x,
          text: String(button.textContent || '').replace(/\s+/g, ' ').trim(),
          aria: button.getAttribute('aria-label') || '',
          title: button.getAttribute('title') || '',
        };
      }).filter(button => button.visible).sort((a, b) => b.x - a.x)).catch(() => []);
      log('ARTICLE_LIST_ROW_BUTTONS', { depth, buttons: buttons.slice(0, 12) });
      const selected = buttons.find(button => !/編集|表示|プレビュー|閉じる|キャンセル/.test(`${button.text} ${button.aria} ${button.title}`));
      if (selected) menuButton = row.locator('button').nth(selected.index);
    }
    if (!menuButton) continue;
    await menuButton.click();
    await page.waitForTimeout(500);
    const item = await findDeleteItem(page);
    if (item) return { item, source: 'article-list' };
    await menuDiagnostic(page, 'ARTICLE_LIST_MENU_NO_DELETE');
    await page.keyboard.press('Escape').catch(() => {});
  }
  return null;
}

async function confirmDelete(page, source) {
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
  if (source === 'editor' && !page.url().includes(DUPLICATE_KEY)) throw new Error(`TARGET_URL_CHANGED_BEFORE_CONFIRM ${page.url()}`);
  if (source === 'article-list') {
    if (!/note\.com\/notes/.test(page.url())) throw new Error(`ARTICLE_LIST_CHANGED_BEFORE_CONFIRM ${page.url()}`);
    const duplicateLinks = await page.locator(`a[href*="${DUPLICATE_KEY}"]`).count().catch(() => 0);
    if (duplicateLinks < 1) throw new Error('TARGET_LINK_MISSING_BEFORE_CONFIRM');
  }
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

    let deleteTarget = null;
    const editorDelete = await tryEditorDeleteMenu(page);
    if (editorDelete) deleteTarget = { item: editorDelete, source: 'editor' };
    if (!deleteTarget) deleteTarget = await openArticleListDeleteMenu(page);
    if (!deleteTarget) {
      await page.screenshot({ path: path.join(LOG_DIR, 'delete_duplicate_menu_not_found.png'), fullPage: true }).catch(() => {});
      throw new Error('DELETE_MENU_ITEM_NOT_FOUND');
    }
    const deleteLabel = normalize(await deleteTarget.item.innerText().catch(() => ''));
    log('DELETE_MENU_ITEM_FOUND', { key: DUPLICATE_KEY, label: deleteLabel, source: deleteTarget.source });
    await deleteTarget.item.click();
    await page.waitForTimeout(700);
    await confirmDelete(page, deleteTarget.source);
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
