import crypto from 'node:crypto';

const RAW = process.argv[2];
if (!/^https:\/\/raw\.githubusercontent\.com\/NOTO-ReBloom\/noto-rebloom\/[0-9a-f]{40}\/$/.test(RAW || '')) {
  throw new Error('PINNED_RAW_BASE_REQUIRED');
}

const MIN = 5001;
const ACTIVE_PAID = [
  'note_20260908_97_vendor_master_dormant_cleanup',
  'note_20260908_98_corporate_card_spend_control',
  'note_20260908_99_customer_data_retention_deletion',
  'note_20260908_100_invoice_number_gap_control',
  'note_20260908_101_software_license_seat_optimization',
];
const ACTIVE_FREE = [
  'free_note_20260907_01_offboarding_access_warning_signals',
  'free_note_20260907_02_duplicate_expense_warning_signals',
  'free_note_20260908_01_dormant_vendor_warning_signals',
  'free_note_20260908_02_unused_saas_seat_warning_signals',
];
const ACTIVE_BOOTH = [
  '099_employee_offboarding_access_os_20260907',
  '100_duplicate_expense_claim_os_20260907',
  '101_saas_admin_privilege_review_os_20260907',
  '102_contract_renewal_notice_os_20260907',
  '103_customer_refund_exception_os_20260907',
  '104_vendor_master_cleanup_os_20260908',
  '105_corporate_card_spend_control_os_20260908',
  '106_customer_data_retention_os_20260908',
  '107_invoice_number_gap_control_os_20260908',
  '108_software_license_seat_optimization_os_20260908',
];
const LOCKED_PAID = {
  note_20260907_92_employee_offboarding_access_control: 'https://note.com/royal_lion645/n/n60c824191ec1',
  note_20260907_93_duplicate_expense_claim_control: 'https://note.com/royal_lion645/n/na44700d0927d',
  note_20260907_94_saas_admin_privilege_review_control: 'https://note.com/royal_lion645/n/nec43d9d40072',
  note_20260907_95_contract_renewal_notice_control: 'https://note.com/royal_lion645/n/n27d4fd09612c',
  note_20260907_96_customer_refund_exception_control: 'https://note.com/royal_lion645/n/n138d81e02bd8',
};
const BOOTH_PRICES = {
  '099_employee_offboarding_access_os_20260907': 1480,
  '100_duplicate_expense_claim_os_20260907': 1280,
  '101_saas_admin_privilege_review_os_20260907': 1380,
  '102_contract_renewal_notice_os_20260907': 1380,
  '103_customer_refund_exception_os_20260907': 1280,
  '104_vendor_master_cleanup_os_20260908': 1380,
  '105_corporate_card_spend_control_os_20260908': 1280,
  '106_customer_data_retention_os_20260908': 1380,
  '107_invoice_number_gap_control_os_20260908': 1280,
  '108_software_license_seat_optimization_os_20260908': 1480,
};

function assert(value, message) { if (!value) throw new Error(message); }
async function text(path) {
  const response = await fetch(RAW + path + '?v=' + Date.now(), {headers: {'cache-control': 'no-cache', 'user-agent': 'SIDEHUSTLE-SEP8-CATCHUP-CONTRACT/1.0'}});
  if (!response.ok) throw new Error(`HTTP_${response.status}_${path}`);
  return response.text();
}
async function json(path) { return JSON.parse(await text(path)); }
function digest(value) { return crypto.createHash('sha256').update(value, 'utf8').digest('hex'); }
function activeIds(queue) { return queue.entries.filter(entry => entry.enabled).map(entry => entry.id); }
function mapById(queue) { return new Map(queue.entries.map(entry => [entry.id, entry])); }
function same(actual, expected, label) { assert(JSON.stringify(actual) === JSON.stringify(expected), `${label}: ${JSON.stringify(actual)}`); }
function articleBody(markdown, title) {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const heading = markdown.match(new RegExp(`^##\\s+\\d+\\.\\s+${escaped}\\s*$`, 'm'));
  assert(heading, `FREE_SOURCE_SECTION_MISSING_${title}`);
  const tail = markdown.slice((heading.index || 0) + heading[0].length);
  const separator = tail.search(/\n---\s*(?:\n|$)/);
  return (separator >= 0 ? tail.slice(0, separator) : tail).trim();
}

const [paidQueue, freeQueue, boothQueue, request, gate, quota, freeManifest, builder] = await Promise.all([
  json('sidehustle-autopublish/note/queue/index.json'),
  json('sidehustle-autopublish/note/free_queue/index.json'),
  json('booth-autopublish/queue/index.json'),
  json('sidehustle-autopublish/windows_publication_request.json'),
  json('sidehustle-autopublish/completion_gate.json'),
  json('sidehustle-autopublish/publication_quota.json'),
  json('sidehustle-autopublish/note/free_publisher/manifest.json'),
  text('sidehustle-autopublish/builders/materialize_daily_current.py'),
]);

