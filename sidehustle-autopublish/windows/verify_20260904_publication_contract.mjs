import crypto from 'node:crypto';

const REPO_RAW = process.argv[2];
if (!/^https:\/\/raw\.githubusercontent\.com\/NOTO-ReBloom\/noto-rebloom\/[0-9a-f]{40}\/$/.test(REPO_RAW || '')) throw new Error('PINNED_RAW_BASE_REQUIRED');

const PAID = {
  note_20260904_77_three_way_match_exception_control: ['請求書・発注書・検収の不一致を放置しない｜三点照合の差異と解消期限を追う管理方法', 980],
  note_20260904_78_bank_reconciliation_open_items_control: ['銀行照合の未消込を翌月へ持ち越さない｜入出金・仕訳・原因・解消証拠をつなぐ管理方法', 980],
  note_20260904_79_policy_exception_approval_control: ['社内ルールの例外承認を口頭で済ませない｜理由・期限・承認者・失効を残す例外管理', 980],
  note_20260904_80_document_version_approval_conflict_control: ['承認中の文書が差し替わる事故を防ぐ｜版・承認状態・変更理由をつなぐ文書管理', 980],
  note_20260904_81_supplier_bank_change_verification_control: ['取引先の振込先変更をメールだけで受け付けない｜申請・本人確認・承認・反映を追う管理方法', 980],
};
const FREE = {
  free_note_20260904_01_three_way_match_warning_signals: '請求書の支払い前に止めたい5つの不一致サイン｜発注・検収とのズレを早く見つける',
  free_note_20260904_02_supplier_bank_change_risk_signals: '取引先の振込先変更で確認したい5つの危険サイン｜なりすまし送金を防ぐ基本チェック',
};
const BOOTH = {
  '084_three_way_match_exception_os_20260904': ['三点照合・支払差異管理OS｜請求書・発注・検収の不一致と解消期限を一元管理｜オフラインHTML', 1480],
  '085_bank_reconciliation_open_items_os_20260904': ['銀行照合・未消込管理OS｜入出金・仕訳・差異原因・解消証拠を一元管理｜オフラインHTML', 1480],
  '086_policy_exception_approval_os_20260904': ['社内ルール例外承認OS｜理由・承認者・適用期限・失効を一元管理｜オフラインHTML', 1480],
  '087_document_version_approval_os_20260904': ['文書版・承認整合OS｜版番号・変更理由・承認状態・差し替え履歴を一元管理｜オフラインHTML', 1480],
  '088_supplier_bank_change_verification_os_20260904': ['取引先振込先変更確認OS｜申請・本人確認・承認・反映証拠を一元管理｜オフラインHTML', 1680],
};
const MIN = 5001;

function assert(value, message) { if (!value) throw new Error(message); }
async function getText(path) {
  const response = await fetch(REPO_RAW + path, {headers: {'cache-control': 'no-cache', 'user-agent': 'SIDEHUSTLE-SEP4-CONTRACT/1.0'}});
  if (!response.ok) throw new Error(`HTTP_${response.status}_${path}`);
  return response.text();
}
async function getJson(path) { return JSON.parse(await getText(path)); }
function sha256(text) { return crypto.createHash('sha256').update(text, 'utf8').digest('hex'); }
function byId(entries) { return new Map((entries || []).map(entry => [entry.id, entry])); }
function articleBody(markdown, title) {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const heading = markdown.match(new RegExp(`^##\\s+\\d+\\.\\s+${escaped}\\s*$`, 'm'));
  assert(heading, `FREE_SOURCE_SECTION_MISSING_${title}`);
  const tail = markdown.slice((heading.index || 0) + heading[0].length);
  const separator = tail.search(/\n---\s*(?:\n|$)/);
  return (separator >= 0 ? tail.slice(0, separator) : tail).trim();
}

const [paidQueue, freeQueue, boothQueue, lengthReport, paidManifest, plan, planned, builder, freeManifest] = await Promise.all([
  getJson('sidehustle-autopublish/note/queue/index.json'),
  getJson('sidehustle-autopublish/note/free_queue/index.json'),
  getJson('booth-autopublish/queue/index.json'),
  getJson('sidehustle-autopublish/note/staging/longform_policy_20260904.json'),
  getJson('sidehustle-autopublish/note/staging/materialization_20260904_batch01.json'),
  getJson('sidehustle-autopublish/builders/daily_plan_current.json'),
  getJson('sidehustle-autopublish/planning/2026-09-04_batch01.json'),
  getText('sidehustle-autopublish/builders/materialize_daily_current.py'),
  getJson('sidehustle-autopublish/note/free_publisher/manifest.json'),
]);

assert(plan.date === '2026-09-04' && planned.date === '2026-09-04', 'PLAN_DATE');
assert(plan.noteLengthPolicy?.minimumBodyChars === MIN, 'PLAN_LENGTH_POLICY');
assert(builder.includes('NOTE_MIN_BODY_CHARS = 5001') && builder.includes('NOTE_LONGFORM_GATE_FAILED'), 'PERMANENT_LONGFORM_GATE_MISSING');
assert(freeManifest.minimumBodyChars === MIN && freeManifest.runtimeSha256 === '48534141f13e3b8705c4a7064d3932e7e3d13545bf09e6091768dcae1cfb7c8b', 'FREE_RUNTIME_LONGFORM_GUARD');

