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
const LOCKED_PAID = {
  note_20260907_92_employee_offboarding_access_control: 'https://note.com/royal_lion645/n/n60c824191ec1',
  note_20260907_93_duplicate_expense_claim_control: 'https://note.com/royal_lion645/n/na44700d0927d',
  note_20260907_94_saas_admin_privilege_review_control: 'https://note.com/royal_lion645/n/nec43d9d40072',
  note_20260907_95_contract_renewal_notice_control: 'https://note.com/royal_lion645/n/n27d4fd09612c',
  note_20260907_96_customer_refund_exception_control: 'https://note.com/royal_lion645/n/n138d81e02bd8',
};
const LOCKED_FREE = {
  free_note_20260907_01_offboarding_access_warning_signals: 'https://note.com/royal_lion645/n/n824cb93a70c5',
  free_note_20260907_02_duplicate_expense_warning_signals: 'https://note.com/royal_lion645/n/n2bba7c421b46',
  free_note_20260908_01_dormant_vendor_warning_signals: 'https://note.com/royal_lion645/n/n354606954dcd',
  free_note_20260908_02_unused_saas_seat_warning_signals: 'https://note.com/royal_lion645/n/ncfcb71b37648',
};
const LOCKED_BOOTH = {
  '099_employee_offboarding_access_os_20260907': ['https://booth.pm/ja/items/8820728', 1480],
  '100_duplicate_expense_claim_os_20260907': ['https://booth.pm/ja/items/8820730', 1280],
  '101_saas_admin_privilege_review_os_20260907': ['https://booth.pm/ja/items/8820734', 1380],
  '102_contract_renewal_notice_os_20260907': ['https://booth.pm/ja/items/8820739', 1380],
  '103_customer_refund_exception_os_20260907': ['https://booth.pm/ja/items/8820747', 1280],
  '104_vendor_master_cleanup_os_20260908': ['https://booth.pm/ja/items/8820758', 1380],
  '105_corporate_card_spend_control_os_20260908': ['https://booth.pm/ja/items/8820762', 1280],
  '106_customer_data_retention_os_20260908': ['https://booth.pm/ja/items/8820776', 1380],
  '107_invoice_number_gap_control_os_20260908': ['https://booth.pm/ja/items/8820769', 1280],
  '108_software_license_seat_optimization_os_20260908': ['https://booth.pm/ja/items/8820781', 1480],
};

function assert(value, message) { if (!value) throw new Error(message); }
async function text(path) {
  const response = await fetch(RAW + path + '?v=' + Date.now(), {headers: {'cache-control': 'no-cache', 'user-agent': 'SIDEHUSTLE-SEP8-PAID-REPAIR/1.0'}});
  if (!response.ok) throw new Error(`HTTP_${response.status}_${path}`);
  return response.text();
}
async function json(path) { return JSON.parse(await text(path)); }
function digest(value) { return crypto.createHash('sha256').update(value, 'utf8').digest('hex'); }
function activeIds(queue) { return queue.entries.filter(entry => entry.enabled).map(entry => entry.id); }
function mapById(queue) { return new Map(queue.entries.map(entry => [entry.id || entry.queueId, entry])); }
function same(actual, expected, label) { assert(JSON.stringify(actual) === JSON.stringify(expected), `${label}: ${JSON.stringify(actual)}`); }

const [paidQueue, freeQueue, boothQueue, request, gate, quota, lengthReport, freeLedger, boothLedger, builder] = await Promise.all([
  json('sidehustle-autopublish/note/queue/index.json'),
  json('sidehustle-autopublish/note/free_queue/index.json'),
  json('booth-autopublish/queue/index.json'),
  json('sidehustle-autopublish/windows_publication_request.json'),
  json('sidehustle-autopublish/completion_gate.json'),
  json('sidehustle-autopublish/publication_quota.json'),
  json('sidehustle-autopublish/note/staging/longform_policy_20260908.json'),
  json('sidehustle-autopublish/note/free_publication_ledger.json'),
  json('booth-autopublish/monitor/publication_ledger.json'),
  text('sidehustle-autopublish/builders/materialize_daily_current.py'),
]);

