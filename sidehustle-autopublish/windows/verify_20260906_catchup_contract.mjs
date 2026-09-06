import crypto from 'node:crypto';

const RAW = process.argv[2];
if (!/^https:\/\/raw\.githubusercontent\.com\/NOTO-ReBloom\/noto-rebloom\/[0-9a-f]{40}\/$/.test(RAW || '')) {
  throw new Error('PINNED_RAW_BASE_REQUIRED');
}

const MIN = 5001;
const ACTIVE_PAID = [
  'note_20260904_77_three_way_match_exception_control',
  'note_20260904_80_document_version_approval_conflict_control',
  'note_20260904_81_supplier_bank_change_verification_control',
  'note_20260905_82_vendor_onboarding_due_diligence_control',
  'note_20260905_83_recurring_journal_entry_review_control',
  'note_20260905_84_customer_credit_limit_override_control',
  'note_20260905_85_sensitive_data_export_handoff_control',
  'note_20260905_86_service_incident_customer_notification_control',
  'note_20260906_87_purchase_order_change_control',
  'note_20260906_88_payroll_master_change_control',
  'note_20260906_89_marketing_consent_evidence_control',
  'note_20260906_90_asset_checkout_return_control',
  'note_20260906_91_ai_output_approval_trace_control',
];
const ACTIVE_FREE = [
  'free_note_20260905_01_vendor_onboarding_warning_signals',
  'free_note_20260905_02_customer_credit_override_warning_signals',
  'free_note_20260906_01_purchase_order_change_warning_signals',
  'free_note_20260906_02_ai_output_approval_warning_signals',
];
const ACTIVE_BOOTH = [
  '089_vendor_onboarding_due_diligence_os_20260905',
  '090_recurring_journal_review_os_20260905',
  '091_credit_limit_override_os_20260905',
  '092_sensitive_data_handoff_os_20260905',
  '093_incident_customer_notification_os_20260905',
  '094_purchase_order_change_os_20260906',
  '095_payroll_master_change_os_20260906',
  '096_marketing_consent_evidence_os_20260906',
  '097_asset_checkout_return_os_20260906',
  '098_ai_output_review_trace_os_20260906',
];
const LOCKED = {
  note_20260904_78_bank_reconciliation_open_items_control: 'https://note.com/royal_lion645/n/n913053a54df8',
  note_20260904_79_policy_exception_approval_control: 'https://note.com/royal_lion645/n/n5f2f681d5e86',
  free_note_20260904_01_three_way_match_warning_signals: 'https://note.com/royal_lion645/n/n13563ab3e2ea',
  free_note_20260904_02_supplier_bank_change_risk_signals: 'https://note.com/royal_lion645/n/n663bf37707d1',
  '084_three_way_match_exception_os_20260904': 'https://booth.pm/ja/items/8806747',
  '085_bank_reconciliation_open_items_os_20260904': 'https://booth.pm/ja/items/8806749',
  '086_policy_exception_approval_os_20260904': 'https://booth.pm/ja/items/8806750',
  '087_document_version_approval_os_20260904': 'https://booth.pm/ja/items/8806751',
  '088_supplier_bank_change_verification_os_20260904': 'https://booth.pm/ja/items/8806752',
};

function assert(value, message) { if (!value) throw new Error(message); }
async function text(path) {
  const response = await fetch(RAW + path, {headers: {'cache-control': 'no-cache', 'user-agent': 'SIDEHUSTLE-SEP6-CATCHUP-CONTRACT/1.0'}});
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
assert(request.totalTarget === 27 && request.reconcileExistingExactTitleBeforeCreate === true, 'REQUEST_CONTRACT');
assert(gate.completionCounts?.required === 27 && gate.materializationState === 'all_active_items_materialized_and_qa_passed', 'COMPLETION_GATE');
assert(quota.activePublicationContract?.totalRemaining === 27 && quota.activePublicationContract?.noteMinimumBodyChars === MIN, 'QUOTA_CONTRACT');
assert(builder.includes('NOTE_MIN_BODY_CHARS = 5001') && builder.includes('NOTE_LONGFORM_GATE_FAILED'), 'PERMANENT_LONGFORM_GATE');
assert(freeManifest.minimumBodyChars === MIN && freeManifest.exactTitleReconciliationBeforeEditor === true, 'FREE_RUNTIME_GUARD');

const paidMap = mapById(paidQueue), freeMap = mapById(freeQueue), boothMap = mapById(boothQueue);
for (const id of ACTIVE_PAID) {
  const entry = paidMap.get(id);
  assert(entry?.enabled === true && entry.forceRetry === true && entry.expectedPriceJPY >= 980, `PAID_IDENTITY_${id}`);
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
  assert(entry?.enabled === true && entry.forceRetry === true && entry.expectedPriceJPY >= 1480, `BOOTH_IDENTITY_${id}`);
  assert(entry.requireBuyerVisibleVerification === true && entry.invalidateLocalSuccessWithoutVerifiedLedger === true && entry.chunks?.length === 1, `BOOTH_STRICT_GUARD_${id}`);
  assert(digest(await text(entry.chunks[0])) === entry.sha256, `BOOTH_SHA256_${id}`);
}

for (const date of ['20260904', '20260905', '20260906']) {
  const report = await json(`sidehustle-autopublish/note/staging/longform_policy_${date}.json`);
  assert(report.minimumBodyChars === MIN, `LENGTH_POLICY_${date}`);
  for (const entry of [...report.paid, ...report.free]) assert(entry.passed === true && entry.bodyChars >= MIN, `LENGTH_${entry.id}`);
}
for (const date of ['20260905', '20260906']) {
  const paidManifest = await json(`sidehustle-autopublish/note/staging/materialization_${date}_batch01.json`);
  const boothManifest = await json(`booth-autopublish/monitor/cloud_materialization_${date}_batch01.json`);
  assert(paidManifest.count === 5 && paidManifest.qa?.allPaidBodiesOver5000Chars === true, `PAID_MANIFEST_${date}`);
  assert(boothManifest.generatedCount === 5 && boothManifest.queueIds.length === 5, `BOOTH_MANIFEST_${date}`);
}

const allQueueMaps = [paidMap, freeMap, boothMap];
for (const [id, url] of Object.entries(LOCKED)) {
  const entry = allQueueMaps.map(map => map.get(id)).find(Boolean);
  assert(entry && entry.enabled === false && entry.publicUrlVerified === true && entry.publicUrl === url, `LOCKED_PUBLICATION_${id}`);
}
const noteTitles = [...paidQueue.entries, ...freeQueue.entries].map(entry => entry.title).filter(Boolean);
assert(new Set(noteTitles).size === noteTitles.length, 'EXACT_DUPLICATE_NOTE_TITLE_DETECTED');

console.log(`REMOTE_THROUGH_SEP6_CONTRACT_OK locked=9 paid=13 free=4 booth=10 total=27 minNoteChars=${MIN}`);
