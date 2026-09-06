import process from 'node:process';

const base = String(process.argv[2] || '').replace(/\/$/, '');
if (!/^https:\/\/raw\.githubusercontent\.com\/NOTO-ReBloom\/noto-rebloom\/[0-9a-f]{40}$/.test(base)) {
  throw new Error('Usage: node verify_20260906_complete_contract.mjs <pinned raw GitHub commit URL>');
}

async function fetchText(path) {
  const response = await fetch(`${base}/${path}?v=${Date.now()}`, {
    headers: {'cache-control': 'no-cache', 'user-agent': 'SEP6-final-contract/1.0'},
  });
  if (!response.ok) throw new Error(`REMOTE_FETCH_FAILED ${path} status=${response.status}`);
  return response.text();
}

async function fetchJson(path) {
  return JSON.parse(await fetchText(path));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function mapBy(items, key = 'id') {
  return new Map(items.map(item => [item[key], item]));
}

const paidExpected = new Map([
  ['note_20260904_77_three_way_match_exception_control', 'https://note.com/royal_lion645/n/n4729148e03b1'],
  ['note_20260904_78_bank_reconciliation_open_items_control', 'https://note.com/royal_lion645/n/n913053a54df8'],
  ['note_20260904_79_policy_exception_approval_control', 'https://note.com/royal_lion645/n/n5f2f681d5e86'],
  ['note_20260904_80_document_version_approval_conflict_control', 'https://note.com/royal_lion645/n/n94fdf8ddaabd'],
  ['note_20260904_81_supplier_bank_change_verification_control', 'https://note.com/royal_lion645/n/n5b2895089ab7'],
  ['note_20260905_82_vendor_onboarding_due_diligence_control', 'https://note.com/royal_lion645/n/n00d799f2e301'],
  ['note_20260905_83_recurring_journal_entry_review_control', 'https://note.com/royal_lion645/n/n3a04788c22dc'],
  ['note_20260905_84_customer_credit_limit_override_control', 'https://note.com/royal_lion645/n/n09bf22df9a38'],
  ['note_20260905_85_sensitive_data_export_handoff_control', 'https://note.com/royal_lion645/n/n17bf288aeac8'],
  ['note_20260905_86_service_incident_customer_notification_control', 'https://note.com/royal_lion645/n/n2505e05d7faf'],
  ['note_20260906_87_purchase_order_change_control', 'https://note.com/royal_lion645/n/n7f9c36e12aa5'],
  ['note_20260906_88_payroll_master_change_control', 'https://note.com/royal_lion645/n/n7f3600a14a8a'],
  ['note_20260906_89_marketing_consent_evidence_control', 'https://note.com/royal_lion645/n/n52132464d2c1'],
  ['note_20260906_90_asset_checkout_return_control', 'https://note.com/royal_lion645/n/n2032163de4e8'],
  ['note_20260906_91_ai_output_approval_trace_control', 'https://note.com/royal_lion645/n/n30e0fdfaf6c3'],
]);

const freeExpected = new Map([
  ['free_note_20260904_01_three_way_match_warning_signals', 'https://note.com/royal_lion645/n/n13563ab3e2ea'],
  ['free_note_20260904_02_supplier_bank_change_risk_signals', 'https://note.com/royal_lion645/n/n663bf37707d1'],
  ['free_note_20260905_01_vendor_onboarding_warning_signals', 'https://note.com/royal_lion645/n/n0a1ed7325656'],
  ['free_note_20260905_02_customer_credit_override_warning_signals', 'https://note.com/royal_lion645/n/n6722164ba65d'],
  ['free_note_20260906_01_purchase_order_change_warning_signals', 'https://note.com/royal_lion645/n/nf2a95a2b43fc'],
  ['free_note_20260906_02_ai_output_approval_warning_signals', 'https://note.com/royal_lion645/n/n9212528f1626'],
]);

const boothExpected = new Map([
  ['084_three_way_match_exception_os_20260904', 'https://booth.pm/ja/items/8806747'],
  ['085_bank_reconciliation_open_items_os_20260904', 'https://booth.pm/ja/items/8806749'],
  ['086_policy_exception_approval_os_20260904', 'https://booth.pm/ja/items/8806750'],
  ['087_document_version_approval_os_20260904', 'https://booth.pm/ja/items/8806751'],
  ['088_supplier_bank_change_verification_os_20260904', 'https://booth.pm/ja/items/8806752'],
  ['089_vendor_onboarding_due_diligence_os_20260905', 'https://booth.pm/ja/items/8811133'],
  ['090_recurring_journal_review_os_20260905', 'https://booth.pm/ja/items/8811135'],
  ['091_credit_limit_override_os_20260905', 'https://booth.pm/ja/items/8811141'],
  ['092_sensitive_data_handoff_os_20260905', 'https://booth.pm/ja/items/8811144'],
  ['093_incident_customer_notification_os_20260905', 'https://booth.pm/ja/items/8811146'],
  ['094_purchase_order_change_os_20260906', 'https://booth.pm/ja/items/8811158'],
  ['095_payroll_master_change_os_20260906', 'https://booth.pm/ja/items/8811159'],
  ['096_marketing_consent_evidence_os_20260906', 'https://booth.pm/ja/items/8811163'],
  ['097_asset_checkout_return_os_20260906', 'https://booth.pm/ja/items/8811164'],
  ['098_ai_output_review_trace_os_20260906', 'https://booth.pm/ja/items/8811166'],
]);

const [paidQueue, freeQueue, boothQueue, freeLedger, boothLedger, gate, quota, request, metrics, materializer, ...policies] = await Promise.all([
  fetchJson('sidehustle-autopublish/note/queue/index.json'),
  fetchJson('sidehustle-autopublish/note/free_queue/index.json'),
  fetchJson('booth-autopublish/queue/index.json'),
  fetchJson('sidehustle-autopublish/note/free_publication_ledger.json'),
  fetchJson('booth-autopublish/monitor/publication_ledger.json'),
  fetchJson('sidehustle-autopublish/completion_gate.json'),
  fetchJson('sidehustle-autopublish/publication_quota.json'),
  fetchJson('sidehustle-autopublish/windows_publication_request.json'),
  fetchJson('sidehustle-autopublish/metrics/current.json'),
  fetchText('sidehustle-autopublish/builders/materialize_daily_current.py'),
  fetchJson('sidehustle-autopublish/note/staging/longform_policy_20260904.json'),
  fetchJson('sidehustle-autopublish/note/staging/longform_policy_20260905.json'),
  fetchJson('sidehustle-autopublish/note/staging/longform_policy_20260906.json'),
]);

assert(!paidQueue.entries.some(item => item.enabled), 'PAID_QUEUE_NOT_EMPTY');
assert(!freeQueue.entries.some(item => item.enabled), 'FREE_QUEUE_NOT_EMPTY');
assert(!boothQueue.entries.some(item => item.enabled), 'BOOTH_QUEUE_NOT_EMPTY');

for (const [label, expected, entries] of [
  ['PAID', paidExpected, paidQueue.entries],
  ['FREE', freeExpected, freeQueue.entries],
  ['BOOTH', boothExpected, boothQueue.entries],
]) {
  const byId = mapBy(entries);
  for (const [id, url] of expected) {
    const item = byId.get(id);
    assert(item, `${label}_QUEUE_ID_MISSING ${id}`);
    assert(item.enabled === false && item.publicUrlVerified === true && item.publicUrl === url, `${label}_QUEUE_LOCK_MISMATCH ${id}`);
  }
}

const freeById = mapBy(freeLedger.entries);
for (const [id, url] of freeExpected) {
  const item = freeById.get(id);
  assert(item?.publicUrl === url && item.publicUrlVerified === true && item.freeStateVerified === true && item.coverImageVerified === true, `FREE_LEDGER_MISMATCH ${id}`);
}

const boothById = mapBy(boothLedger.entries, 'queueId');
for (const [id, url] of boothExpected) {
  const item = boothById.get(id);
  assert(item?.publicUrl === url && item.publicUrlVerified === true && [1480, 1680].includes(item.expectedPriceJPY), `BOOTH_LEDGER_MISMATCH ${id}`);
}

for (const [id, url] of paidExpected) {
  const receipt = await fetchJson(`sidehustle-autopublish/note/publication_receipts/${id}.json`);
  assert(receipt.id === id && receipt.publicUrl === url && receipt.publicUrlVerified === true, `PAID_RECEIPT_URL_MISMATCH ${id}`);
  assert(receipt.expectedPriceJPY === 980 && receipt.titleVerified === true && receipt.priceVerified === true && receipt.paidBoundaryVerified === true && receipt.purchasePathVerified === true && receipt.dedicatedCoverVerified === true && receipt.anonymousReaderVerified === true, `PAID_RECEIPT_STRICT_CHECK_FAILED ${id}`);
}

for (const policy of policies) {
  assert(policy.minimumBodyChars === 5001, `LONGFORM_POLICY_MINIMUM_MISMATCH ${policy.date}`);
  for (const item of [...policy.paid, ...policy.free]) {
    assert(item.passed === true && item.bodyChars >= 5001, `LONGFORM_POLICY_FAILED ${item.id}`);
  }
}
assert(/NOTE_MIN_BODY_CHARS\s*=\s*5001/.test(materializer), 'PERMANENT_5001_CHAR_GATE_MISSING');

const noteTitles = [...paidQueue.entries, ...freeQueue.entries]
  .filter(item => item.publicUrlVerified === true)
  .map(item => item.title);
const duplicates = [...new Set(noteTitles.filter((title, index) => noteTitles.indexOf(title) !== index))];
assert(duplicates.length === 0, `DUPLICATE_PUBLIC_NOTE_TITLES ${duplicates.join(' | ')}`);

assert(gate.status === 'complete_through_2026-09-06' && gate.completionCounts?.throughSep6StrictVerified === 36 && gate.completionCounts?.remaining === 0 && gate.completionEvidence?.remainingDuplicateTitleGroups === 0, 'COMPLETION_GATE_INCOMPLETE');
assert(quota.activePublicationContract?.throughSep6StrictVerified === 36 && quota.activePublicationContract?.totalRemaining === 0 && quota.activePublicationContract?.noteMinimumBodyChars === 5001, 'PUBLICATION_QUOTA_INCOMPLETE');
assert(request.mode === 'completed' && request.totalTarget === 0 && Array.isArray(request.outstandingDates) && request.outstandingDates.length === 0, 'WINDOWS_REQUEST_INCOMPLETE');
assert(metrics.activeTargets?.total === 0 && metrics.activeTargets?.allDesignatedStrictVerified === true && metrics.evidence?.remainingDuplicateTitleGroups === 0, 'METRICS_INCOMPLETE');

console.log('REMOTE_THROUGH_SEP6_COMPLETE_OK previouslyLocked=9 reconciled=27 total=36 pending=0 duplicates=0 minNoteChars=5001');