same(activeIds(paidQueue), ACTIVE_PAID, 'PAID_ACTIVE_SET');
same(activeIds(freeQueue), [], 'FREE_ACTIVE_SET');
same(activeIds(boothQueue), [], 'BOOTH_ACTIVE_SET');
same(request.paidNote.ids, ACTIVE_PAID, 'REQUEST_PAID_SET');
same(request.freeNote.ids, [], 'REQUEST_FREE_SET');
same(request.BOOTH.ids, [], 'REQUEST_BOOTH_SET');
same(request.outstandingDates, ['2026-09-08'], 'OUTSTANDING_DATES');
assert(request.totalTarget === 5 && request.reconcileExistingExactTitleBeforeCreate === true, 'REQUEST_CONTRACT');
assert(gate.completionCounts?.remaining === 5 && gate.completionCounts?.paidNoteRemaining === 5 && gate.completionCounts?.freeNoteRemaining === 0 && gate.completionCounts?.BOOTHRemaining === 0, 'COMPLETION_GATE');
assert(quota.activePublicationContract?.totalRemaining === 5 && quota.activePublicationContract?.noteMinimumBodyChars === MIN && quota.activePublicationContract?.paidFreeBodyMinimumChars === MIN, 'QUOTA_CONTRACT');
assert(builder.includes('paidBody=') && builder.includes('freeBody=') && builder.includes('NOTE_MIN_BODY_CHARS = 5001'), 'PERMANENT_DUAL_LONGFORM_GATE');

const paidMap = mapById(paidQueue);
for (const id of ACTIVE_PAID) {
  const entry = paidMap.get(id);
  assert(entry?.enabled === true && entry.forceRetry === true && entry.forcePublicationNow === true && entry.expectedPriceJPY === 980, `PAID_IDENTITY_${id}`);
  assert(entry.requireReaderVisibleVerification === true && entry.invalidateLocalSuccessWithoutReaderVerification === true && entry.prePublishReconcileRequired === true, `PAID_STRICT_GUARD_${id}`);
  assert(digest(await text(entry.path)) === entry.sha256, `PAID_SHA256_${id}`);
}

assert(lengthReport.minimumBodyChars === MIN && lengthReport.paid.length === 5, 'LENGTH_POLICY');
let minPaid = Number.MAX_SAFE_INTEGER;
let minFree = Number.MAX_SAFE_INTEGER;
for (const entry of lengthReport.paid) {
  assert(ACTIVE_PAID.includes(entry.id), `UNEXPECTED_LENGTH_ID_${entry.id}`);
  assert(entry.passed === true && entry.bodyChars >= MIN && entry.freeBodyChars >= MIN, `PAID_DUAL_BODY_TOO_SHORT_${entry.id}`);
  minPaid = Math.min(minPaid, entry.bodyChars);
  minFree = Math.min(minFree, entry.freeBodyChars);
}

for (const [id, url] of Object.entries(LOCKED_PAID)) {
  const entry = paidMap.get(id);
  assert(entry && entry.enabled === false && entry.publicUrlVerified === true && entry.publicUrl === url, `LOCKED_PAID_${id}`);
}
const freeQueueMap = mapById(freeQueue);
const freeLedgerMap = mapById({entries: freeLedger.entries});
for (const [id, url] of Object.entries(LOCKED_FREE)) {
  const queueEntry = freeQueueMap.get(id), ledgerEntry = freeLedgerMap.get(id);
  assert(queueEntry && queueEntry.enabled === false && queueEntry.publicUrlVerified === true && queueEntry.publicUrl === url, `LOCKED_FREE_QUEUE_${id}`);
  assert(ledgerEntry && ledgerEntry.publicUrlVerified === true && ledgerEntry.freeStateVerified === true && ledgerEntry.coverImageVerified === true && ledgerEntry.bodyMinimumCharsVerified === true && ledgerEntry.publicUrl === url, `LOCKED_FREE_LEDGER_${id}`);
}
const boothQueueMap = mapById(boothQueue);
const boothLedgerMap = mapById({entries: boothLedger.entries});
for (const [id, [url, price]] of Object.entries(LOCKED_BOOTH)) {
  const queueEntry = boothQueueMap.get(id), ledgerEntry = boothLedgerMap.get(id);
  assert(queueEntry && queueEntry.enabled === false && queueEntry.publicUrlVerified === true && queueEntry.publicUrl === url && queueEntry.expectedPriceJPY === price, `LOCKED_BOOTH_QUEUE_${id}`);
  assert(ledgerEntry && ledgerEntry.publicUrlVerified === true && ledgerEntry.publicUrl === url && ledgerEntry.expectedPriceJPY === price, `LOCKED_BOOTH_LEDGER_${id}`);
}

const noteTitles = [...paidQueue.entries, ...freeQueue.entries].map(entry => entry.title).filter(Boolean);
assert(new Set(noteTitles).size === noteTitles.length, 'EXACT_DUPLICATE_NOTE_TITLE_DETECTED');

console.log(`REMOTE_SEP8_PAID_REPAIR_OK lockedSep7Paid=5 reconciledFree=4 reconciledBOOTH=10 paidPending=5 minPaidBodyChars=${minPaid} minPaidFreeBodyChars=${minFree}`);