same(activeIds(paidQueue), ACTIVE_PAID, 'PAID_ACTIVE_SET');
same(activeIds(freeQueue), ACTIVE_FREE, 'FREE_ACTIVE_SET');
same(activeIds(boothQueue), ACTIVE_BOOTH, 'BOOTH_ACTIVE_SET');
same(request.paidNote.ids, ACTIVE_PAID, 'REQUEST_PAID_SET');
same(request.freeNote.ids, ACTIVE_FREE, 'REQUEST_FREE_SET');
same(request.BOOTH.ids, ACTIVE_BOOTH, 'REQUEST_BOOTH_SET');
same(request.outstandingDates, ['2026-09-07', '2026-09-08'], 'OUTSTANDING_DATES');
assert(request.totalTarget === 19 && request.reconcileExistingExactTitleBeforeCreate === true, 'REQUEST_CONTRACT');
assert(gate.completionCounts?.required === 19 && gate.completionCounts?.remaining === 19 && gate.materializationState === 'all_active_items_materialized_and_qa_passed', 'COMPLETION_GATE');
assert(quota.activePublicationContract?.totalRemaining === 19 && quota.activePublicationContract?.noteMinimumBodyChars === MIN, 'QUOTA_CONTRACT');
assert(builder.includes('NOTE_MIN_BODY_CHARS = 5001') && builder.includes('NOTE_LONGFORM_GATE_FAILED'), 'PERMANENT_LONGFORM_GATE');
assert(freeManifest.minimumBodyChars === MIN && freeManifest.exactTitleReconciliationBeforeEditor === true, 'FREE_RUNTIME_GUARD');

const paidMap = mapById(paidQueue), freeMap = mapById(freeQueue), boothMap = mapById(boothQueue);
for (const id of ACTIVE_PAID) {
  const entry = paidMap.get(id);
  assert(entry?.enabled === true && entry.forceRetry === true && entry.expectedPriceJPY === 980, `PAID_IDENTITY_${id}`);
  assert(entry.requireReaderVisibleVerification === true && entry.invalidateLocalSuccessWithoutReaderVerification === true, `PAID_STRICT_GUARD_${id}`);
  assert(digest(await text(entry.path)) === entry.sha256, `PAID_SHA256_${id}`);
}
for (const id of ACTIVE_FREE) {
  const entry = freeMap.get(id);
  assert(entry?.enabled === true && entry.kind === 'free' && entry.price === 0, `FREE_IDENTITY_${id}`);
  const markdown = await text(entry.sourceBatchPath);
  const body = articleBody(markdown, entry.title);
  assert(body.length >= MIN, `FREE_BODY_TOO_SHORT_${id}_${body.length}`);
}
for (const id of ACTIVE_BOOTH) {
  const entry = boothMap.get(id);
  assert(entry?.enabled === true && entry.forceRetry === true && entry.expectedPriceJPY === BOOTH_PRICES[id], `BOOTH_IDENTITY_${id}`);
  assert(entry.requireBuyerVisibleVerification === true && entry.invalidateLocalSuccessWithoutVerifiedLedger === true && entry.chunks?.length === 1, `BOOTH_STRICT_GUARD_${id}`);
  assert(digest(await text(entry.chunks[0])) === entry.sha256, `BOOTH_SHA256_${id}`);
}

for (const date of ['20260907', '20260908']) {
  const report = await json(`sidehustle-autopublish/note/staging/longform_policy_${date}.json`);
  assert(report.minimumBodyChars === MIN, `LENGTH_POLICY_${date}`);
  for (const entry of [...report.paid, ...report.free]) assert(entry.passed === true && entry.bodyChars >= MIN, `LENGTH_${entry.id}`);
  const paidManifest = await json(`sidehustle-autopublish/note/staging/materialization_${date}_batch01.json`);
  const boothManifest = await json(`booth-autopublish/monitor/cloud_materialization_${date}_batch01.json`);
  assert(paidManifest.count === 5 && paidManifest.qa?.allPaidBodiesOver5000Chars === true, `PAID_MANIFEST_${date}`);
  assert(boothManifest.generatedCount === 5 && boothManifest.queueIds.length === 5, `BOOTH_MANIFEST_${date}`);
}

for (const [id, url] of Object.entries(LOCKED_PAID)) {
  const entry = paidMap.get(id);
  assert(entry && entry.enabled === false && entry.publicUrlVerified === true && entry.publicUrl === url, `LOCKED_PAID_${id}`);
}
const noteTitles = [...paidQueue.entries, ...freeQueue.entries].map(entry => entry.title).filter(Boolean);
assert(new Set(noteTitles).size === noteTitles.length, 'EXACT_DUPLICATE_NOTE_TITLE_DETECTED');

console.log(`REMOTE_THROUGH_SEP8_CONTRACT_OK lockedSep7Paid=5 paid=5 free=4 booth=10 total=19 minNoteChars=${MIN}`);