const plannedIds = [...planned.paidNote.map(x => x.id), ...planned.freeNote.map(x => x.id), ...planned.BOOTH.map(x => x.id)];
assert(JSON.stringify(plannedIds) === JSON.stringify([...Object.keys(PAID), ...Object.keys(FREE), ...Object.keys(BOOTH)]), 'LATEST_PLANNING_IDS_MISMATCH');
for (const queue of [paidQueue, freeQueue, boothQueue]) {
  assert(queue.activePublicationDate === '2026-09-04', 'ACTIVE_PUBLICATION_DATE_MISMATCH');
  assert(queue.forceAllCurrentDayNow === true && queue.reconcileExistingBeforePublish === true, 'QUEUE_RECONCILIATION_GUARD_MISSING');
}

const paidMap = byId(paidQueue.entries), freeMap = byId(freeQueue.entries), boothMap = byId(boothQueue.entries);
assert(JSON.stringify(paidQueue.entries.filter(x => x.enabled).map(x => x.id)) === JSON.stringify(Object.keys(PAID)), 'PAID_ACTIVE_SET_MISMATCH');
assert(JSON.stringify(freeQueue.entries.filter(x => x.enabled).map(x => x.id)) === JSON.stringify(Object.keys(FREE)), 'FREE_ACTIVE_SET_MISMATCH');
assert(JSON.stringify(boothQueue.entries.filter(x => x.enabled).map(x => x.id)) === JSON.stringify(Object.keys(BOOTH)), 'BOOTH_ACTIVE_SET_MISMATCH');

for (const [id, [title, price]] of Object.entries(PAID)) {
  const item = paidMap.get(id);
  assert(item?.title === title && item.expectedPriceJPY === price && item.enabled === true && item.forceRetry === true, `PAID_IDENTITY_${id}`);
  assert(item.requireReaderVisibleVerification === true && item.invalidateLocalSuccessWithoutReaderVerification === true, `PAID_STRICT_GUARD_${id}`);
  assert(sha256(await getText(item.path)) === item.sha256, `PAID_SHA256_${id}`);
}

const freeMarkdown = await getText('sidehustle-autopublish/note/free_drafts/2026-09-04_batch01.md');
for (const [id, title] of Object.entries(FREE)) {
  const item = freeMap.get(id);
  assert(item?.title === title && item.kind === 'free' && item.price === 0 && item.enabled === true, `FREE_IDENTITY_${id}`);
  assert(item.sourceBatchPath === 'sidehustle-autopublish/note/free_drafts/2026-09-04_batch01.md', `FREE_SOURCE_${id}`);
  const body = articleBody(freeMarkdown, title);
  assert(body.length >= MIN, `FREE_BODY_TOO_SHORT_${id}_${body.length}`);
}

for (const [id, [title, price]] of Object.entries(BOOTH)) {
  const item = boothMap.get(id);
  assert(item?.title === title && item.expectedPriceJPY === price && item.enabled === true && item.forceRetry === true, `BOOTH_IDENTITY_${id}`);
  assert(item.requireBuyerVisibleVerification === true && item.invalidateLocalSuccessWithoutVerifiedLedger === true && item.chunks?.length === 1, `BOOTH_STRICT_GUARD_${id}`);
  assert(sha256(await getText(item.chunks[0])) === item.sha256, `BOOTH_SHA256_${id}`);
}

const paidLengths = new Map(lengthReport.paid.map(x => [x.id, x])), freeLengths = new Map(lengthReport.free.map(x => [x.id, x]));
assert(lengthReport.minimumBodyChars === MIN, 'LENGTH_REPORT_POLICY');
for (const id of Object.keys(PAID)) assert(paidLengths.get(id)?.passed === true && paidLengths.get(id).bodyChars >= MIN, `PAID_LENGTH_${id}`);
for (const id of Object.keys(FREE)) assert(freeLengths.get(id)?.passed === true && freeLengths.get(id).bodyChars >= MIN, `FREE_LENGTH_${id}`);
const manifestLengths = new Map(paidManifest.items.map(x => [x.id, x.paidChars]));
for (const id of Object.keys(PAID)) assert(manifestLengths.get(id) === paidLengths.get(id).bodyChars, `PAID_MANIFEST_LENGTH_${id}`);
assert(paidManifest.qa?.allPaidBodiesOver5000Chars === true, 'PAID_MANIFEST_LONGFORM_QA');

const allTitles = [...paidQueue.entries, ...freeQueue.entries, ...boothQueue.entries].map(x => x.title).filter(Boolean);
assert(new Set(allTitles).size === allTitles.length, 'EXACT_DUPLICATE_TITLE_DETECTED');
console.log(`REMOTE_SEP4_CONTRACT_OK paid=5 free=2 booth=5 total=12 minNoteChars=${MIN}`);
